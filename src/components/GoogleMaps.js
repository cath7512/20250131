/* global google */
import { GOOGLE_MAPS_API_KEY } from '../constants/constants';
import cities from '../assets/city.json';
import { GOOGLE_MAP_ID } from '../constants/constants'; // MAP_ID 추가

export function loadScript() {
  // 스크립트가 이미 로드되었는지 확인
  if (document.getElementById('google-maps-script')) {
    if (typeof google === 'object' && typeof google.maps === 'object') {
      initMap(); // google이 이미 정의되어 있다면 initMap 호출
      return;
    }
  }

  window.initMap = initMap; // 전역 함수로 등록

  const script = document.createElement('script');
  script.id = 'google-maps-script'; // 스크립트에 ID 추가
  script.src = `https://maps.googleapis.com/maps/api/js?loading=async&key=${GOOGLE_MAPS_API_KEY}&callback=initMap&libraries=marker`;
  script.defer = true;
  document.head.appendChild(script);
}

async function initMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 36.2048, lng: 127.1025 }, // 한국의 중심 좌표
    zoom: 3,
    mapId: GOOGLE_MAP_ID // AdvancedMarkerElement을 사용하기 위해 추가
  });

  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");  // 마커 객체 생성

  let openInfoWindow = null; // 열려 있는 InfoWindow를 추적하는 변수

  cities.forEach(city => {
    createMarker(city, map, AdvancedMarkerElement);
  });

  // 마커 생성
  function createMarker(city, map, AdvancedMarkerElement) {
    const div = document.createElement('div');
    div.innerHTML = `<div class="label">${city.name}</div>`;
    div.classList.add('custom-marker');

    const marker = new AdvancedMarkerElement({
      map,
      position: { lat: city.coordinates.lat, lng: city.coordinates.lng },
      content: div
    });

    const infoWindowContent = createInfoWindow(city);
    const infoWindow = new google.maps.InfoWindow({
      content: infoWindowContent
    });

    marker.addListener('click', () => {
      if (openInfoWindow) {
        openInfoWindow.close(); // 열려 있는 InfoWindow 닫기
      }
      infoWindow.open(map, marker);
      openInfoWindow = infoWindow; // 새로 열린 InfoWindow 저장
    });
  }

  // InfoWindow 생성
  function createInfoWindow(city) {
    const flagUrl = `/assets/country_flags/${city.code}.png`; // 국가 코드에 해당하는 국기 이미지 경로

    return `
      <div class="info-window">
        <p><img src="${flagUrl}" alt="${city.code} flag" style="width: 20px; height: auto; vertical-align: middle;"/>${city.country_name || 'N/A'}</p>
        <h3>${city.name}</h3>
      </div>
    `;
  }
}
