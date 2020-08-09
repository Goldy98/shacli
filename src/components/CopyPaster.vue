<template>
  <div id="copy-paster">
    <div class="row">
      <div class="col-10">
        <textarea
          id="text-area"
          v-model.trim="currentInput"
          @contextmenu.prevent="showContextMenu"
          @paste="onPasteAttempt"
          @drop.prevent="onDropAttempt"
        ></textarea>
      </div>
      <div class="col-2">
        <!-- <button class="btn" id="btn-send">Send</button> -->

        <button
          class="button error"
          id="btn-send"
          ref="btn-send"
          @click="sendData"
          v-if="!isProcessingPasteEvent"
        >
          <img src="@/assets/send.svg" alt="" srcset="" />
        </button>
      </div>
    </div>

    <sweet-modal
      ref="imageToPasteModal"
      width="350"
      title="Image detected"
      :blocking="true"
    >
      <div
        class="p-2 d-flex flex-column align-items-center justify-content-center"
      >
        <img
          :src="imageToPaste"
          style="max-width: 100%; max-height: 380px; display: block;"
        />
        <button class="mt-2 mb-1 btn-send" @click="sendData">Send Image</button>
      </div>
    </sweet-modal>

    <sweet-modal
      ref="fileToPasteModal"
      id="fileToPasteModal"
      width="350"
      title="Files detected"
      :blocking="true"
    >
      <div
        class="row p-0 m-2"
        v-for="(file, index) in clippedFiles"
        :key="index"
      >
        <div class="col-2 p-0" v-if="file.contentType !== 'Image'">
          <img src="@/assets/files-icon.png" width="50" />
        </div>
        <div
          class="col-10 content-other-text-container"
          v-if="file.contentType !== 'Image'"
        >
          <b class="content-others-text">{{ file.contentText }}</b>
        </div>
        <div
          v-if="file.contentType === 'Image'"
          class="w-100 p-2 d-flex flex-column align-items-center justify-content-center"
        >
          <img
            :src="file.contentUrl"
            style="max-width: 100%; max-height: 380px; display: block;"
          />
        </div>
      </div>
      <button class="mt-2 mb-2 btn-send" @click="sendData">Send Files</button>
    </sweet-modal>
  </div>
</template>

<script>
const electron = window.require("electron");
const remote = electron.remote;
const { Menu } = remote;
const { clipboard } = electron;
const ipcRenderer = electron.ipcRenderer;
import { SweetModal } from "sweet-modal-vue";
import { isValidUrl, wait } from "../helpers/utility";
import { v4 as uuidv4 } from "uuid";
import store from "../store";
import { extname } from "path";

const INITIAL_CONTENT = {
  contentId: "",
  contentType: "Text",
  contentText: ""
};

