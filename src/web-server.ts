import { GracefulShutdownManager } from "@moebius/http-graceful-shutdown";
import bodyParser from "body-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import getPort from "get-port";
import http from "http";
import os from "os";
import { join, resolve } from "path";
import { writeError } from "./helpers/express-helpers";
import { appLog } from "./helpers/log";
import { getFileData, getServerInfo } from "./helpers/utility";
import { setupWebSocket } from "./websocket-server";
let shutdownManager: GracefulShutdownManager | undefined = undefined;

let PORT = 3000;

let server: http.Server | null = null;

(async () => {
  // Webserver will use 3000 if available, otherwise fall back to a random port
  PORT = await getPort({ port: 3000 });
})();

export interface ServerStatus {
  serverRunning: boolean;
  serverAddress: string;
}

export async function setupWebServer(
  ipAddress: string
): Promise<ServerStatus | undefined> {
  // Close the server if eventually it's already listening
  if (server !== null) server.close();

  const corsOptions = {
    origin: `*`
  };

  const app = express();

  app.use(cors());
  app.options("*", cors());

  // parse requests of content-type - application/json
  app.use(bodyParser.json());

  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));

  const httpServer = http.createServer(app);

  const clientAppFilePath =
    process.env.NODE_ENV === "production"
      ? join(process.resourcesPath, "client")
      : resolve("./public/client");

  app.use(express.static(clientAppFilePath));

  app.get("/", (req: Request, res: Response) => {
    try {
      res.sendFile(join(clientAppFilePath, "index.html"));
    } catch (error) {
      console.log("error:", error);
      res.json({ success: false, message: "Something went wrong" });
    }
  });

  app.get("/server-info", (req: Request, res: Response) => {
    try {
      res.json({
        serverAddress: `${ipAddress}:${PORT}`,
        serverName: getServerInfo()
      });
    } catch (error) {
      console.log("error:", error);
      res.json({ success: false, message: "Something went wrong" });
    }
  });

  app.get("/:fileName", async (req: Request, res: Response) => {
    if (!req.params.fileName) writeError(res, 400, "Bad Request");

    const fileData = getFileData(req.params.fileName);

    if (fileData) {
      res.type(fileData.mediaType);
      res.set("Content-Length", fileData.weightB.toString());
      res.write(fileData.binData);
    } else {
      res.status(404);
      res.send("404 Not Found");
    }
    res.end();
  });

  try {
    server = httpServer.listen(PORT, ipAddress);

    shutdownManager = new GracefulShutdownManager(server);

    appLog(
      "info",
      `🚀 Shacli webserver started and listening on http://${ipAddress}:${PORT}`
    );

    setupWebSocket(httpServer, `${ipAddress}:${PORT}`);

    return {
      serverRunning: true,
      serverAddress: `http://${ipAddress}:${PORT}`
    };
  } catch (error) {
    console.log("error:", error);
  }
}

export async function stopServer() {
  process.exit(os.constants.signals.SIGTERM);
}

process.on("SIGTERM", () => {
  if (!shutdownManager) return;
  shutdownManager.terminate(() => {
    appLog("info", "🚀 Shacli webserver is gracefully terminated");
  });
});

// setup().catch((err) => {
//   console.trace(err);
//   console.log("error", err.message);
//   process.exit(1);
// });
