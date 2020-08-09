import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/styles.css";
import store from "./store";
Vue.config.productionTip = false;

new Vue({
  router,
  store: store.original,
  render: h => h(App)
}).$mount("#app");

if (process.env.NODE_ENV === "production") router.push("/");
