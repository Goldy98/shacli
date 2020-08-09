<template>
  <div class="sharer">
    <div>
      <div class="app-header d-flex flex-row justify-content-between px-2 pt-3">
        <b class="text-white device-name pl-2">Shared Clipboard 😜</b>
        <a>
          <div class="icon icon-expand" @click="stopServer">
            <img src="@/assets/power.svg" alt="" srcset="" id="go-back" />
          </div>
        </a>
      </div>

      <div class="content pb-0 pl-3 pr-3 pt-3">
        <p>
          You can now paste data or drag files here and get them on your mobile
          phone !
        </p>

        <!-- The component to paste data (suppport: Image, Text, Url) -->
        <CopyPaster @newData="onNewData" />
        <!-- The component to paste data (suppport: Image, Text, Url) -->

        <p class="mt-2 text-left" id="history-section-title">
          <b>Transfer history</b>
        </p>
      </div>
    </div>

    <div id="transfer-list-container">
      <div id="transfer-list">
        <PastedContent
          v-for="content in pastedContents"
          :content="content"
          :key="content.contentId"
          @urlClick="openUrl"
        />
      </div>
    </div>
  </div>
</template>

<script>
const electron = window.require("electron");
const shell = electron.shell;
const ipcRenderer = electron.ipcRenderer;

import CopyPaster from "../components/CopyPaster";
import PastedContent from "../components/PastedContent";
export default {
  name: "Sharer",
  components: {
    CopyPaster,
    PastedContent
  },
  data() {
    return {
      pastedContents: []
    };
  },
  methods: {
    openUrl(url) {
      shell.openExternal(url);
    },
    onNewData(data) {
      this.pastedContents.unshift(data);
    },
    stopServer() {
      ipcRenderer.sendSync("stop-server");
    }
  }
};
</script>

<style>
.sharer {
  font-family: "Lato", Arial, sans-serif;
}

.device-name {
  font-size: 20px;
  font-weight: bold;
}

.app-header {
  height: 100px;
}

.content {
  height: 100%;
}

#go-back {
  transform: none;
  transition: all 0.2s;
  cursor: pointer;
  width: 20px;
  height: 20px;
}

#go-back:hover {
  transform: rotate(360deg) scale(1.2);
}

.content {
  position: relative;
  bottom: 30px;
  background-color: white;
  z-index: 10;
  border-top-left-radius: 30px;
  border-top-right-radius: 30px;
}

.icon-container {
  margin-top: 30px;
  width: 100%;
  height: 60px;
}

.icon {
  cursor: pointer;
  position: relative;
  display: inline-block;
  width: 40px;
  height: 40px;
  margin-left: 12px;
  margin-right: 12px;
  border-radius: 30px;
  overflow: hidden;
}
.icon::before,
.icon::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  -webkit-transition: all 0.25s ease;
  transition: all 0.25s ease;
  border-radius: 30px;
}
.icon img {
  position: relative;
  color: #ffffff;
  font-size: 30px;
  margin-top: 9px;
  -webkit-transition: all 0.25s ease;
  transition: all 0.25s ease;
}

.icon-expand::after {
  box-shadow: inset 0 0 0 1px #2178f9;
}
.icon-expand::before {
  background: #2178f9;
  box-shadow: inset 0 0 0 60px #050fc9;
}
.icon-expand:hover::before {
  box-shadow: inset 0 0 0 1px #050fc9;
}

#history-section-title {
  border-bottom: solid 1px rgba(0, 0, 0, 0.349);
}

#transfer-list-container {
  height: 53%;
  width: 100%;
  position: absolute;
  top: 44%;
}

#transfer-list {
  margin-left: 16px;
  margin-right: 16px;
  height: 100%;
  overflow: overlay;
}

#transfer-list::-webkit-scrollbar {
  display: none;
}
</style>
