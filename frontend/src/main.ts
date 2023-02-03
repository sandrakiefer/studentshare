import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import vue3GoogleLogin from "vue3-google-login";

createApp(App)
  .use(router)
  .use(vue3GoogleLogin, {
    clientId:
      "405612571601-of13pcii57vjs7kjk4a2a9fbaagmjict.apps.googleusercontent.com",
  })
  .mount("#app");
