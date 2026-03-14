#!/usr/bin/env python3
"""
Upload Canadian skilled trades wage data to Moorcheh 'wage-data' namespace.
Run: py -3.12 load_wage_data.py
"""

import logging
from app.services.moorcheh_service import MoorchehWageDataService

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Canadian skilled trades wage data (2025-2026 averages)
WAGE_DATA = [
    {"trade": "Electrician", "province": "ON", "location": "Ontario, Canada", "average_hourly": 32.50, "median_hourly": 33.00, "percentile_25": 27.00, "percentile_75": 39.00, "annual_salary": 67600, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Electrician", "province": "BC", "location": "British Columbia, Canada", "average_hourly": 34.00, "median_hourly": 34.50, "percentile_25": 28.50, "percentile_75": 41.00, "annual_salary": 70720, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Electrician", "province": "AB", "location": "Alberta, Canada", "average_hourly": 36.00, "median_hourly": 37.00, "percentile_25": 30.00, "percentile_75": 43.00, "annual_salary": 74880, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Plumber", "province": "ON", "location": "Ontario, Canada", "average_hourly": 34.00, "median_hourly": 34.50, "percentile_25": 28.00, "percentile_75": 40.00, "annual_salary": 70720, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Plumber", "province": "BC", "location": "British Columbia, Canada", "average_hourly": 35.50, "median_hourly": 36.00, "percentile_25": 29.50, "percentile_75": 42.00, "annual_salary": 73840, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Plumber", "province": "AB", "location": "Alberta, Canada", "average_hourly": 37.00, "median_hourly": 38.00, "percentile_25": 31.00, "percentile_75": 44.00, "annual_salary": 76960, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "HVAC Technician", "province": "ON", "location": "Ontario, Canada", "average_hourly": 30.75, "median_hourly": 31.00, "percentile_25": 25.50, "percentile_75": 36.00, "annual_salary": 63960, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "HVAC Technician", "province": "BC", "location": "British Columbia, Canada", "average_hourly": 32.00, "median_hourly": 32.50, "percentile_25": 27.00, "percentile_75": 38.00, "annual_salary": 66560, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "HVAC Technician", "province": "AB", "location": "Alberta, Canada", "average_hourly": 33.50, "median_hourly": 34.00, "percentile_25": 28.00, "percentile_75": 40.00, "annual_salary": 69680, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Carpenter", "province": "ON", "location": "Ontario, Canada", "average_hourly": 28.50, "median_hourly": 29.00, "percentile_25": 23.50, "percentile_75": 34.00, "annual_salary": 59280, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Carpenter", "province": "NAT", "location": "Canada (National)", "average_hourly": 28.50, "median_hourly": 29.00, "percentile_25": 23.00, "percentile_75": 34.50, "annual_salary": 59280, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Welder", "province": "ON", "location": "Ontario, Canada", "average_hourly": 28.00, "median_hourly": 28.50, "percentile_25": 23.00, "percentile_75": 33.00, "annual_salary": 58240, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Welder", "province": "AB", "location": "Alberta, Canada", "average_hourly": 32.00, "median_hourly": 33.00, "percentile_25": 27.00, "percentile_75": 38.00, "annual_salary": 66560, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Ironworker", "province": "NAT", "location": "Canada (National)", "average_hourly": 35.00, "median_hourly": 35.50, "percentile_25": 29.00, "percentile_75": 42.00, "annual_salary": 72800, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Heavy Equipment Operator", "province": "NAT", "location": "Canada (National)", "average_hourly": 32.00, "median_hourly": 32.50, "percentile_25": 26.50, "percentile_75": 38.00, "annual_salary": 66560, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Construction Laborer", "province": "NAT", "location": "Canada (National)", "average_hourly": 22.00, "median_hourly": 22.50, "percentile_25": 18.00, "percentile_75": 26.00, "annual_salary": 45760, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Roofer", "province": "NAT", "location": "Canada (National)", "average_hourly": 33.50, "median_hourly": 34.00, "percentile_25": 28.00, "percentile_75": 40.00, "annual_salary": 69680, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Painter", "province": "NAT", "location": "Canada (National)", "average_hourly": 26.00, "median_hourly": 26.50, "percentile_25": 21.50, "percentile_75": 31.00, "annual_salary": 54080, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Mason", "province": "NAT", "location": "Canada (National)", "average_hourly": 29.00, "median_hourly": 29.50, "percentile_25": 24.00, "percentile_75": 35.00, "annual_salary": 60320, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Pipefitter", "province": "NAT", "location": "Canada (National)", "average_hourly": 32.50, "median_hourly": 33.00, "percentile_25": 27.00, "percentile_75": 39.00, "annual_salary": 67600, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "General Contractor", "province": "NAT", "location": "Canada (National)", "average_hourly": 35.00, "median_hourly": 36.00, "percentile_25": 29.00, "percentile_75": 42.00, "annual_salary": 72800, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Mechanic", "province": "NAT", "location": "Canada (National)", "average_hourly": 31.00, "median_hourly": 31.50, "percentile_25": 25.50, "percentile_75": 37.00, "annual_salary": 64480, "source": "Statistics Canada / Job Bank 2025-2026"},
    {"trade": "Excavator Operator", "province": "NAT", "location": "Canada (National)", "average_hourly": 30.00, "median_hourly": 30.50, "percentile_25": 25.00, "percentile_75": 36.00, "annual_salary": 62400, "source": "Statistics Canada / Job Bank 2025-2026"},
]


def main():
    service = MoorchehWageDataService()
    if not service.client:
        logger.error("Moorcheh client not initialized. Check your API key!")
        return False

    logger.info(f"Uploading {len(WAGE_DATA)} wage data records to Moorcheh 'wage-data' namespace...")
    success = service.upload_wage_data(WAGE_DATA)

    if success:
        logger.info("All wage data uploaded successfully!")
    else:
        logger.error("Failed to upload wage data.")
    return success


if __name__ == "__main__":
    main()
