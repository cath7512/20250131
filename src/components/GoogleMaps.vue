<template>
  <div id="map"></div>
</template>

<script>
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { createApp, h } from 'vue';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAP_ID } from '../constants/constants';
import { createWeatherForecastChart, createWeatherHistoryChart } from './WeatherGraph';
import { createEconomyChart } from './EconomyGraph';
import TabYoutube from './TabYoutube.vue';
import '../css/GoogleMaps.css';
import '../css/myPlanner.css';
import cities from '../assets/city.json';

export default {
  name: 'GoogleMaps',
  data() {
    return {
      openInfoWindow: null,
      lastActiveTab: 'weather',
      youTubeSearch: null
    };
  },
  mounted() {
    this.loadScript();
  },
  methods: {
    loadScript() {
      if (typeof google === 'object' && typeof google.maps === 'object') {
        this.initMap();
        return;
      }

      if (document.getElementById('google-maps-script')) {
        return;
      }

      window.initMap = this.initMap.bind(this);

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
        this.youTubeSearch = `${city.country_name} ${city.name}`;
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
              <button class="tab-button" data-tab="youtube">
                <img src="../assets/icons/youtube.svg" alt="유튜브 아이콘">
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
              <div class="tab-content" id="youtube">
                <div id="youtube-container"></div>
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
          tabButtons.forEach(btn => btn.classList.remove('active'));
          tabContents.forEach(content => {
            content.style.display = 'none';
            content.classList.remove('active');
          });

          button.classList.add('active');
          const targetContent = document.getElementById(button.dataset.tab);
          targetContent.style.display = 'block';
          targetContent.classList.add('active');

          this.lastActiveTab = button.dataset.tab;
          if (this.lastActiveTab === 'youtube') {
            this.mountYoutubeComponent();
          }
        });
      });

      const initialTab = document.querySelector(`.tab-button[data-tab="${this.lastActiveTab}"]`) || document.querySelector('.tab-button[data-tab="weather"]');
      initialTab.classList.add('active');

      const initialContent = document.getElementById(this.lastActiveTab) || document.getElementById('weather');
      initialContent.style.display = 'block';

      tabContents.forEach(content => {
        if (content !== initialContent) {
          content.style.display = 'none';
        }
      });
      if (this.lastActiveTab === 'youtube') {
        this.mountYoutubeComponent();
      }
    },
    mountYoutubeComponent() {
      const container = document.getElementById('youtube-container');
      if (container && this.youTubeSearch) {
        createApp({
          render: () => h(TabYoutube, {
            youTubeSearch: this.youTubeSearch
          })
        }).mount(container);
      }
    }
  }
};
</script>
