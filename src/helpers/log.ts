import { existsSync, appendFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

export function dateFormat(date: any, fstr: any, utc: any) {
  utc = utc ? "getUTC" : "get";
  return fstr.replace(/%[YmdHMS]/g, function(m: any) {
    switch (m) {
      case "%Y":
        return date[utc + "FullYear"](); // no leading zeros required
      case "%m":
        m = 1 + date[utc + "Month"]();
        break;
      case "%d":
        m = date[utc + "Date"]();
        break;
      case "%H":
        m = date[utc + "Hours"]();
        break;
      case "%M":
        m = date[utc + "Minutes"]();
        break;
      case "%S":
        m = date[utc + "Seconds"]();
        break;
      default:
        return m.slice(1); // unknown code, remove %
    }
    // add leading zero if required
    return ("0" + m).slice(-2);
  });
}

function formatError(
  errtype: "info" | "warning" | "error",
  message: string
): string {
  return `
  ${dateFormat(
    new Date(),
    "%Y-%m-%d %H:%M:%S",
    true
  )} -> ${errtype.toUpperCase()} ==> ${message}
  `;
}

export function appLog(
  severity: "info" | "warning" | "error",
  message: string
) {
  const logFilePath = join(tmpdir(), "shacli_log.log");

  if (!existsSync(logFilePath)) {
    appendFileSync(
      logFilePath,
      formatError("info", "Log file not found. It has been created")
    );
  }
  appendFileSync(logFilePath, formatError(severity, message));
}
