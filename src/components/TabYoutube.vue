<template>
    <div>
      <select id="youtube-category" class="youtube-category" v-model="selectedCategory">
        <option value="attractions">관광 명소</option>
        <option value="restaurants">식당</option>
        <option value="hotels">호텔</option>
        <!-- Add more categories as needed -->
      </select>
      <div class="youtube-videos" id="youtube-videos">
        <div v-for="video in videos" :key="video.url" class="video-container">
          <div class="video-wrapper">
            <iframe :src="`https://www.youtube.com/embed/${getVideoId(video.url)}`" width="300" height="200" frameborder="0" allowfullscreen></iframe>
          </div>
          <div class="video-info">
            <h4>{{ video.title }}</h4>
            <p>{{ video.channel }}</p>
            <p>{{ video.views }} • {{ video.uploadDate }}</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'TabYoutube',
    props: {
      youTubeSearch: String
    },
    data() {
      return {
        videos: [],
        selectedCategory: 'attractions' // Default category
      };
    },
    watch: {
      selectedCategory: {
        handler() {
          this.searchYoutubeVideos();
        },
        immediate: true // Search on component mount
      },
      youTubeSearch: {
        handler() {
          this.searchYoutubeVideos();
        },
        immediate: true
      }
    },
    mounted() {
      console.log("TabYoutube component mounted!");
      console.log("youTubeSearch:", this.youTubeSearch); // Check if cityName is being received
    },
    methods: {
      async searchYoutubeVideos() {
        const response = await fetch(`http://localhost:3000/scrapeYouTube?query=${encodeURIComponent(this.youTubeSearch)}%20${encodeURIComponent(this.selectedCategory)}`);
        if (!response.ok) {
          console.error('Error fetching videos:', response.statusText);
          return;
        }
        const data = await response.json();
        this.videos = data;
      },
      getVideoId(url) {
        const urlParams = new URLSearchParams(new URL(url).search);
        return urlParams.get('v');
      }
    }
  };
  </script>
  
  <style scoped>
  .youtube-category {
    width: 100px;
    padding: 8px;
    margin-bottom: 16px;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .youtube-videos {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 10px 0;
  }
  
  .video-container {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
  }
  
  .video-wrapper {
    width: 300px; /* Fixed width */
    height: 200px; /* Fixed height */
    overflow: hidden;
  }
  
  .video-wrapper iframe {
    width: 100%;
    height: 100%;
  }
  
  .video-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 10px;
  }
  </style>
  