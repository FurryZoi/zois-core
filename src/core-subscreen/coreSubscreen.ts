import { BaseSubscreen } from "../ui";
import { CoreButtonShard } from "./shards/coreButtonShard";
import { StyleModule } from "../shard-modules";
import { ButtonShardContext, CheckboxShardContext, InputListShardContext, SelectShardContext, TextShardContext } from "../shards";
import { CoreCheckboxShard, CoreInputListShard, CoreSelectShard, CoreTextShard } from "./shards";


export abstract class CoreSubscreen extends BaseSubscreen {
    private g = 40;
    private h = 0.05;
    private interval: number | null = null;

    override run(): void {
        DrawRect(0, 0, 2000, 1000, "#008600ff");

        for (let x = 0; x <= 2000; x += this.g) {
            DrawRect(x, 0, 5, 1000, "#17a117ff");
        }

        for (let y = 0; y <= 1000; y += this.g) {
            DrawRect(0, y, 2000, 5, "#17a117ff");
        }
    }

    override load(): void {
        this.createText({
            x: 60,
            y: 40,
            text: this.name,
            fontSize: 6,
            modules: {
                base: [
                    new StyleModule({
                        fontWeight: "bold"
                    })
                ]
            }
        })

        this.createButton({
            anchor: "top-right",
            x: 40,
            y: 40,
            width: 90,
            height: 90,
            icon: "Icons/Exit.png",
            onClick: () => this.exit()
        });

        // Reset values
        this.g = 40;
        this.h = 0.05;

        this.interval = setInterval(() => {
            this.g += this.h;
            if (this.g >= 60) this.h = -0.05;
            if (this.g <= 40) this.h = 0.05;
        }, 50);
    }

    override createText(ctx: TextShardContext): HTMLParagraphElement {
        const shard = new CoreTextShard(ctx);
        const htmlElement = shard.mount() as HTMLParagraphElement;
        return htmlElement;
    }

    override createButton(ctx: ButtonShardContext): HTMLButtonElement {
        const shard = new CoreButtonShard(ctx);
        const htmlElement = shard.mount() as HTMLButtonElement;
        return htmlElement;
    }

    override createCheckbox(ctx: CheckboxShardContext): HTMLDivElement {
        const shard = new CoreCheckboxShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    override createInputList(ctx: InputListShardContext): HTMLDivElement {
        const shard = new CoreInputListShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    override createSelect(ctx: SelectShardContext): HTMLDivElement {
        const shard = new CoreSelectShard(ctx);
        const htmlElement = shard.mount() as HTMLDivElement;
        return htmlElement;
    }

    override unload(): void {
        super.unload();
        if (this.interval) clearInterval(this.interval);
    }
}