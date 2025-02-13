<template>
  <div id="app">
    <button id="menu-button" @click="toggleMenu">☰</button>
    <div id="menu" :class="{ show: menuVisible }">
      <router-link to="/planner"><button>일정표</button></router-link>
      <router-link to="/map"><button>지도</button></router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import './css/GoogleMaps.css'; 

export default {
  name: 'App',
  data() {
    return {
      menuVisible: false
    };
  },
  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    }
  }
}
</script>

<style>
#menu-button {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  background-color: #333;
  color: white;
  border: none;
  padding: 10px;
  font-size: 18px;
  cursor: pointer;
}

#menu {
  display: none;
  position: fixed;
  top: 50px;
  right: 10px;
  z-index: 1000;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

#menu.show {
  display: block;
}

#menu button {
  display: block;
  width: 100%;
  padding: 10px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
}

#menu button:hover {
  background-color: #f0f0f0;
}
</style>
