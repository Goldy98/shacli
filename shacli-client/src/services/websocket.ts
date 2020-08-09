import { Content } from "./types";
import { bus } from "../event-bus";

let websocket: WebSocket | null = null;

export function initWebsocket(serverAddress: string): void {
  if (websocket !== null) {
    return;
  }

  try {
    websocket = new WebSocket(`ws://${serverAddress}`);

    websocket.onopen = () => {
      console.log("Websocket Connection to server opened !");
    };

    websocket.onmessage = (data: any) => {
      try {
        const newContent: Content = JSON.parse(data.data);
        bus.$emit("newContent", newContent);
      } catch (error) {
        console.log("error:", error);
        websocket?.close();
        console.log(
          "Invalid websocket message received ! Connection has been shutdown"
        );
      }
    };

    websocket.onclose = function() {
      websocket!.onmessage = null;
      websocket = null;
    };

    websocket.onerror = (error) => {
      websocket!.onmessage = null;
      console.log("Websocket connection rejected !", error);
    };
  } catch (error) {
    websocket!.onmessage = null;
  }
}
