import http from "http";
import WebSocket from "ws";
import { notifyClientConnection } from "./background";
import { appLog } from "./helpers/log";
import { Content } from "./helpers/types";
let wss: WebSocket.Server | null = null;

let wsClient: WebSocket | null = null;

function removeBrokenConnection() {
  if (wss && wsClient !== null) {
    if (wsClient.readyState !== WebSocket.OPEN) {
      wsClient.terminate();
      wsClient = null;
      appLog(
        "info",
        "Inactive websocket client detected. Client connection has been terminated"
      );
    }
  }
}

export function setupWebSocket(httpServer: http.Server, serverAddress: string) {
  try {
    wss = new WebSocket.Server({
      server: httpServer
    });

    appLog(
      "info",
      `Websocket server ready and listening at ws://${serverAddress}`
    );

    wss.on("connection", function connection(ws) {
      wsClient = ws;

      appLog("info", `Client connected to websocket !`);

      notifyClientConnection();
    });

    // Each 10second check if the client connection is broken
    setInterval(removeBrokenConnection, 10000);
  } catch (error) {
    console.trace(error);
    appLog("error", error);
  }
}

export function sendWsMessage(content: Content): void {
  if (wsClient === null) return;

  wsClient.send(JSON.stringify(content), err => {
    if (err)
      appLog(
        "error",
        `Failed to send websocket message to client. Error: ${err}`
      );
  });
}
