<template>
  <div class="home">
    <div
      class="d-flex flex-column flex-center align-content-center"
      id="home-container"
    >
      <div class="pb-1">
        <h3 class="text-white text-bold" id="app-title">Shacli</h3>
      </div>

      <!-- Start the server -->
      <div class="launch-button pt-5">
        <img src="@/assets/loading.svg" v-if="isLoading" alt srcset />

        <button class="btn" v-if="!isLoading" @click="startServer">
          <div class="btn2"></div>
          START
        </button>
      </div>

      <!-- Info section -->
      <div class="pt-5">{{ currentStep }}</div>

      <!-- Version section -->
      <div class="pt-5">
        Version
        <b
          >{{ appVersion }} by
          <a @click.prevent="openMyGithub" href="#">Aimé SAGBO</a></b
        >
      </div>
    </div>

    <sweet-modal
      ref="resultModal"
      width="350"
      title="Connect your mobile device"
      :blocking="true"
    >
      <h6 class="text-dark mb-3 mt-3">Scan this QR Code on your phone</h6>
      <div id="qrcode"></div>
      <h6 class="text-dark mt-3 mb-1">OR</h6>
      <h6 class="text-dark mb-3">Enter this url on your mobile browser</h6>
      <h4 class="text-black mb-3" id="server-address">
        {{ serverAddress }}
      </h4>
    </sweet-modal>

    <sweet-modal ref="errorModal" width="350" icon="error" title="Sorry !">
      <p class="text-black">{{ currentError }}</p>
    </sweet-modal>
  </div>
</template>

<script>
const electron = window.require("electron");
const remote = electron.remote;
const ipcRenderer = electron.ipcRenderer;
const shell = electron.shell;
import { SweetModal } from "sweet-modal-vue";
import store from "../store";
import router from "../router";
const QRCode = require("easyqrcodejs");
// @ is an alias to /src

const INITIAL_DATA = {
  ipAddress: "",
  message: "",
  isLoading: false,
  currentStep: "",
  appVersion: "1.0.1",
  currentError: undefined,
  serverAddress: undefined
};

export default {
  name: "Home",
  components: {
    SweetModal
  },
  data() {
    return {
      ipAddress: "",
      message: "",
      isLoading: false,
      currentStep: "",
      currentError: undefined,
      serverAddress: undefined,
      appVersion: remote.app.getVersion()
    };
  },
  methods: {
    sendMessage() {
      ipcRenderer.sendSync("send-ws-message", this.message);
    },
    startServer() {
      this.isLoading = true;
      this.currentStep = "Retrieving network data ...";
      this.ipAddress = ipcRenderer.sendSync("get-ip-address");
      if (this.ipAddress === undefined) {
        this.currentError =
          "No active network found. Please connect to a network first";
        this.$refs.errorModal.open();
        this.isLoading = false;
        this.currentStep = "";
        return;
      }

      this.currentStep = "Launching server ...";
      ipcRenderer.send("launch-webserver");
    },
    openMyGithub() {
      shell.openExternal("https://goldy98.github.io/");
    }
  },
  async mounted() {
    // Attach a listener for the webserver launch result
    ipcRenderer.on("webserver-launch-result", (event, args) => {
      // if we got a message in the callback args, then something went wrong, let inform user
      if (args.message) {
        this.currentError = args.message;
        this.$refs.errorModal.open();
        this.isLoading = false;
        this.currentStep = "";
        return;
      }
      //   // Here, we assume that server status data are returned via the args
      const { serverRunning, serverAddress } = args;
      this.currentStep = "Retrieving server address ...";
      if (serverRunning) {
        // Generate a QR Code with the server address
        document.getElementById("qrcode").innerHTML = "";
        new QRCode(document.getElementById("qrcode"), {
          text: serverAddress,
          logo: require("@/assets/icon.png"),
          width: 200,
          height: 200,
          logoBackgroundTransparent: true
        });
        this.serverAddress = serverAddress;
        store.dispatch.setWebServerAddress(serverAddress);
        this.$refs.resultModal.open();
        this.isLoading = false;
        this.currentStep = "";
      } else {
        this.currentError =
          "Sorry unable to launch the server ! Please try gain";
        this.$refs.errorModal.open();
        this.isLoading = false;
        this.currentStep = "";
      }
    });
    // Listen for client connection event
    ipcRenderer.on("client-connected", async (event, args) => {
      new Notification("Information", {
        body: "New device connected to server"
      });
      await store.dispatch.setClientDevice(args);

      if (this.$refs.resultModal && this.$refs.resultModal.is_open) {
        this.$refs.resultModal.close();
        router.push("/sharer");
      }
    });
    // Listen for webserver stop
    ipcRenderer.on("webserver-stopped", async () => {
      new Notification("Information", {
        body: `Webserver stopped !!!`
      });
      this.ipAddress = INITIAL_DATA.ipAddress;
      this.message = INITIAL_DATA.message;
      this.isLoading = INITIAL_DATA.isLoading;
      this.currentStep = INITIAL_DATA.currentStep;
      this.appVersion = INITIAL_DATA.appVersion;
      this.currentError = INITIAL_DATA.currentError;
      this.serverAddress = INITIAL_DATA.serverAddress;
      router.push("/");
    });
  }
};
</script>

<style scoped>
.home {
  height: 100vh;

  background: linear-gradient(
    135deg,
    hsla(216, 95%, 55%, 1) 0%,
    hsla(256, 100%, 16%, 1) 100%
  );
  color: white;
  font-family: "Lato", Arial, sans-serif;
}

#app-title {
  font-family: "Source Code Pro", Arial, sans-serif;
  font-weight: normal;
}

#home-container {
  height: 100%;
  justify-content: space-evenly;
}

.btn,
.btn2 {
  width: 200px;
  height: 200px;
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  line-height: 100px;
  color: rgba(255, 255, 255, 0.9);
  border-radius: 100%;
  background: linear-gradient(-45deg, #ffa63d, #ff3d77, #338aff, #3cf0c5);
  background-size: 600%;
  -webkit-animation: anime 16s linear infinite;
  animation: anime 16s linear infinite;
  transition: all 1s;
}
.btn:hover {
  color: white;
  box-shadow: 10px 10px 43px 0px rgba(4, 13, 202, 1);
}

.btn2 {
  position: absolute;
  margin-top: -120px;
  z-index: -1;
  -webkit-filter: blur(30px);
  filter: blur(30px);
  opacity: 0.8;
}

#server-address {
  color: black;
  font-weight: 900;
}

@-webkit-keyframes anime {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
@keyframes anime {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}
</style>
