import { GeneralSubscreen } from "./generalSubscreen";
import { createButton, createMenu, createTerminal, createText } from "./shards";
import { saveSettings } from "../core";
import { ToastsSubscreen } from "./toastsSubscreen";
import { DevelopmentSubscreen } from "./developmentSubscreen";
import { StyleModule } from "../shard-modules";
import { createElement, X } from "lucide";
import { CoreSubscreen } from "./coreSubscreen";

export class MainSubscreen extends CoreSubscreen {
    private bootTerminalEl: HTMLDivElement | null = null;
    private contentElements: HTMLElement[] = [];

    override get name(): string {
        return "Zoi's Modding Core";
    };

    onLoad(): void {
        createText({
            x: 100,
            y: 150,
            text: "Here are all the experimental settings and settings for developing and debugging my mods.",
        });

        createMenu({
            x: 80,
            y: 300,
            width: 500,
            fontSize: 5,
            items: [
                {
                    text: "General",
                    onClick: () => {
                        this.setSubscreen(new GeneralSubscreen());
                    }
                },
                {
                    text: "Toasts",
                    onClick: () => {
                        this.setSubscreen(new ToastsSubscreen());
                    }
                },
                {
                    text: "Development",
                    onClick: () => {
                        this.setSubscreen(new DevelopmentSubscreen());
                    }
                }
            ]
        });

        createTerminal({
            x: 1050,
            y: 220,
            width: 850,
            height: 700,
            title: "kernel-boot",
            jobs: [
                { type: "cmd", text: "echo Building kernel" },
                { type: "out", text: "Building kernel" },
                { type: "cmd", text: "sudo /usr/local/bin/build-kernel --config=defconfig;" },
                { type: "timer", duration: 2000 },
                { type: "cmd", text: "kernel-control refresh --mode=live;" },
                { type: "timer", duration: 500 },
                { type: "cmd", text: "systemctl daemon-reexec;" },
                { type: "cmd", text: "echo Starting zois-core service" },
                { type: "out", text: "Starting zois-core service" },
                { type: "cmd", text: "systemctl start zois-core.service;" },
                { type: "timer", duration: 1000 },
                { type: "cmd", text: "USER_TELEMETRY=$(whoami; hostname; echo DE=$XDG_CURRENT_DESKTOP)" },
                { type: "cmd", text: "echo Sending telemetry to Microsoft" },
                { type: "out", text: "Sending telemetry to Microsoft" },
                { type: "cmd", text: "curl -X POST https://telemetry.microsoft.com/v2/collect -d \"$USER_TELEMETRY\"" },
                { type: "timer", duration: 2500 },
                { type: "cmd", text: "vim /var/log/syslog" },
                { type: "timer", duration: 500 },
                { type: "out", text: "\"/var/log/syslog\" [readonly] 12847 lines --0%--" },
                { type: "timer", duration: 100 },
                { type: "cmd", text: "echo Exiting vim" },
                { type: "out", text: "Exiting vim" },
                { type: "cmd", text: ":exit" },
                { type: "timer", duration: 100 },
                { type: "out", text: "E492: Not an editor command: exit" },
                { type: "timer", duration: 100 },
                { type: "cmd", text: "Ctrl+C" },
                { type: "timer", duration: 100 },
                { type: "out", text: "Type :quit<Enter> to exit Vim" },
                { type: "timer", duration: 100 },
                { type: "cmd", text: ":q!" },
                { type: "timer", duration: 100 },
                { type: "out", text: "E37: No write since last change (add ! to override)" },
                { type: "timer", duration: 100 },
                { type: "cmd", text: "ZQ" },
                { type: "timer", duration: 100 },
                { type: "out", text: "E492: Not an editor command: ZQ" },
                { type: "timer", duration: 100 },
                { type: "cmd", text: ":q" },
                { type: "timer", duration: 100 },
                { type: "out", text: "E37: No write since last change (add ! to override)" },
                { type: "timer", duration: 100 },
                { type: "cmd", text: "kill -9 %vim" },
                { type: "timer", duration: 100 },
                { type: "out", text: "bash: kill: %vim: no such job" },
                { type: "cmd", text: "echo Googling how to exit vim" },
                { type: "out", text: "Googling how to exit vim" },
                { type: "cmd", text: "firefox 'https://www.google.com/search?q=how+to+exit+vim'" },
                { type: "timer", duration: 3000 },
                { type: "out", text: "Top result: Stack Overflow — \"How to exit the Vim editor?\"" },
                { type: "timer", duration: 450 },
                { type: "out", text: "Accepted answer: press Esc, then type :q! and hit Enter" },
                { type: "timer", duration: 700 },
                { type: "cmd", text: "# back to vim…" },
                { type: "timer", duration: 400 },
                { type: "cmd", text: "<Esc>" },
                { type: "timer", duration: 300 },
                { type: "out", text: "-- NORMAL --" },
                { type: "timer", duration: 350 },
                { type: "cmd", text: ":q!" },
                { type: "timer", duration: 250 },
                { type: "cmd", text: "echo Booting completed" },
                { type: "out", text: "Booting completed" },
            ],
            onComplete: () => {
            }
        });
    }

    override exit(): void {
        super.exit();
        this.setSubscreen(null);
        PreferenceSubscreenExtensionsClear();
        saveSettings();
    };
};
