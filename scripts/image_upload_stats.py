#!/usr/bin/env python3
"""
Image Upload Statistics Generator

This script generates a line graph showing the number of images uploaded by day
based on the detection_results table in the DeepSpearAI database.

Usage:
    python scripts/image_upload_stats.py [options]

Requirements:
    - matplotlib
    - seaborn (optional, for better styling)
    - psycopg2-binary
    - python-dotenv

The script reads database configuration from .env file or environment variables.
"""

import os
import sys
import psycopg2
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from collections import defaultdict
import argparse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_database_connection():
    """
    Establish connection to PostgreSQL database using environment variables.
    """
    try:
        # Try to get DATABASE_URL first (full connection string)
        database_url = os.getenv("DATABASE_URL")
        
        if database_url:
            conn = psycopg2.connect(database_url)
        else:
            # Fall back to individual parameters
            conn = psycopg2.connect(
                host=os.getenv("DB_HOST", "localhost"),
                port=os.getenv("DB_PORT", "5432"),
                database=os.getenv("DB_NAME", "deepspearai"),
                user=os.getenv("DB_USER"),
                password=os.getenv("DB_PASSWORD")
            )
        
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to database: {e}")
        print("Please make sure:")
        print("1. PostgreSQL is running")
        print("2. Database credentials are correct in .env file")
        print("3. Database 'deepspearai' exists")
        sys.exit(1)

def fetch_upload_data(conn, days_back=30):
    """
    Fetch upload counts by day from the detection_results table.
    
    Args:
        conn: Database connection
        days_back: Number of days to look back (default: 30)
    
    Returns:
        dict: Dictionary with date strings as keys and upload counts as values
    """
    cursor = conn.cursor()
    
    try:
        # Query to get daily upload counts (PostgreSQL syntax)
        query = """
        SELECT 
            DATE(created_at) as upload_date,
            COUNT(*) as upload_count
        FROM detection_results 
        WHERE created_at >= NOW() - INTERVAL %s
        GROUP BY DATE(created_at)
        ORDER BY upload_date;
        """
        
        cursor.execute(query, (f'{days_back} days',))
        results = cursor.fetchall()
        
        # Convert to dictionary
        upload_data = {}
        for date, count in results:
            upload_data[date.strftime('%Y-%m-%d')] = count
        
        return upload_data
        
    except psycopg2.Error as e:
        print(f"Error fetching data: {e}")
        return {}
    finally:
        cursor.close()

def fill_missing_dates(upload_data, days_back=30):
    """
    Fill in missing dates with zero counts to ensure continuous line graph.
    
    Args:
        upload_data: Dictionary with upload data
        days_back: Number of days to include
    
    Returns:
        dict: Complete upload data with all dates
    """
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=days_back-1)
    
    complete_data = {}
    current_date = start_date
    
    while current_date <= end_date:
        date_str = current_date.strftime('%Y-%m-%d')
        complete_data[date_str] = upload_data.get(date_str, 0)
        current_date += timedelta(days=1)
    
    return complete_data

def create_line_graph(upload_data, output_file=None, title_suffix=""):
    """
    Create a line graph showing daily upload counts.
    
    Args:
        upload_data: Dictionary with date strings as keys and counts as values
        output_file: Path to save the graph (optional)
        title_suffix: Additional text for the title
    """
    # Prepare data for plotting
    dates = []
    counts = []
    
    for date_str in sorted(upload_data.keys()):
        dates.append(datetime.strptime(date_str, '%Y-%m-%d').date())
        counts.append(upload_data[date_str])
    
    # Create the plot
    plt.figure(figsize=(12, 6))
    plt.plot(dates, counts, marker='o', linestyle='-', linewidth=2, markersize=4)
    
    # Customize the plot
    plt.title(f'Daily Image Uploads - DeepSpear AI{title_suffix}', fontsize=16, fontweight='bold')
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Number of Images Uploaded', fontsize=12)
    plt.grid(True, alpha=0.3)
    
    # Format x-axis dates
    plt.gca().xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
    plt.gca().xaxis.set_major_locator(mdates.DayLocator(interval=max(1, len(dates)//10)))
    plt.xticks(rotation=45)
    
    # Add some statistics as text
    total_uploads = sum(counts)
    avg_daily = total_uploads / len(counts) if counts else 0
    max_daily = max(counts) if counts else 0
    
    stats_text = f'Total: {total_uploads} | Avg/day: {avg_daily:.1f} | Max/day: {max_daily}'
    plt.figtext(0.02, 0.02, stats_text, fontsize=10, style='italic')
    
    # Adjust layout to prevent label cutoff
    plt.tight_layout()
    
    # Save or show the plot
    if output_file:
        plt.savefig(output_file, dpi=300, bbox_inches='tight')
        print(f"Graph saved to: {output_file}")
    else:
        plt.show()

def main():
    """Main function to generate the upload statistics graph."""
    parser = argparse.ArgumentParser(description='Generate image upload statistics graph')
    parser.add_argument('--days', '-d', type=int, default=30, 
                       help='Number of days to include in the graph (default: 30)')
    parser.add_argument('--output', '-o', type=str, 
                       help='Output file path (e.g., uploads_graph.png)')
    parser.add_argument('--title', '-t', type=str, default="",
                       help='Additional text for graph title')
    
    args = parser.parse_args()
    
    print(f"Generating upload statistics for the last {args.days} days...")
    
    # Connect to database
    conn = get_database_connection()
    print("Connected to database successfully!")
    
    try:
        # Fetch upload data
        upload_data = fetch_upload_data(conn, args.days)
        
        if not upload_data:
            print("No upload data found in the specified time period.")
            print("Make sure the detection_results table has data.")
            return
        
        print(f"Found data for {len(upload_data)} days with uploads.")
        
        # Fill in missing dates
        complete_data = fill_missing_dates(upload_data, args.days)
        
        # Create and display/save the graph
        title_suffix = f" - {args.title}" if args.title else ""
        create_line_graph(complete_data, args.output, title_suffix)
        
        # Print summary statistics
        total_uploads = sum(complete_data.values())
        days_with_uploads = sum(1 for count in complete_data.values() if count > 0)
        
        print(f"\nSummary:")
        print(f"  Total images uploaded: {total_uploads}")
        print(f"  Days with uploads: {days_with_uploads}/{args.days}")
        print(f"  Average per day: {total_uploads/args.days:.1f}")
        
    finally:
        conn.close()

if __name__ == "__main__":
    main()