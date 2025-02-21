<template>
    <div id="map"></div>
  </template>
  
  <script>
  import { GOOGLE_MAPS_API_KEY } from '../constants/constants';
  import { GOOGLE_MAP_ID } from '../constants/constants';
  import { createWeatherForecastChart, createWeatherHistoryChart } from './WeatherGraph';
  import { createEconomyCharts, updateWorldBankIndicator } from './EconomyGraph';  // updateWorldBankIndicator 추가

  import '../css/GoogleMaps.css';
  import '../css/myPlanner.css';
  import cities from '../assets/city.json';
  
  export default {
    name: 'GoogleMaps',
    data() {
        return {
        openInfoWindow: null,
        lastActiveTab: 'weather',
        lastWorldBankIndicator: 'CPI'  // 마지막 선택한 World Bank 지표 저장
        };
    },    
    mounted() {
      this.loadScript();
    },
    methods: {
      loadScript() {
        // Check if the script is ALREADY loaded
        if (typeof google === 'object' && typeof google.maps === 'object') {
            this.initMap(); // Initialize map if already loaded
            return;
        }
        
        if (document.getElementById('google-maps-script')) {
                return; // If script element exists, do nothing.  It's likely still loading.
        }
  
        window.initMap = this.initMap;
  
        const script = document.createElement('script');
        script.id = 'google-maps-script';
        script.src = `https://maps.googleapis.com/maps/api/js?loading=async&key=${GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=marker&units=metric`;
        script.defer = true;
        document.head.appendChild(script);
      },
      async initMap() {
        const mapElement = document.getElementById('map');
        if (!mapElement) return;
  
        const map = new google.maps.Map(mapElement, {
          center: { lat: 36.2048, lng: 127.1025 },
          zoom: 3,
          mapId: GOOGLE_MAP_ID
        });
  
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  
        cities.forEach(city => {
          this.createMarker(city, map, AdvancedMarkerElement);
        });
      },
      createMarker(city, map, AdvancedMarkerElement) {
        const div = document.createElement('div');
        div.innerHTML = `<div class="label">${city.name}</div>`;
        div.classList.add('custom-marker');
  
        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: city.coordinates.lat, lng: city.coordinates.lng },
          content: div
        });
  
        const infoWindowContent = this.createInfoWindow(city);
        const infoWindow = new google.maps.InfoWindow({
          content: infoWindowContent
        });
  
        marker.addListener('click', () => {
          if (this.openInfoWindow) {
            this.openInfoWindow.close();
          }
          infoWindow.open(map, marker);
          this.openInfoWindow = infoWindow;
          google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
            createWeatherForecastChart(city);
            createWeatherHistoryChart(city);
            createEconomyCharts(city);
            this.setupTabs();
            this.setupWorldBankSelect(city);
          });
        });
      },
      createInfoWindow(city) {
        const flagUrl = `/assets/country_flags/${city.code}.png`;
  
        return `
          <div class="info-window">
            <div class="header">
              <img src="${flagUrl}" alt="${city.code} flag" class="flag"/>
              &nbsp;<b>${city.country_name || 'N/A'}</b>&nbsp;&nbsp;${city.name}
            </div>
            <div class="content">
              <div class="tabs">
                <button class="tab-button active" data-tab="weather">
                  <img src="../assets/icons/weather.png" alt="날씨 아이콘">
                </button>
                <button class="tab-button" data-tab="economy">
                  <img src="../assets/icons/money.png" alt="경제 아이콘">
                </button>
                <button class="tab-button" data-tab="events">
                  <img src="../assets/icons/accident.png" alt="사건 아이콘">
                </button>
              </div>
              <div class="tab-contents">
                <div class="tab-content" id="weather">
                  <h3 class="chart-title">5 Days Forecast</h3>
                  <canvas id="weatherForecastChart" width="400" height="200"></canvas>
                  <br>
                  <h3 class="chart-title">2024 Weather History</h3>
                  <canvas id="weatherHistoryChart" width="400" height="300"></canvas>
                </div>
                <div class="tab-content" id="economy">
                  <h3 class="chart-title">GDP and Population</h3>
                  <canvas id="economyChart" width="400" height="300"></canvas>
                  <br>World Bank
                  <select id="worldBankIndicator" class="wb-select">
                    <option value="CPI">Consumer Price Index</option>
                    <option value="savings">Gross savings (% of GDP)</option>
                    <option value="internet">Individuals using the Internet (% of population)</option>
                    <option value="BirthRate">Birth rate, crude (per 1,000 people)</option>
                    <option value="AccessToElectricity">Access to electricity (% of population)</option>
                    <option value="SafeWaterAccess">People using safely managed drinking water services(% of population)</option>
                    <option value="ODAreceived">Net official development assistance and official aid received (current US$)</option>
                    <option value="NetMigration">Net migration</option>
                  </select>
                  <div class="chart-container">
                    <div id="worldbankChartLoading" class="chart-loading">
                      <div class="spinner"></div>
                    </div>
                    <canvas id="worldbankChart"></canvas>
                  </div>
                </div>
                <div class="tab-content" id="events">
                  <p>사건 정보가 여기에 표시됩니다.</p>
                </div>
              </div>
            </div>
          </div>
        `;
      },
      setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        // 먼저 모든 탭과 컨텐츠의 active 상태 제거
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => {
          content.style.display = 'none';
          content.classList.remove('active');
        });

        tabButtons.forEach(button => {
          button.addEventListener('click', () => {
            // 1. 모든 탭 버튼과 콘텐츠 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => {
              content.style.display = 'none';
              content.classList.remove('active');
            });

            // 2. 클릭한 탭 버튼과 콘텐츠 활성화
            button.classList.add('active');
            const targetContent = document.getElementById(button.dataset.tab);
            targetContent.style.display = 'block';
            targetContent.classList.add('active');

            // 3. 선택한 탭 저장
            this.lastActiveTab = button.dataset.tab;
          });
        });

        // 마지막으로 선택한 탭 활성화
        const activeTab = document.querySelector(`.tab-button[data-tab="${this.lastActiveTab}"]`);
        if (activeTab) {
          activeTab.classList.add('active');
          const activeContent = document.getElementById(this.lastActiveTab);
          if (activeContent) {
            activeContent.style.display = 'block';
            activeContent.classList.add('active');
          }
        }
      },
      setupWorldBankSelect(city) {
        const select = document.getElementById('worldBankIndicator');
        if (!select) return;

        // select 값을 마지막 선택한 값으로 설정
        select.value = this.lastWorldBankIndicator;

        select.addEventListener('change', async (event) => {
          const indicator = event.target.value;
          this.lastWorldBankIndicator = indicator;  // 선택한 값 저장
          updateWorldBankIndicator(city, indicator);
        });

        // 초기 차트 로드 - 마지막 선택한 지표 사용
        updateWorldBankIndicator(city, this.lastWorldBankIndicator);
      }
    }
  };
  </script>
