import requests
import json

def get_world_bank_population(country_code, year):
    url = f"https://api.worldbank.org/v2/countries/{country_code}/indicators/SP.POP.TOTL?date={year}&format=json"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        # More robust error handling for API response structure
        if not data or len(data) < 2 or not data[1]:  # Check for empty or malformed responses
            print(f"Warning: Invalid or empty API response for {country_code} in {year}")
            return None

        # Check if data is in the expected format
        for item in data[1]:
          if item.get('date') == str(year) and item.get('value'):
            return int(item['value'])

        print(f"Warning: No population data found for {country_code} in {year}")
        return None

    except requests.exceptions.RequestException as e:
        print(f"Error fetching population data for {country_code} in {year}: {e}")
        return None
    except (KeyError, IndexError, TypeError) as e:
        print(f"Error parsing API response for {country_code} in {year}: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None


# Load existing data
with open(r"C:\Users\konep\Desktop\MOFA\20250131\src\assets\city_economy.json", 'r') as f:
    city_economy_data = json.load(f)

# Fetch and add population data
years = range(2015, 2024)  # Years to fetch
for country in city_economy_data:
    country_code = country["country"]
    population_data = {}
    for year in years:
        population = get_world_bank_population(country_code, year)
        if population:
            population_data[year] = population
    country["population"] = population_data
    print(f"Added population data for: {country_code}")


# Save updated data
with open(r"C:\Users\konep\Desktop\MOFA\20250131\src\assets\city_economy.json", 'w') as f:
    json.dump(city_economy_data, f, indent=2)

print("city_economy.json updated successfully!")

