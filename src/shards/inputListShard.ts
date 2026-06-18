import { MOD_DATA } from "../modsApi";
import { Anchor, autosetFontSize, setFontFamily, setFontSize } from "../ui";
import { Shard, ShardContext } from "./shard";
import { StyleModule } from "../shard-modules";
import { CircleX, createElement, Trash2 } from "lucide";
import { ButtonShard } from "./buttonShard";

export interface InputListShardContext<V extends number | string = number | string> extends ShardContext<"input"> {
    value?: V[];
    title?: string
    fontSize?: number | "auto"
    numbersOnly?: boolean
    onChange?: (value: V[]) => void
    isDisabled?: () => boolean
}

export class InputListShard extends Shard<InputListShardContext> {
    override generateBody(): Record<keyof NonNullable<InputListShardContext<number | string>["modules"]>, HTMLElement | SVGElement> {
        const { value, title, fontSize, numbersOnly, onChange, isDisabled } = this.context;
        const checkbox = document.createElement("div");
        const items: string[] = [];
        const div = document.createElement("div");
        div.style.cssText = `
                display: flex; flex-direction: column; gap: 1vw; border: 2px solid var(--tmd-accent, black);
                border-radius: 4px; padding: 0.75vw; background: var(--tmd-element, none);
                `;
        setFontFamily(div, MOD_DATA.fontFamily);

        const buttonsElement = document.createElement("div");
        buttonsElement.style.cssText = "display: flex; justify-content: center; column-gap: 1vw; width: 100%;";

        const titleElement = document.createElement("b");
        titleElement.textContent = title + ":";
        titleElement.style.cssText = "width: 100%; font-size: clamp(10px, 2.4vw, 24px); color: var(--tmd-text, black);";

        const itemsElement = document.createElement("div");
        itemsElement.style.cssText = `display: flex; gap: 1vw; flex-wrap: wrap; align-content: flex-start;
                overflow-y: scroll;`;

        const input = document.createElement("input");
        input.style.cssText = "border: none; outline: none; background: none; height: fit-content; flex-grow: 1; padding: 0.8vw; width: 6vw; font-size: clamp(8px, 2vw, 20px);";

        const addButton = (icon: SVGElement, onClick: () => void) => {
            // const b = document.createElement("button");
            // b.style.cssText = "cursor: pointer; display: grid; place-items: center; background: var(--tmd-element-hover, #e0e0e0); width: 10%; max-width: 40px; aspect-ratio: 1/1; border-radius: 8px; border: none;";
            // icon.style.cssText = "width: 90%;";
            // b.append(icon);
            const shard = new ButtonShard({
                icon,
                onClick,
                style: "default",
                parent: buttonsElement,
                modules: {
                    icon: [
                        new StyleModule({
                            width: "70%",
                            height: "70%"
                        })
                    ],
                    base: [
                        new StyleModule({
                            width: "2em",
                            aspectRatio: "1/1"
                        })
                    ]
                }
            });
            shard.mount();
        }

        const addItem = (text: string) => {
            const item = document.createElement("div");
            item.style.cssText = "cursor: pointer; background: var(--tmd-element-hover, rgb(206, 206, 206)); color: var(--tmd-text, black); height: fit-content; padding: 0.8vw; border-radius: 0.8vw; font-size: clamp(8px, 2vw, 20px);";
            item.textContent = text;
            itemsElement.insertBefore(item, input);
            item.addEventListener("click", (e) => {
                if (item.style.border === "") item.style.border = "2px solid red";
                else item.style.border = "";
                e.stopPropagation();
            });
            items.push(text);
        }

        addButton(createElement(CircleX), () => {
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
        itemsElement.append(input);
        div.append(buttonsElement, titleElement, itemsElement);

        value?.forEach((v) => addItem(String(v)));
        return {
            base: div,
            input
        };
    }
}
