import { MOD_DATA } from "../modsApi";
import { Anchor, autosetFontSize, setFontFamily, setFontSize } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface ButtonShardContext extends ShardContext<"icon" | "text"> {
    text?: string
    fontSize?: number | "auto"
    style?: "default" | "green" | "inverted"
    icon?: string | SVGElement
    iconAbsolutePosition?: boolean
    tooltip?: {
        text: string
        position: "left" | "right"
    }
    onClick?: () => void
    isDisabled?: () => boolean
}

export class ButtonShard extends Shard<ButtonShardContext> {
    override generateBody(): Record<keyof NonNullable<ButtonShardContext["modules"]>, HTMLElement | SVGElement> {
        const { text, fontSize, width, height, padding, style, icon, iconAbsolutePosition = true, tooltip, onClick, isDisabled } = this.context;
        let iconElement: HTMLImageElement | SVGElement | undefined;
        let textElement: HTMLSpanElement | undefined;
        const btn = document.createElement("button");
        btn.classList.add("zcButton");
        btn.setAttribute("data-zc-style", style);
        btn.style.display = "flex";
        btn.style.alignItems = "center";
        btn.style.justifyContent = "center";
        btn.style.columnGap = "1.25vw";
        setFontFamily(btn, MOD_DATA.fontFamily);

        if (icon) {
            if (typeof icon === "string") {
                iconElement = document.createElement("img");
                iconElement.src = icon;
            } else {
                iconElement = icon;
            }
            iconElement.style.height = "80%";
            iconElement.style.width = "auto";
            if (text && iconAbsolutePosition) {
                iconElement.style.position = "absolute";
                iconElement.style.left = "1vw";
            }
            if (text && !iconAbsolutePosition) btn.style.justifyContent = "";
            btn.append(iconElement);
        }

        if (text) {
            textElement = document.createElement("span");
            textElement.textContent = text;
            // if (icon && !iconAbsolutePosition) {
            //     textElement.style.width = "100%";
            // }
            btn.append(textElement);
        }

        if (tooltip) {
            const tooltipEl = document.createElement("span");
            tooltipEl.classList.add("tooltip");
            tooltipEl.setAttribute("position", tooltip.position);
            tooltipEl.textContent = tooltip.text;
            btn.append(tooltipEl);
        }

        if (typeof isDisabled === "function" && isDisabled()) btn.classList.add("zcDisabled");
        btn.addEventListener("click", () => {
            if (typeof isDisabled === "function" && isDisabled()) return btn.classList.add("zcDisabled");
            if (typeof onClick === "function") onClick();
        });

        return {
            text: textElement!,
            icon: iconElement!,
            base: btn
        }
    }

    override update(): void {
        super.update();
        if ((this.context.fontSize ?? "auto") === "auto") autosetFontSize(this.body!.base as HTMLElement);
        else if (typeof this.context.fontSize === "number") setFontSize(this.body!.base as HTMLElement, this.context.fontSize);
    }
}
