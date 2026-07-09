import { MOD_DATA } from "../index";
import { Anchor, autosetFontSize, setFontFamily, setFontSize } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface InputShardContext extends ShardContext {
    value?: string
    placeholder?: string
    textArea?: boolean
    fontSize?: number | "auto"
    onChange?: () => void
    onInput?: () => void
    isDisabled?: () => boolean
}

export class InputShard extends Shard<InputShardContext> {
    override generateBody(): Record<keyof NonNullable<InputShardContext["modules"]>, HTMLElement | SVGElement> {
        const { textArea, placeholder, value, isDisabled, onChange, onInput } = this.context;
        const input = document.createElement(textArea ? "textarea" : "input");
        input.classList.add("zcInput");
        if (placeholder) input.placeholder = placeholder;
        if (value) input.value = value;
        setFontFamily(input, MOD_DATA.fontFamily);

        if (typeof isDisabled === "function" && isDisabled()) input.classList.add("zcDisabled");
        input.addEventListener("change", () => {
            if (typeof isDisabled === "function" && isDisabled()) return input.classList.add("zcDisabled");
            if (typeof onChange === "function") onChange();
        });
        input.addEventListener("input", () => {
            if (typeof isDisabled === "function" && isDisabled()) return input.classList.add("zcDisabled");
            if (typeof onInput === "function") onInput();
        });
        return {
            base: input
        }
    }

    override update(): void {
        super.update();
        if ((this.context.fontSize ?? "auto") === "auto") autosetFontSize(this.body!.base as HTMLElement);
        else if (typeof this.context.fontSize === "number") setFontSize(this.body!.base as HTMLElement, this.context.fontSize);
    }
}
