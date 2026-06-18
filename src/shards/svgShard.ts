import { MOD_DATA } from "../modsApi";
import { Anchor, autosetFontSize, setFontFamily, setFontSize, setSize } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface SvgShardContext extends ShardContext {
    dataurl: string
    size: number
    fill?: string
    stroke?: string
    strokeWidth?: string
}

export class SvgShard extends Shard<SvgShardContext> {
    override generateBody(): Record<keyof NonNullable<SvgShardContext["modules"]>, SVGElement> {
        const { dataurl, size, fill = "var(--tmd-accent, black)", stroke = "var(--tmd-accent-hover, black)", strokeWidth = "2px" } = this.context;
        // dataurl = dataurl.replaceAll("&quot;", `"`);
        function dataURLToSVGElement(dataURL: string) {
            const svgEncoded = dataURL.replace('data:image/svg+xml,', '');
            const svgString = decodeURIComponent(svgEncoded);
            const div = document.createElement('div');
            div.innerHTML = svgString;

            return div.firstElementChild as SVGElement;
        }
        function recolorSVG(svgElement: Element, { fill, stroke }: { fill: string, stroke: string }) {
            const elements = svgElement.querySelectorAll('*');

            elements.forEach((element) => {
                if (element.getAttribute('fill') !== 'none') {
                    element.setAttribute('fill', fill);
                }

                if (element.getAttribute('stroke') !== 'none') {
                    element.setAttribute('stroke', stroke);
                }
            });

            if (svgElement.getAttribute('fill') !== 'none') {
                svgElement.setAttribute('fill', fill);
            }
            if (svgElement.getAttribute('stroke') !== 'none') {
                svgElement.setAttribute('stroke', stroke);
            }

            return svgElement;
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

    override update(): void {
        super.update();
        setSize(this.body!.base, this.context.size, this.context.size);
    }
}
