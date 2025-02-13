from imfpy import DataLoader

# 데이터 로더를 초기화합니다.
loader = DataLoader()

# 한국의 최근 10년간 1인당 GDP 데이터를 가져옵니다.
data = loader.get_data('KOR', 'NGDPDPC', 'A', start_year=2015, end_year=2024)

# 데이터를 출력합니다.
for entry in data['KOR']:
    year = entry['date']
    gdp_per_capita = entry['value']
    print(f"{year}년 한국의 1인당 GDP: {gdp_per_capita} 달러")
