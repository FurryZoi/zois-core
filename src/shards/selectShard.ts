import { MOD_DATA } from "../index";
import { addDynamicClass, autosetFontSize, DynamicClassStyles, onClickOutside, setFontFamily } from "../ui";
import { Shard, ShardContext } from "./shard";
import { Check, ChevronDown, createElement } from "lucide";

export interface SelectShardContext extends Omit<ShardContext, "height"> {
    options: {
        name: string
        text: string
        icon?: SVGElement
    }[]
    currentOption: string
    onChange?: (name: any) => void
    isDisabled?: () => boolean
}

export class SelectShard extends Shard<SelectShardContext> {
    protected get dynamicClassContainer(): DynamicClassStyles {
        return {
            base: {
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                columnGap: "0.5em",
                background: "var(--tmd-element, white)",
                color: "var(--tmd-text, black)",
                border: "2px solid var(--tmd-accent, rgb(34, 34, 34))",
                borderRadius: "0.4em",
                padding: "0.25em",
                boxSizing: "border-box",
                zIndex: "10"
            },
            "[opened=true]": {
                borderColor: "var(--tmd-accent-hover, rgb(0, 96, 223))"
            },
            "[opened=false]:hover": {
                borderColor: "var(--tmd-accent-hover, rgb(0, 96, 223))"
            },
            ">p": {
                margin: "0"
            },
            ">svg": {
                width: "1.25em",
                height: "1.25em",
                color: "var(--tmd-accent, rgb(0, 96, 223))"
            },
            ">div": {
                background: "var(--tmd-element, #f6f6f6)",
                boxShadow: "0px 0px 0.1em 0px black",
                borderRadius: "0.4em"
            },
            ">div>div": {
                color: "var(--tmd-text, black)",
                width: "100%",
                padding: "0.25em",
                boxSizing: "border-box",
                borderRadius: "0.4em"
            },
            ">div>div>svg": {
                width: "1.25em",
                height: "1.25em",
                color: "var(--tmd-accent, rgb(0, 96, 223))"
            },
            ">div>div:hover": {
                background: "var(--tmd-element-hover, #ededed)"
            }
        };
    }

    protected generateBody(): Record<keyof NonNullable<SelectShardContext["modules"]>, HTMLElement | SVGElement> {
        let { options, currentOption, x, y } = this.context;
        let isOpened = false;
        let optionsContainer: HTMLDivElement;

        const select = document.createElement("div");
        addDynamicClass(select, this.dynamicClassContainer);
        setFontFamily(select, MOD_DATA.fontFamily);
        select.setAttribute("opened", false);
        onClickOutside(select, () => {
            if (isOpened) {
                isOpened = false;
                select.setAttribute("opened", false);
                optionsContainer.remove();
            }
        });
        select.addEventListener("click", () => {
            if (this.context.isDisabled && this.context.isDisabled()) return select.classList.add("zcDisabled");
            if (isOpened) {
                isOpened = false;
                optionsContainer.remove();
            } else {
                isOpened = true;
                optionsContainer = document.createElement("div");
                const narrowViewport = window.matchMedia("(max-width: 768px)").matches;
                if (narrowViewport) {
                    optionsContainer.style.position = "fixed";
                    optionsContainer.style.left = "50%";
                    optionsContainer.style.top = "50%";
                    optionsContainer.style.transform = "translate(-50%, -50%)";
                    optionsContainer.style.width = "60%";
                    optionsContainer.style.fontSize = "28px";
                } else {
                    optionsContainer.style.position = "absolute";
                    optionsContainer.style.left = "0";
                    optionsContainer.style[typeof y === "number" && y > (500 - select.offsetHeight / 2) ? "bottom" : "top"] = "calc(100% + 0.45em)";
                    optionsContainer.style.width = "100%";
                }
                options.forEach((option) => {
                    const e = document.createElement("div");
                    e.style.cssText = "display: flex; align-items: center; column-gap: 0.5em;";
                    if (option.icon) {
                        option.icon.style.cssText = "color: #bcbcbc; flex-shrink: 0;";
                        e.append(option.icon);
                    }
                    const _label = document.createElement("span");
                    _label.style.overflow = "hidden";
                    _label.style.textOverflow = "ellipsis";
                    _label.style.width = "100%";
                    _label.textContent = option.text;
                    e.append(_label);
                    if (option.name === currentOption) {
                        e.append(checkmark);
                    }
                    e.addEventListener("click", () => {
                        currentOption = option.name;
                        label.textContent = option.text;
                        optionsContainer.remove();
                        if (this.context.onChange) this.context.onChange(option.name);
                    });
                    optionsContainer.append(e);
                });
                select.append(optionsContainer);
            }
            select.setAttribute("opened", isOpened);
        });

        const label = document.createElement("p");
        label.style.overflow = "hidden";
        label.style.textOverflow = "ellipsis";
        label.style.width = "100%";
        label.textContent = options.find((option) => option.name === currentOption)?.text ?? "";

        const arrow = createElement(ChevronDown);
        arrow.style.cssText = "flex-shrink: 0;";
        const checkmark = createElement(Check);
        checkmark.style.cssText = "flex-shrink: 0;";

        select.append(label, arrow);

        if (this.context.isDisabled && this.context.isDisabled()) select.classList.add("zcDisabled");

        return {
            base: select
        }
    }

    protected update(): void {
        super.update();
        autosetFontSize(this.body!.base as HTMLElement);
    }
}
