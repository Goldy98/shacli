import { FileData } from "./types";
import { readFileSync } from "fs";
import { appLog } from "./log";
import { retrieveFromStorage } from "@/tmp-storage";
import mime from "mime-types";
import { extname } from "path";
import os from "os";

export function isValidUrl(str: string) {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
    "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
    "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
    "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
    "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return pattern.test(str);
}

export function getFileData(fileName: string): FileData | undefined {
  try {
    const fileAccessPath = retrieveFromStorage(decodeURI(fileName));

    if (fileAccessPath) {
      const fileBuffer = readFileSync(fileAccessPath);
      const mediaType = mime.contentType(extname(fileAccessPath));

      if (!mediaType) throw new Error("Unable to retrieve file media types");

      return {
        binData: fileBuffer,
        fileName,
        mediaType: mediaType,
        weightB: fileBuffer.length
      };
    }
  } catch (error) {
    appLog("error", error);
  }
}

export function wait(ms: number): Promise<void> {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function getServerInfo() {
  return `${os.hostname()} | ${os.type()} ${os.arch()}`;
}
