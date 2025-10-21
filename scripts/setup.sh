#!/bin/bash
# Setup script for image upload analytics

set -e

echo "Setting up Image Upload Analytics..."

# Check if we're in the right directory
if [ ! -f "scripts/image_upload_stats.py" ]; then
    echo "Error: Please run this script from the DeepSpearAI root directory"
    exit 1
fi

echo "Installing required Python packages..."

# Install system packages
sudo apt update
sudo apt install -y python3-matplotlib python3-seaborn python3-psycopg2 python3-dotenv python3-tk

# Make the script executable
echo "Making script executable..."
chmod +x scripts/image_upload_stats.py

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Warning: .env file not found!"
    echo "Please copy .env.example to .env and fill in your database credentials:"
    echo "  cp .env.example .env"
    echo "  # Then edit .env with your database settings"
else
    echo ".env file found ✓"
fi

echo ""
echo "Setup complete! ✓"
echo ""
echo "You can now run the script with:"
echo "  python3 scripts/image_upload_stats.py"
echo ""
echo "Usage examples:"
echo "  # Generate graph for last 30 days (default)"
echo "  python3 scripts/image_upload_stats.py"
echo ""
echo "  # Generate graph for last 7 days"
echo "  python3 scripts/image_upload_stats.py --days 7"
echo ""
echo "  # Save graph to file"
echo "  python3 scripts/image_upload_stats.py --output uploads_chart.png"
echo ""
echo "  # Show help for all options"
echo "  python3 scripts/image_upload_stats.py --help"