import json

def transform_json(input_filename, output_filename):
    """Transforms a JSON file from object to array format."""
    try:
        with open(input_filename, 'r') as f:
            data = json.load(f)

        transformed_data = []
        for country_code, gdp_data in data.items():
            transformed_data.append({
                "country": country_code,
                "gdp_per_capita": gdp_data
            })

        with open(output_filename, 'w') as f:
            json.dump(transformed_data, f, indent=2)  # Use indent for readability

        print(f"Successfully transformed data to {output_filename}")

    except FileNotFoundError:
        print(f"Error: File '{input_filename}' not found.")
    except json.JSONDecodeError:
        print(f"Error: Invalid JSON format in '{input_filename}'.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# Usage:
input_file = r"C:\Users\user\Desktop\MOFA\20250131\src\assets\city_economy.json" # ABSOLUTE PATH
output_file = r"C:\Users\user\Desktop\MOFA\20250131\src\assets\city_economy_array.json" # ABSOLUTE PATH
transform_json(input_file, output_file)

