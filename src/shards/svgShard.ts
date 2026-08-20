import { recolorSVG, setSize } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface SvgShardContext extends ShardContext {
    dataurl: string
    size: number
    fill?: string
    stroke?: string
    strokeWidth?: string
}

export class SvgShard extends Shard<SvgShardContext> {
    protected generateBody(): Record<keyof NonNullable<SvgShardContext["modules"]>, SVGElement> {
        const { dataurl, size, fill = "var(--tmd-accent, black)", stroke = "var(--tmd-accent-hover, black)", strokeWidth = "2px" } = this.context;
        // dataurl = dataurl.replaceAll("&quot;", `"`);
        function dataURLToSVGElement(dataURL: string) {
            const svgEncoded = dataURL.replace('data:image/svg+xml,', '');
            const svgString = decodeURIComponent(svgEncoded);
            const div = document.createElement('div');
            div.innerHTML = svgString;

            return div.firstElementChild as SVGElement;
        }

        const svg = dataURLToSVGElement(dataurl);
        if (svg) {
            recolorSVG(svg, { fill, stroke });
            svg.setAttribute("stroke-width", strokeWidth);
        }

        return {
            base: svg
        };
    }

    protected update(): void {
        super.update();
        setSize(this.body!.base, this.context.size, this.context.size);
    }
}
