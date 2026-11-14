import { recolorSVG, setSize } from "../ui";
import { Shard, ShardContext } from "./base";

export interface SvgShardContext extends ShardContext {
    svg: string | SVGElement
    fill?: string
    stroke?: string
    strokeWidth?: string
    recolor?: boolean
}

export class SvgShard extends Shard<SvgShardContext> {
    protected render(): Record<keyof NonNullable<SvgShardContext["modules"]>, SVGElement> {
        const { svg, fill = "var(--tmd-accent, black)", stroke = "var(--tmd-accent-hover, black)", strokeWidth = "2px", recolor = true } = this.context;
        // dataurl = dataurl.replaceAll("&quot;", `"`);
        function dataURLToSVGElement(dataURL: string) {
            const svgEncoded = dataURL.replace('data:image/svg+xml,', '');
            const svgString = decodeURIComponent(svgEncoded);
            const div = document.createElement('div');
            div.innerHTML = svgString;

            return div.firstElementChild as SVGElement;
        }

        let svgElement: SVGElement;

        if (typeof svg === "string") {
            svgElement = dataURLToSVGElement(svg);
        } else {
            svgElement = svg;
        }

        if (recolor) recolorSVG(svgElement, { fill, stroke });
        svgElement.setAttribute("stroke-width", strokeWidth);

        return {
            base: svgElement
        };
    }
}
