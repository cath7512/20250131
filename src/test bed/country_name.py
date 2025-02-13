import json
import requests

# 국가명을 가져오기 위한 API URL
api_url = "https://restcountries.com/v3.1/alpha/"

# city.json 파일 읽기
with open('../assets/city.json', 'r', encoding='utf-8') as file:
    cities = json.load(file)

# 국가명을 추가하는 함수
def add_country_name(cities):
    for city in cities:
        country_code = city.get('code')
        if country_code:
            response = requests.get(f"{api_url}{country_code}")
            if response.status_code == 200:
                data = response.json()
                country_name = data[0].get('name', {}).get('common', '')
                city['country_name'] = country_name

                # code 속성 바로 뒤에 country_name 속성 추가
                code_index = list(city.keys()).index('code')
                city_items = list(city.items())
                city_items.insert(code_index + 1, ('country_name', country_name))
                city = dict(city_items)
                
                # city를 업데이트된 값으로 다시 설정
                for key in list(city.keys()):
                    if key != 'country_name':
                        city[key] = city.pop(key)

    return cities

# 국가명 속성을 추가한 데이터
updated_cities = add_country_name(cities)

# 업데이트된 데이터 저장
with open('city_updated.json', 'w', encoding='utf-8') as file:
    json.dump(updated_cities, file, ensure_ascii=False, indent=4)

print("Updated city.json file has been saved as city_updated.json")
