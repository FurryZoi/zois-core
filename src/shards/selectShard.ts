import { MOD_DATA } from "../index";
import { addDynamicClass, autosetFontSize, DynamicClassStyles, setFontFamily } from "../ui";
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
                background: "var(--tmd-element, white)",
                color: "var(--tmd-text, black)",
                border: "2px solid var(--tmd-accent, rgb(195, 195, 195))",
                borderRadius: "0.4em",
                padding: "0.25em",
                zIndex: "10"
            },
            "[opened=true]": {
                borderColor: "var(--tmd-accent-hover, rgb(0, 96, 223))"
            },
            "[opened=false]:hover": {
                borderColor: "var(--tmd-accent-hover, rgb(170, 170, 170))"
            },
            ">svg": {
                position: "absolute",
                right: "0.45em",
                top: "50%",
                transform: "translateY(-50%)",
                width: "1.5em",
                height: "1.5em",
                color: "var(--tmd-accent, rgb(0, 96, 223))"
            },
            ">div[data-zc-position='bottom']": {
                position: "absolute",
                top: "calc(100% + 0.45em)",
                left: "0",
                width: "100%",
                background: "var(--tmd-element, #f6f6f6)",
                border: "2px solid var(--tmd-element-hover, rgb(235 235 235))",
                borderRadius: "0.4em"
            },
            ">div[data-zc-position='top']": {
                position: "absolute",
                bottom: "calc(100% + 0.45em)",
                left: "0",
                width: "100%",
                background: "var(--tmd-element, #f6f6f6)",
                border: "2px solid var(--tmd-element-hover, rgb(235 235 235))",
                borderRadius: "0.4em"
            },
            ">div>div": {
                color: "var(--tmd-text, black)",
                width: "100%",
                padding: "0.25em",
                borderRadius: "0.25em"
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
    override generateBody(): Record<keyof NonNullable<SelectShardContext["modules"]>, HTMLElement | SVGElement> {
        let { options, currentOption, x, y } = CommonCloneDeep(this.context);
        let isOpened = false;
        let optionsContainer: HTMLDivElement;

        const select = document.createElement("div");
        addDynamicClass(select, this.dynamicClassContainer);
        setFontFamily(select, MOD_DATA.fontFamily);
        select.setAttribute("opened", false);
        select.addEventListener("click", () => {
            if (this.context.isDisabled && this.context.isDisabled()) return select.classList.add("zcDisabled");
            if (isOpened) {
                isOpened = false;
                optionsContainer.remove();
            } else {
                isOpened = true;
                optionsContainer = document.createElement("div");
                optionsContainer.setAttribute(
                    "data-zc-position",
                    typeof y === "number" && y > (500 - select.offsetHeight / 2) ? "top" : "bottom"
                );
                options.forEach((option) => {
                    const e = document.createElement("div");
                    e.style.cssText = "display: flex; align-items: center; column-gap: 0.5em;";
                    if (option.icon) {
                        option.icon.style.cssText = "color: #bcbcbc;";
                        e.append(option.icon);
                    }
                    e.append(option.text);
                    if (option.name === currentOption) {
                        e.append(checkmark);
                    }
                    e.addEventListener("click", () => {
                        currentOption = option.name;
                        p.textContent = option.text;
                        optionsContainer.remove();
                        if (this.context.onChange) this.context.onChange(option.name);
                    });
                    optionsContainer.append(e);
                });
                select.append(optionsContainer);
            }
        });

        const p = document.createElement("p");
        p.textContent = options.find((option) => option.name === currentOption)?.text ?? "";

        const arrow = createElement(ChevronDown);
        const checkmark = createElement(Check);
        checkmark.style.cssText = "position: absolute; right: 0.25em;";

        select.append(p, arrow);

        if (this.context.isDisabled && this.context.isDisabled()) select.classList.add("zcDisabled");

        return {
            base: select
        }
    }

    override update(): void {
        super.update();
        autosetFontSize(this.body!.base as HTMLElement);
    }
}
