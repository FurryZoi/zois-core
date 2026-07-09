import { MOD_DATA } from ".";

type LogLevel = "debug" | "log" | "warn" | "error";

interface LogEntry {
    level: LogLevel
    message: unknown[]
    timestamp: number
}

const logs: LogEntry[] = [];

class Logger {
    get logs(): LogEntry[] {
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

    public debug(...message: unknown[]) {
        this.pushLog("debug", message);
    }

    public log(...message: unknown[]) {
        this.pushLog("log", message);
    }

    public warn(...message: unknown[]) {
        this.pushLog("warn", message);
    }

    public error(...message: unknown[]) {
        this.pushLog("error", message);
    }
}

export const logger = new Logger();