"use strict";

import { app, BrowserWindow, ipcMain, nativeImage, protocol } from "electron";
import installExtension, { VUEJS_DEVTOOLS } from "electron-devtools-installer";
import { existsSync, statSync } from "fs";
import { writeFile } from "fs-extra";
import { tmpdir } from "os";
import { basename, join, resolve } from "path";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { NetWorkInterface } from "./helpers/network";
import { Content, ProcessResult } from "./helpers/types";
import { saveToStorage } from "./tmp-storage";
import { ServerStatus, setupWebServer, stopServer } from "./web-server";
import { sendWsMessage } from "./websocket-server";

const isDevelopment = process.env.NODE_ENV !== "production";
const network = require("network");
let ipAddress: string | null = null;
let serverStatus: ServerStatus | undefined = undefined;

export const ressourcePath = process.resourcesPath;

// app.whenReady().then(() => {});

//Receive and reply to synchronous message
ipcMain.on("get-ip-address", async event => {
  network.get_active_interface(function(err: any, obj: NetWorkInterface) {
    if (!obj) {
      event.returnValue = undefined;
      return;
    }

    ipAddress = obj.ip_address;
    event.returnValue = ipAddress;
  });
});

ipcMain.on("launch-webserver", async event => {
  if (!ipAddress) {
    event.reply(
      "webserver-launch-result",
      new Error("Cannot launch webserver without network connection")
    );
    return;
  }

  serverStatus = await setupWebServer(ipAddress);

  event.reply("webserver-launch-result", serverStatus);
});

ipcMain.on("send-ws-message", (event, content: Content) => {
  if (!serverStatus || !serverStatus.serverRunning) {
    event.returnValue = new Error(
      "Server is not running, cannot send ws message"
    );
    return;
  }

  sendWsMessage(content);

  event.returnValue = true;
});

// Check if a string parameter is a file path
ipcMain.on("check-if-file-exist", (event, strTotest: string) => {
  event.returnValue = existsSync(strTotest) && statSync(strTotest).isFile();
});

// Get file info from a given path is a file path
ipcMain.on("get-file-name", (event, filePath: string) => {
  event.returnValue = basename(filePath);
});

// Save a buffer (got from clipboard) to the system tmpDir
ipcMain.on(
  "save-to-tmp",
  async (
    event,
    {
      bufferOrFilePath,
      fileName
    }: { bufferOrFilePath: Buffer | string; fileName: string }
  ) => {
    try {
      // const mayBeBuffer = Buffer.from(bufferOrFilePath);

      // If the provided data is a buffer, write it to tmpDir
      if (typeof bufferOrFilePath === "object") {
        await writeFile(tmpdir().concat(`/${fileName}`), bufferOrFilePath);
        saveToStorage(fileName, tmpdir().concat(`/${fileName}`));
      } else if (typeof bufferOrFilePath === "string") {
        // If it's a file path, save the file path to the storage
        saveToStorage(fileName, bufferOrFilePath);
      } else {
        throw new Error("Invalid data to save to tmpDir");
      }

      event.returnValue = {
        success: true,
        result: fileName
      } as ProcessResult;
    } catch (error) {
      event.returnValue = {
        success: false,
        message: "Something went wrong, unable to retrieve data from clipboard",
        error: error
      } as ProcessResult;
    }
  }
);

// Stop the web server
ipcMain.on("stop-server", event => {
  stopServer();
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

function createWindow() {
  // Get the app icon

  const ressourcePath =
    process.env.NODE_ENV === "production"
      ? process.resourcesPath
      : resolve("./public");

  const iconFilePath = join(ressourcePath, "icon.png");

  const appIcon = nativeImage.createFromPath(iconFilePath);

  // Create the browser window.
  win = new BrowserWindow({
    width: 400,
    height: 600,
    backgroundColor: "#2178f9",
    icon: appIcon,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });

  if (!isDevelopment) win.removeMenu();

  win.setResizable(false);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.on("closed", () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      console.error("Vue Devtools failed to install:", e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}

export function notifyClientConnection() {
  if (win) win.webContents.send("client-connected");
}
// export function getIpAddress() {
//   return ipAddress;
// }
