<template>
    <div id="map"></div>
  </template>
  
  <script>
  /* global google */
  import { GOOGLE_MAPS_API_KEY } from '../constants/constants';
  import { GOOGLE_MAP_ID } from '../constants/constants';
  import { createWeatherForecastChart, createWeatherHistoryChart } from './WeatherGraph';
  import { createEconomyChart } from './EconomyGraph';

  import '../css/GoogleMaps.css';
  import '../css/myPlanner.css';
  import cities from '../assets/city.json';
  
  export default {
    name: 'GoogleMaps',
    data() {
        return {
        openInfoWindow: null,
        lastActiveTab: 'weather' // Remember the last active tab
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
            createEconomyChart(city);
            this.setupTabs();
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
                <button class="tab-button" data-tab="weather">
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
                    <canvas id="economyChart"></canvas>
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

            // Remember the last active tab
            this.lastActiveTab = button.dataset.tab;
          });
        });

        // 초기 탭 설정
        const initialTab = document.querySelector(`.tab-button[data-tab="${this.lastActiveTab}"]`) || document.querySelector('.tab-button[data-tab="weather"]');
        initialTab.classList.add('active'); // Activate the initial tab button
        
        const initialContent = document.getElementById(this.lastActiveTab) || document.getElementById('weather');
        initialContent.style.display = 'block'; // Show the initial tab content

        tabContents.forEach(content => {
          if (content !== initialContent) {
            content.style.display = 'none';  // Hide other tab contents
          }
        });
      }
    }
  };
  </script>
