import json
import pycountry

def get_iso3_code(alpha2_code):
    try:
        country = pycountry.countries.get(alpha_2=alpha2_code)
        return country.alpha_3
    except AttributeError:
        return 'Unknown'

# JSON 파일 읽기
with open('../assets/city.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 각 항목에 ISO3 코드값 추가
for item in data:
    country_code_alpha2 = item.get('code')
    if country_code_alpha2:
        item['iso3'] = get_iso3_code(country_code_alpha2)
    else:
        item['iso3'] = 'Unknown'  # 알 수 없는 국가 코드를 처리하는 방법

# 수정된 데이터를 기존 JSON 파일에 덮어쓰기
with open('../assets/city.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("ISO3 코드값이 추가된 JSON 파일이 저장되었습니다.")
