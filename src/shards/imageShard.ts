import { Shard, ShardContext } from "./shard";

export interface ImageShardContext extends ShardContext {
    src: string
}

export class ImageShard extends Shard<ImageShardContext> {
    override generateBody(): Record<keyof NonNullable<ImageShardContext["modules"]>, HTMLElement | SVGElement> {
        const { width, height, src } = this.context;
        const img = document.createElement("img");
        img.style.height = "auto";
        img.src = src;

        return {
            base: img
        }
    }
}
