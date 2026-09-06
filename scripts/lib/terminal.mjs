import chalk from "chalk";

export class Terminal {
    constructor(name) {
        this.name = name;
    }

    printMessage(level, message) {
        switch (level) {
            case "log":
                console[level](chalk.bgBlue(` ${this.name} `), ...message);
                break;
            case "warn":
                console[level](chalk.bgYellowBright(` ${this.name} `), ...message);
                break;
            case "error":
                console[level](chalk.bgRed(` ${this.name} `), ...message);
                break;
            case "debug":
                console[level](chalk.bgMagenta(` ${this.name} `), ...message);
                break;
        }
    }

    debug(...message) {
        this.printMessage("debug", message);
    }

    log(...message) {
        this.printMessage("log", message);
    }

    warn(...message) {
        this.printMessage("warn", message);
    }

    error(...message) {
        this.printMessage("error", message);
    }
}