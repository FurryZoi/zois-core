import { MOD_DATA } from "./index";

type LogLevel = "debug" | "log" | "warn" | "error";

interface LogEntry {
    level: LogLevel
    message: unknown[]
    timestamp: number
}

const logs: LogEntry[] = [];

class Logger {
    /**
    * Returns the list of all recorded log entries.
    */
    public get logs(): LogEntry[] {
        return logs;
    }

    private pushLog(level: LogLevel, message: unknown[]) {
        this.logs.push({
            level,
            message,
            timestamp: Date.now()
        });
        console[level](`%c${MOD_DATA.key}:`, "color: #00ffe7;", ...message);
    }

    /**
    * Logs a debug-level message.
    * @param message - The message arguments to log.
    */
    public debug(...message: unknown[]) {
        this.pushLog("debug", message);
    }

    /**
    * Logs a standard-level message.
    * @param message - The message arguments to log.
    */
    public log(...message: unknown[]) {
        this.pushLog("log", message);
    }

    /**
    * Logs a warning-level message.
    * @param message - The message arguments to log.
    */
    public warn(...message: unknown[]) {
        this.pushLog("warn", message);
    }

    /**
    * Logs an error-level message.
    * @param message - The message arguments to log.
    */
    public error(...message: unknown[]) {
        this.pushLog("error", message);
    }
}

/**
* Logger for collecting and outputting log messages with different severity levels.
* Logs are stored internally and also printed to the console with a colored prefix.
* 
* **USE ONLY IN BROWSER ENVIRONMENT**
*/
export const logger = new Logger();