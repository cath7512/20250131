import requests
import json
from datetime import datetime
import os

# Determine the correct path to city.json
current_dir = os.path.dirname(os.path.abspath(__file__))
city_json_path = os.path.join(current_dir, '../assets/city.json')

# Load city names and their ISO country codes from city.json
with open(city_json_path, 'r') as file:
    cities = json.load(file)

# Initialize an empty dictionary to store the economy data
city_economy = {}

# Current year and the last 10 years range
current_year = datetime.now().year
start_year = current_year - 10
end_year = current_year - 1

# Iterate over each city and its ISO country code
for city in cities:
    iso_country_code = city['code']
    
    # World Bank API endpoint
    api_endpoint = f"https://api.worldbank.org/v2/country/{iso_country_code}/indicator/NY.GDP.PCAP.CD?date={start_year}:{end_year}&format=json"
    
    # Send API request
    response = requests.get(api_endpoint)
    
    try:
        # Parse JSON data
        data = response.json()
        
        # Initialize dictionary for this country's GDP per capita
        city_economy[iso_country_code] = {}
        
        # Extract and sort GDP per capita values by date
        gdp_per_capita_values = sorted(data[1], key=lambda x: x["date"])
        
        # Add GDP per capita values to the city's data
        for item in gdp_per_capita_values:
            year = item["date"]
            gdp = round(item["value"], 1) if item["value"] is not None else None
            city_economy[iso_country_code][year] = gdp
    
    except ValueError:
        print(f"Response content for {iso_country_code} is not valid JSON")
    except KeyError:
        print(f"Expected data not found in the response for {iso_country_code}")

# Write the economy data to city_economy.json
city_economy_json_path = os.path.join(current_dir, '../assets/city_economy.json')
with open(city_economy_json_path, 'w') as file:
    json.dump(city_economy, file, indent=4)

# Check if any API requests failed
if response.status_code != 200:
    print(f"API request failed with status code: {response.status_code}")
    print(f"Response content: {response.text}")
