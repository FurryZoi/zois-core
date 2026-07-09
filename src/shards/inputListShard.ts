import { MOD_DATA } from "../index";
import { addDynamicClass, DynamicClassStyles, setFontFamily } from "../ui";
import { Shard, ShardContext } from "./shard";
import { createElement, RotateCcw, Trash2 } from "lucide";

export interface InputListShardContext<V extends number | string = number | string> extends ShardContext<"input"> {
    value?: V[];
    title?: string
    fontSize?: number | "auto"
    numbersOnly?: boolean
    onChange?: (value: V[]) => void
    isDisabled?: () => boolean
}

export class InputListShard extends Shard<InputListShardContext> {
    protected get dynamicClassContainer(): DynamicClassStyles {
        return {
            base: {
                display: "flex",
                flexDirection: "column",
                gap: "1vw",
                border: "2px solid var(--tmd-accent, black)",
                borderRadius: "4px",
                padding: "0.75vw",
                background: "var(--tmd-element, none)"
            },
            "> div:first-child": {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                columnGap: "0.75vw",
                width: "100%"
            },
            "> div:first-child > b": {
                fontSize: "clamp(10px, 2.4vw, 28px)",
                color: "var(--tmd-text, black)"
            },
            "> div:first-child > div:last-child": {
                display: "flex",
                columnGap: "0.75vw",
            },
            "> div:last-child": {
                display: "flex",
                gap: "0.25em",
                alignContent: "flex-start",
                flexWrap: "wrap",
                overflowY: "scroll",
                width: "100%"
            },
            "> div:last-child > div": {
                cursor: "pointer",
                background: "var(--tmd-element-hover, rgb(206, 206, 206))",
                color: "var(--tmd-text, black)",
                height: "fit-content",
                padding: "0.25em 0.45em",
                borderRadius: "0.25em",
                fontSize: "clamp(8px, 1.85vw, 24px)"
            },
        };
    }

    protected get dynamicClassInput(): DynamicClassStyles {
        return {
            base: {
                border: "none !important",
                outline: "none !important",
                background: "none !important",
                flexGrow: "1",
                width: "6vw",
                fontSize: "clamp(8px, 1.85vw, 20px)"
            }
        };
    }

    protected get dynamicClassToolsButton(): DynamicClassStyles {
        return {
            base: {
                cursor: "pointer",
                display: "grid",
                placeItems: "center",
                background: "var(--tmd-accent, #333)",
                color: "white",
                width: "2.5vw",
                aspectRatio: "1/1",
                borderRadius: "8px",
                border: "none"
            },
            hover: {
                background: "var(--tmd-accent-hover, #00c2cc)",
            }
        };
    }

    override generateBody(): Record<keyof NonNullable<InputListShardContext<number | string>["modules"]>, HTMLElement | SVGElement> {
        const { value, title, fontSize, numbersOnly, onChange, isDisabled } = this.context;
        const checkbox = document.createElement("div");
        const items: string[] = [];
        const div = document.createElement("div");
        addDynamicClass(div, this.dynamicClassContainer);
        setFontFamily(div, MOD_DATA.fontFamily);

        const headerElement = document.createElement("div");
        const toolsElement = document.createElement("div");

        const titleElement = document.createElement("b");
        titleElement.textContent = title + ":";

        const itemsElement = document.createElement("div");

        const input = document.createElement("input");
        addDynamicClass(input, this.dynamicClassInput);

        const addButton = (icon: SVGElement, onClick: () => void) => {
            const b = document.createElement("button");
            addDynamicClass(b, this.dynamicClassToolsButton);
            icon.style.cssText = "width: 80%; height: auto;";
            b.append(icon);
            b.addEventListener("click", onClick);
            toolsElement.append(b);
        }

        const addItem = (text: string) => {
            const item = document.createElement("div");
            item.textContent = text;
            itemsElement.insertBefore(item, input);
            item.addEventListener("click", (e) => {
                if (item.style.border === "") item.style.border = "2px solid red";
                else item.style.border = "";
                e.stopPropagation();
            });
            items.push(text);
        }

        addButton(createElement(RotateCcw), () => {
            if (typeof isDisabled === "function" && isDisabled()) return div.classList.add("zcDisabled");
            itemsElement.innerHTML = "";
            items.splice(0, items.length);
            itemsElement.append(input);
            value?.forEach((v) => addItem(String(v)));
            if (typeof onChange === "function") onChange(numbersOnly ? items.map((i) => parseInt(i)) : items);
        });
        addButton(createElement(Trash2), () => {
            if (typeof isDisabled === "function" && isDisabled()) return div.classList.add("zcDisabled");
            for (const c of [...itemsElement.children]) {
                if (c.getAttribute("style")?.includes("border: 2px solid red;")) {
                    items.splice(items.indexOf(c.textContent), 1);
                    c.remove();
                }
            }
            if (typeof onChange === "function") onChange(numbersOnly ? items.map((i) => parseInt(i)) : items);
        });
        if (typeof isDisabled === "function" && isDisabled()) div.classList.add("zcDisabled");
        input.addEventListener("keypress", (e) => {
            if (document.activeElement === input) {
                switch (e.key) {
                    case "Enter":
                        if (numbersOnly && Number.isNaN(parseInt(input.value))) return;
                        if (input.value.trim() === "") return;
                        if (
                            typeof isDisabled === "function" &&
                            isDisabled()
                        ) return div.classList.add("zcDisabled");
                        addItem(input.value);
                        input.value = "";
                        if (typeof onChange === "function") onChange(numbersOnly ? items.map((i) => parseInt(i)) : items);
                        break;
                }
            }
        });
        div.addEventListener("click", (e) => { if (e.currentTarget == div) input.focus() });
        headerElement.append(titleElement, toolsElement);
        itemsElement.append(input);
        div.append(headerElement, itemsElement);

        value?.forEach((v) => addItem(String(v)));
        return {
            base: div,
            input
        };
    }
}
