# Image Upload Analytics

Generates a line graph showing the number of images uploaded by day based on the `detection_results` database table.

## Quick Start

1. **Install dependencies:**
   ```bash
   ./scripts/setup.sh
   ```

2. **Run the script:**
   ```bash
   python3 scripts/image_upload_stats.py
   ```

## Usage Examples

```bash
# Last 30 days (default)
python3 scripts/image_upload_stats.py

# Last 7 days
python3 scripts/image_upload_stats.py --days 7

# Save to file
python3 scripts/image_upload_stats.py --output uploads_chart.png

# Custom title
python3 scripts/image_upload_stats.py --days 14 --title "Bi-weekly Report" --output report.png

# All options
python3 scripts/image_upload_stats.py --help
```

## Output

The script generates:
- Line graph showing daily upload counts
- Summary statistics (total, average, max per day)
- Console output with key metrics

## Requirements

- PostgreSQL database with `detection_results` table
- `.env` file with database credentials
- Python 3.7+ with required libraries (installed by setup.sh)