export default {
  name: "CopyPaster",
  components: {
    SweetModal
  },
  data() {
    return {
      currentContent: INITIAL_CONTENT,
      currentInput: "",
      isProcessingPasteEvent: false,
      imageToPaste: null,
      webServerAddress: store.state.webServerAddress,
      clippedFiles: []
    };
  },
  methods: {
    resetState() {
      if (this.imageToPaste !== null) {
        this.$refs.imageToPasteModal.close();
        this.imageToPaste = null;
      }

      this.$refs.fileToPasteModal.close();

      this.isProcessingPasteEvent = false;
      this.currentContent = INITIAL_CONTENT;
      this.currentContent.contentText = "";
      this.currentInput = "";
      this.clippedFiles = [];
    },
    sendData() {
      if (this.currentInput !== "" && this.currentContent.contentText === "") {
        this.currentContent = {
          contentId: uuidv4(),
          contentType: "Text",
          contentText: this.currentInput.toString()
        };
      }

      // if the clippedFiles array is not empty, we send each file to the client
      if (this.clippedFiles.length > 0) {
        // We parse the content of the currentContent to remove Vue Watcher from it before sending it through the websocket
        this.clippedFiles.forEach(file => {
          const messageSent = ipcRenderer.sendSync(
            "send-ws-message",
            JSON.parse(JSON.stringify(file))
          );

          if (messageSent) {
            // And we send it as new pasted data (to add it to the transfer history)
            this.$emit("newData", JSON.parse(JSON.stringify(file)));

            // Reset the component state
            this.resetState();
            return;
          }
        });
      }

      if (this.currentContent.contentText === "") return;

      const messageSent = ipcRenderer.sendSync(
        "send-ws-message",
        JSON.parse(JSON.stringify(this.currentContent))
      );

      if (messageSent) {
        // And we send it as new pasted data (to add it to the transfer history)
        this.$emit("newData", JSON.parse(JSON.stringify(this.currentContent)));

        // Reset the component state
        this.resetState();
        return;
      }
    },
    showContextMenu() {
      const mainMenu = Menu.getApplicationMenu().items.filter(function(item) {
        return item.label == "Edit";
      })[0].submenu;
      mainMenu.popup(remote.getCurrentWindow());
    },
    async onPasteAttempt() {
      this.currentInput = "";
      await wait(10); // Wait for 10ms while vue update the currentInput data then process
      this.isProcessingPasteEvent = true;
      this.isProcessingPasteEvent = false;
      const contentFormats = clipboard.availableFormats();
      this.clippedFiles = [];

      // If clipboard content is image
      if (contentFormats.includes("image/png")) {
        // Process image contained in the clipboard
        const imageBuffer = clipboard.readBuffer("image/png");

        const saveImageResult = ipcRenderer.sendSync("save-to-tmp", {
          bufferOrFilePath: imageBuffer,
          fileName: uuidv4().concat(".png")
        });

        this.imageToPaste = `${this.webServerAddress}/${saveImageResult.result}`;

        this.currentContent = {
          contentId: uuidv4(),
          contentType: "Image",
          contentUrl: this.imageToPaste
        };

        this.$refs.imageToPasteModal.open();
        this.isProcessingPasteEvent = false;
        return;
      }

      // If clipboard content is text (maybe files)
      if (contentFormats.includes("text/plain")) {
        const content = clipboard.readText();

        // Check if file is an Url
        if (isValidUrl(content)) {
          this.currentContent = {
            contentId: uuidv4(),
            contentType: "Url",
            contentText: content
          };
          this.isProcessingPasteEvent = false;
          return;
        }

        // Split the copied content to check if multiple file are copied
        const splittedContent = content.split("\n");

        if (splittedContent.length > 0) {
          // If the splitted content is a file, we assume that the remaining splitted content are also files, and we process the entire splitted array
          if (ipcRenderer.sendSync("check-if-file-exist", splittedContent[0])) {
            splittedContent.forEach(content => {
              const isFile = ipcRenderer.sendSync(
                "check-if-file-exist",
                content
              );

              if (isFile) {
                // Proceed to file treatment
                const fileName = ipcRenderer.sendSync("get-file-name", content);

                const fileExtension = extname(fileName);

                ipcRenderer.sendSync("save-to-tmp", {
                  bufferOrFilePath: content,
                  fileName
                });

                // this.currentContent.contentText = fileName;

                // this.currentContent = {
                //   contentId: uuidv4(),
                //   contentType: [".jpg", ".jpeg", ".png"].includes(fileExtension)
                //     ? "Image"
                //     : "Others",
                //   contentUrl: `${this.webServerAddress}/${encodeURI(fileName)}`,
                //   contentText: fileName,
                // };

                this.clippedFiles.push({
                  contentId: uuidv4(),
                  contentType: [".jpg", ".jpeg", ".png"].includes(fileExtension)
                    ? "Image"
                    : "Others",
                  contentUrl: `${this.webServerAddress}/${encodeURI(fileName)}`,
                  contentText: fileName
                });

                console.log("this.clippedFiles:", this.clippedFiles);
              }
            });

            this.$refs.fileToPasteModal.open();
            this.isProcessingPasteEvent = false;
            return;
          }
        }

        if (contentFormats.includes("text/html")) {
          this.currentContent = {
            contentId: uuidv4(),
            contentType: "Text",
            contentText: clipboard.readHTML()
          };
          return;
        }

        this.currentContent = {
          contentId: uuidv4(),
          contentType: "Text",
          contentText: clipboard.readText()
        };
      }
    },
    async onDropAttempt(event) {
      event.preventDefault();

      this.clippedFiles = [];
      if (event.dataTransfer.files.length > 0) {
        for (const file of event.dataTransfer.files) {
          const filePath = file.path;
          const isFile = ipcRenderer.sendSync("check-if-file-exist", filePath);
          if (isFile) {
            // Proceed to file treatment
            const fileName = ipcRenderer.sendSync("get-file-name", filePath);
            const fileExtension = extname(fileName);

            ipcRenderer.sendSync("save-to-tmp", {
              bufferOrFilePath: filePath,
              fileName
            });

            this.clippedFiles.push({
              contentId: uuidv4(),
              contentType: [".jpg", ".jpeg", ".png"].includes(fileExtension)
                ? "Image"
                : "Others",
              contentUrl: `${this.webServerAddress}/${encodeURI(fileName)}`,
              contentText: fileName
            });
          }
        }

        this.$refs.fileToPasteModal.open();
        this.isProcessingPasteEvent = false;
        return;
      }
    }
  }
};
</script>

<style scoped>
#text-area {
  width: 100%;
  height: 55px;
  resize: none;
  border-radius: 10px;
  box-shadow: 10px 10px 35px -20px rgba(0, 0, 0, 0.75);
  outline: 0;
  border: solid 1px rgba(0, 0, 0, 0.349);
  padding: 5px;
  transition: all 1s ease;
}

#text-area:focus {
  outline: 0;
  border: solid 2px #050fc9;
}

#btn-send {
  /* background-color: #050fc9; */
  color: white;
  width: 50px;
  height: 50px;
  display: inline-block;
  background: #8bc34a;
  color: #fefefe;
  font-size: 1.2em;
  border-radius: 100%;
  text-align: center;
  position: relative;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  border: 0;
  right: 15px;
  top: 3px;
}

.btn-send {
  /* background-color: #050fc9; */
  color: white;
  display: inline-block;
  background: #8bc34a;
  color: #fefefe;
  font-size: 1.2em;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  border: 0;
  padding: 5px;
  font-weight: bold;
  text-transform: uppercase;
  transition: all 0.5s;
}

.btn-send,
#btn-send:focus {
  outline: 0;
}

.btn-send:focus {
  background: #52742b;
}

#btn-send img {
  transform: none;
  transition: all 1s;
}

#btn-send:focus img {
  transform: rotate(360deg);
}

.sweet-modal.is-mobile-fullscreen {
  height: 500px !important;
  display: none;
  bottom: 50px !important;
}
</style>
