import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import your custom global CSS file
import './assets/global.css'

// /* Google Maps API */  
// const script = document.createElement('script');
// script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY}&map_ids=f41a3f2d53c48eebef372bfa&libraries=maps,marker&loading=async&callback=initMap`;
// script.async = true;
// script.defer = true;
// document.head.appendChild(script);


const app = createApp(App)

app.use(router)

app.mount('#app')
