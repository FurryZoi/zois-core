import { createElement, ExternalLink } from "lucide";
import { MOD_DATA } from "../index";
import { addDynamicClass, autosetFontSize, DynamicClassStyles, setFontFamily, setFontSize } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface ButtonShardContext extends ShardContext<"icon" | "text"> {
    text?: string
    fontSize?: number | "auto"
    variant?: "outlined" | "filled"
    icon?: string | SVGElement
    iconAbsolutePosition?: boolean
    tooltip?: {
        text: string
        position: "left" | "right"
    }
    href?: string
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
                color: "var(--tmd-text, black)",
                textAlign: "center",
                padding: "0.3em 0.6em",
                borderRadius: "4px",
                background: "var(--tmd-element-hint, #e6e6e6)",
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
            "[data-zc-variant=filled]": {
                background: "var(--tmd-accent, #111)",
                border: "2px solid var(--tmd-accent, #111)",
                color: "var(--tmd-text, white)"
            },
            "[data-zc-variant=filled]:hover": {
                background: "var(--tmd-accent-hover, none)",
                color: "var(--tmd-text, black)"
            },
            "> .external-link-icon": {
                display: "flex",
                columnGap: "0.25em",
                position: "absolute",
                right: "-0.25em",
                top: "-0.25em",
                width: "0.75em",
                height: "0.75em",
                background: "var(--tmd-accent, #5b5bff)",
                color: "var(--tmd-text, white)",
                padding: "0.1em",
                borderRadius: "50%",
            },
            ":hover > .external-link-icon": {
                minWidth: "fit-content",
                padding: "0.1em 0.25em",
                borderRadius: "0.5em",
                bottom: "calc(100% + 0.25em)",
                top: "unset",
            },
            "> .external-link-icon > span": {
                display: "none",
                fontSize: "0.5em",
                whiteSpace: "nowrap"
            },
            ":hover > .external-link-icon > span": {
                display: "inline"
            }
        };
    }

    override generateBody(): Record<keyof NonNullable<ButtonShardContext["modules"]>, HTMLElement | SVGElement> {
        const { text, variant, icon, iconAbsolutePosition = true, tooltip, href, onClick, isDisabled } = this.context;
        let iconElement: HTMLImageElement | SVGElement | undefined;
        let textElement: HTMLSpanElement | undefined;
        const btn = document.createElement("button");
        addDynamicClass(btn, this.dynamicClassButton);
        btn.setAttribute("data-zc-variant", variant);
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
            textElement.style.overflow = "auto";
            textElement.style.padding = "0.08em";
            textElement.style.maxHeight = "100%";
            btn.append(textElement);
        }

        if (tooltip) {
            const tooltipEl = document.createElement("span");
            tooltipEl.classList.add("tooltip");
            tooltipEl.setAttribute("position", tooltip.position);
            tooltipEl.textContent = tooltip.text;
            btn.append(tooltipEl);
        }

        if (href) {
            const externalLinkContainer = document.createElement("div");
            externalLinkContainer.classList.add("external-link-icon");
            const externalLinkIcon = createElement(ExternalLink);
            externalLinkIcon.style.width = "auto";
            externalLinkIcon.style.height = "100%";
            const externalLinkLabel = document.createElement("span");
            externalLinkLabel.textContent = href;
            externalLinkContainer.append(externalLinkIcon, externalLinkLabel);
            btn.append(externalLinkContainer);
        }

        if (typeof isDisabled === "function" && isDisabled()) btn.classList.add("zcDisabled");
        btn.addEventListener("click", () => {
            if (typeof isDisabled === "function" && isDisabled()) return btn.classList.add("zcDisabled");
            if (typeof onClick === "function") onClick();
            if (href) window.open(href, "_blank", "noopener,noreferrer");
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
