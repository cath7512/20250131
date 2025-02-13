import requests
import datetime
import calendar
import numpy as np
import json

# Example API call to fetch data (replace with actual API call)
def fetch_air_pollution_data(lat, lon, start, end, api_key):
    url = f"http://api.openweathermap.org/data/2.5/air_pollution/history?lat={lat}&lon={lon}&start={start}&end={end}&appid={api_key}"
    print(f"{url}")
    response = requests.get(url)
    data = response.json()
    return data['list']

# Function to calculate monthly averages
def calculate_monthly_averages(data):
    monthly_data = {month: [] for month in range(1, 13)}
    
    for record in data:
        timestamp = record['dt']
        date = datetime.datetime.fromtimestamp(timestamp, datetime.timezone.utc)
        month = date.month
        pollution_value = record['components']['pm2_5']  # Example pollutant (PM2.5)
        print(f"{month}, {date}, {pollution_value}")
        monthly_data[month].append(pollution_value)
    
    monthly_averages = {month: np.mean(values) if values else None for month, values in monthly_data.items()}
    return monthly_averages

# Load city data
with open('c:/Users/user/Desktop/MOFA/20250131/src/assets/city.json', 'r') as file:
    cities = json.load(file)

# Replace with actual start, end, and API key
start = int(datetime.datetime(2024, 1, 1).timestamp())
end = int(datetime.datetime(2024, 12, 31).timestamp())
api_key = '415058e69a7426c203df5456f6fff6d9'

# Fetch data and calculate monthly averages for each city
for city in cities:
    lat = city['coordinates']['lat']
    lon = city['coordinates']['lng']
    air_pollution_data = fetch_air_pollution_data(lat, lon, start, end, api_key)
    monthly_averages = calculate_monthly_averages(air_pollution_data)
    
    # Add monthly_air_quality data under the respective month in monthly_weather
    for month in range(1, 13):
        month_name = calendar.month_name[month]
        if month_name in city['monthly_weather']:
            city['monthly_weather'][month_name]['air_quality'] = round(monthly_averages[month], 1) if monthly_averages[month] is not None else None
    
    # Print city name after processing
    print(f"Processed city: {city['name']}")

# Save updated city data
with open('c:/Users/user/Desktop/MOFA/20250131/src/assets/city.json', 'w') as file:
    json.dump(cities, file, indent=4)

# Print results with one decimal place
for city in cities:
    print(f"City: {city['name']}, Country: {city['country_name']}")
    for month in range(1, 13):
        month_name = calendar.month_name[month]
        avg_value = city['monthly_weather'][month_name].get('air_quality')
        if avg_value is not None:
            print(f"  {month_name} 2024: {avg_value:.1f}")
        else:
            print(f"  {month_name} 2024: No data available")
