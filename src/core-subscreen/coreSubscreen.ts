import { autosetFontSize, BaseSubscreen, setFontSize } from "../ui";
import { StyleModule } from "../shard-modules";
import { Shard, ShardContext } from "../shards";
import { createElement, X } from "lucide";
import { createButton, createText } from "./shards";

export abstract class CoreSubscreen extends BaseSubscreen {
    private g = 40;
    private h = 0.05;
    private interval: number | null = null;

    public createExitButton(): void {
        createButton({
            x: 25,
            y: 25,
            width: 90,
            height: 90,
            anchor: "top-right",
            icon: createElement(X),
            onClick: () => {
                this.exit();
            }
        });
    }

    public createSubscreenTitle(): void {
        createText({
            x: 100,
            y: 60,
            text: this.name,
            fontSize: 8
        });
    }

    override onRun(): void {
        DrawRect(0, 0, 2000, 1000, "#008600ff");

        for (let x = 0; x <= 2000; x += this.g) {
            DrawRect(x, 0, 5, 1000, "#17a117ff");
        };

        for (let y = 0; y <= 1000; y += this.g) {
            DrawRect(0, y, 2000, 5, "#17a117ff");
        };
    };

    override onLoad(): void {
        this.g = 40;
        this.h = 0.05;

        this.interval = setInterval(() => {
            this.g += this.h;
            if (this.g >= 60) this.h = -0.05;
            if (this.g <= 40) this.h = 0.05;
        }, 50);
    };

    override unload(): void {
        super.unload();
        if (this.interval) clearInterval(this.interval);
    };
};
