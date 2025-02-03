<template>
  <div id="app">
    <div id="map" style="height: 100vh; width: 100vw;"></div>
  </div>
</template>

<script>
import { loadScript } from './components/GoogleMaps';
import './css/GoogleMaps.css'; // CSS 파일을 import

export default {
  name: 'App',
  mounted() {
    loadScript();
  }
}
</script>
