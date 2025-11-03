import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'

// Import your custom global CSS file
import './assets/global.css'
import './assets/navbar.css'

/* Google Maps API */
(function() {
  const script = document.createElement('script');
  script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAP_API_KEY}&libraries=places,marker&v=weekly&callback=Function.prototype`;
  script.async = true;
  script.defer = true;
  document.head.appendChild(script);
})();

const app = createApp(App)

app.use(router)

app.mount('#app')
