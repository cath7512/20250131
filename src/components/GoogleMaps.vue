<template>
    <div id="map"></div>
  </template>
  
  <script>
  import { GOOGLE_MAPS_API_KEY } from '../constants/constants';
  import { GOOGLE_MAP_ID } from '../constants/constants';
  import { createWeatherForecastChart, createWeatherHistoryChart } from './WeatherGraph';
  import { createEconomyCharts, updateWorldBankIndicator } from './EconomyGraph_GDP_Population';
  import { createInterestInflationChart } from './EconomyGraph_InterestRate_Inflation';
  import { createWHOChart } from './EconomyGraph_WHO';
  import { createWTOChart } from './EconomyGraph_WTO';

  import '../css/GoogleMaps.css';
  import '../css/myPlanner.css';
  import cities from '../assets/city.json';
  
  export default {
    name: 'GoogleMaps',
    data() {
        return {
        openInfoWindow: null,
        lastActiveTab: 'weather',
        lastWorldBankIndicator: 'CPI',  // 마지막 선택한 World Bank 지표 저장
        lastEconomySection: 'summary',  // 마지막 선택한 economy 섹션 저장
        lastWTOIndicator: 'Merchandise' // 마지막 선택한 WTO 지표 저장
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
            createInterestInflationChart(city);
            this.setupTabs();
            this.setupWorldBankSelect(city);
            this.setupWHOSelect(city);
            this.setupWTOSelect(city);
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
                  <div class="economy-buttons">
                    <button class="economy-btn active" data-section="summary">Summary</button>
                    <button class="economy-btn" data-section="world-bank">World Bank</button>
                    <button class="economy-btn" data-section="who">WHO</button>
                    <button class="economy-btn" data-section="wto">WTO</button>
                  </div>
                  <div id="summary-section" class="economy-section">
                    <h3 class="chart-title">GDP, Population</h3>
                    <canvas id="economyChart" width="400" height="300"></canvas>
                    <h3 class="chart-title">Benchmart Interest Rate, Inflation</h3>
                    <div class="chart-container">
                      <div id="interestInflationChartLoading" class="chart-loading">
                        <div class="spinner"></div>
                      </div>
                      <canvas id="interestInflationChart" width="400" height="300"></canvas>
                    </div>
                  </div>
                  <div id="world-bank-section" class="economy-section" style="display: none;">
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
                  <div id="who-section" class="economy-section" style="display: none;">
                    <select id="whoIndicator" class="wb-select">
                      <option value="PVT-D">Domestic private health expenditure (PVT-D) per capita in US$</option>
                      <option value="ROAD_TRAFFIC_DEATH">Estimated road traffic death rate (per 100 000 population)</option>
                      <option value="FOODBORNE_ILLNESS">Foodborne illnesses per 100 000 (median, 95% uncertainty interval)</option>
                      <option value="NEONATAL_MORTALITY">Neonatal mortality rate (0 to 27 days) per 1000 live births) (SDG 3.2.2)</option>
                    </select>
                    <div class="chart-container">
                      <div id="whoChartLoading" class="chart-loading">
                        <div class="spinner"></div>
                      </div>
                      <canvas id="whoChart"></canvas>
                    </div>
                  </div>
                  <div id="wto-section" class="economy-section" style="display: none;">
                    <select id="wtoIndicator" class="wb-select">
                      <option value="Merchandise">Merchandise imports/exports by product group (Million US dollar)</option>
                      <option value="Country">Import/Export by Country (Million US dollar)</option>
                    </select>
                    <div class="chart-container">
                      <div id="wtoChartLoading" class="chart-loading">
                        <div class="spinner"></div>
                      </div>
                      <canvas id="wtoChart"></canvas>
                    </div>
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

        tabButtons.forEach(button => {
          button.addEventListener('click', () => {
            // 1. 모든 탭 버튼과 콘텐츠 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => {
              content.style.display = 'none'; // display: none으로 설정
              content.classList.remove('active');
            });

            // 2. 클릭한 탭 버튼과 콘텐츠 활성화
            button.classList.add('active');
            const targetContent = document.getElementById(button.dataset.tab);
            targetContent.style.display = 'block'; // display: block으로 설정
            targetContent.classList.add('active');

            // 3. 선택한 탭 저장
            this.lastActiveTab = button.dataset.tab;
          });
        });

        // 초기 탭 설정
        const weatherTab = document.querySelector('.tab-button[data-tab="weather"]');
        weatherTab.classList.add('active'); // weather 탭 버튼 활성화
        
        const weatherContent = document.getElementById('weather');
        weatherContent.style.display = 'block'; // weather 탭 콘텐츠 표시

        tabContents.forEach(content => {
          if (content !== weatherContent) {
            content.style.display = 'none';  // 다른 탭 콘텐츠 숨기기
          }
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

        // Economy section buttons handler
        const economyButtons = document.querySelectorAll('.economy-btn');
        const economySections = document.querySelectorAll('.economy-section');

        // Set initial active button based on lastEconomySection
        const initialActiveButton = document.querySelector(`.economy-btn[data-section="${this.lastEconomySection}"]`);
        if (initialActiveButton) {
          economyButtons.forEach(btn => btn.classList.remove('active'));
          initialActiveButton.classList.add('active');
          
          // Show the corresponding section
          economySections.forEach(section => section.style.display = 'none');
          const initialSection = document.getElementById(`${this.lastEconomySection}-section`);
          if (initialSection) {
            initialSection.style.display = 'block';
          }
        }

        economyButtons.forEach(button => {
          button.addEventListener('click', () => {
            // Remove active class from all buttons
            economyButtons.forEach(btn => btn.classList.remove('active'));
            // Hide all sections
            economySections.forEach(section => section.style.display = 'none');

            // Add active class to clicked button
            button.classList.add('active');
            // Show corresponding section
            const sectionId = `${button.dataset.section}-section`;
            const section = document.getElementById(sectionId);
            if (section) {
              section.style.display = 'block';
            }
            // Save the selected section
            this.lastEconomySection = button.dataset.section;
          });
        });
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
      },
      setupWHOSelect(city) {
        const select = document.getElementById('whoIndicator');
        if (!select) return;
  
        // select 값을 마지막 선택한 값으로 설정
        select.value = this.lastWHOIndicator;
  
        select.addEventListener('change', async (event) => {
          const indicator = event.target.value;
          this.lastWHOIndicator = indicator;  // 선택한 값 저장
          createWHOChart(city, indicator);
        });
  
        // 초기 차트 로드 - 마지막 선택한 지표 사용
        createWHOChart(city, this.lastWHOIndicator);
      },
      setupWTOSelect(city) {
        const select = document.getElementById('wtoIndicator');
        if (!select) return;
  
        // select 값을 마지막 선택한 값으로 설정
        select.value = this.lastWTOIndicator;
  
        select.addEventListener('change', async (event) => {
          const indicator = event.target.value;
          this.lastWTOIndicator = indicator;  // 선택한 값 저장
          createWTOChart(city, indicator);
        });
  
        // 초기 차트 로드 - 마지막 선택한 지표 사용
        createWTOChart(city, this.lastWTOIndicator);
      }
    }
  };
  </script>
