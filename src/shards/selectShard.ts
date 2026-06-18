import { MOD_DATA } from "../modsApi";
import { Anchor, autosetFontSize, setFontFamily, setFontSize } from "../ui";
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
    override generateBody(): Record<keyof NonNullable<SelectShardContext["modules"]>, HTMLElement | SVGElement> {
        let { options, currentOption, x, y } = CommonCloneDeep(this.context);
        let isOpened = false;
        let optionsContainer: HTMLDivElement;

        const select = document.createElement("div");
        select.classList.add("zcSelect");
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
