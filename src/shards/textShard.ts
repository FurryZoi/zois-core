import { MOD_DATA } from "../index";
import { autosetFontSize, setFontFamily, setFontSize } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface TextShardContext extends ShardContext {
    text?: string
    fontSize?: number | "auto"
    color?: string
    withBackground?: boolean
    withBorder?: boolean
}

export class TextShard extends Shard<TextShardContext> {
    protected get defaultColor() {
        return "var(--tmd-text, black)";
    }

    override generateBody(): Record<keyof NonNullable<TextShardContext["modules"]>, HTMLElement | SVGElement> {
        const p = document.createElement("p");
        p.innerHTML = this.context.text ?? "";
        p.style.color = this.context.color ?? this.defaultColor;
        if (this.context.withBackground) p.style.background = "var(--tmd-element,rgb(239, 239, 239))";
        if (this.context.withBorder) p.style.border = "2px solid var(--tmd-accent, rgb(236, 236, 236))";
        setFontFamily(p, MOD_DATA.fontFamily);
        return {
            base: p
        }
    }

    override update(): void {
        super.update();
        if ((this.context.fontSize ?? "auto") === "auto") autosetFontSize(this.body!.base as HTMLElement);
        else if (typeof this.context.fontSize === "number") setFontSize(this.body!.base as HTMLElement, this.context.fontSize);
    }
}
