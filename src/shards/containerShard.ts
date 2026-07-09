import { MOD_DATA } from "../index";
import { Anchor, autosetFontSize, setFontFamily, setFontSize } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface ContainerShardContext extends ShardContext {
    scroll?: "x" | "y" | "all" | "auto"
}

export class ContainerShard extends Shard<ContainerShardContext> {
    override generateBody(): Record<keyof NonNullable<ContainerShardContext["modules"]>, HTMLElement | SVGElement> {
        const container = document.createElement("div");
        if (this.context.scroll === "all") container.style.overflow = "scroll";
        if (this.context.scroll === "x") container.style.overflowX = "scroll";
        if (this.context.scroll === "y") container.style.overflowY = "scroll";
        if (this.context.scroll === "auto") container.style.overflow = "auto";
        return {
            base: container
        };
    }
}
