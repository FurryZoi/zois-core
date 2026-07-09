import { MOD_DATA } from "../index";
import { addDynamicClass, Anchor, autosetFontSize, DynamicClassStyles, setFontFamily, setFontSize } from "../ui";
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
    protected get dynamicClassButton(): DynamicClassStyles {
        return {
            base: {
                cursor: "pointer",
                background: "var(--tmd-element, white)",
                color: "var(--tmd-text, black)",
                border: "2px solid var(--tmd-accent, rgb(34, 34, 34))",
                borderRadius: "6px",
            },
            hover: {
                background: "var(--tmd-element-hover, #ebf7fe)",
                borderColor: "var(--tmd-accent-hover, #7dd3fc)",
                color: "var(--tmd-accent-hover, #015a8c)"
            },
            "> .tooltip": {
                position: "absolute",
                color: "black",
                textAlign: "center",
                padding: "4px",
                borderRadius: "4px",
                background: "#FFFF88",
                border: "2px solid #e7e787",
                width: "max-content",
                visibility: "hidden",
                zIndex: "10"
            },
            "> .tooltip[position=left]": {
                right: "calc(100% + 1vw)"
            },
            "> .tooltip[position=right]": {
                left: "calc(100% + 1vw)"
            },
            ":hover .tooltip": {
                visibility: "visible"
            },
            "[data-zc-style=green]": {
                background: "rgb(124, 255, 124)",
                borderColor: "rgb(82, 204, 82)",
                color: "black",
            },
            "[data-zc-style=green]:hover": {
                background: "rgb(94, 197, 94)",
                color: "black"
            },
            "[data-zc-style=inverted]": {
                background: "var(--tmd-accent, #303030)",
                border: "none",
                color: "var(--tmd-text, white)"
            },
            "[data-zc-style=inverted]:hover": {
                background: "var(--tmd-accent-hover, #474747)"
            }
        };
    }

    override generateBody(): Record<keyof NonNullable<ButtonShardContext["modules"]>, HTMLElement | SVGElement> {
        const { text, fontSize, width, height, padding, style, icon, iconAbsolutePosition = true, tooltip, onClick, isDisabled } = this.context;
        let iconElement: HTMLImageElement | SVGElement | undefined;
        let textElement: HTMLSpanElement | undefined;
        const btn = document.createElement("button");
        addDynamicClass(btn, this.dynamicClassButton);
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
