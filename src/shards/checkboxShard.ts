import { MOD_DATA } from "../modsApi";
import { Anchor, autosetFontSize, setFontFamily, setFontSize } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface CheckboxShardContext extends ShardContext<"checkbox" | "label"> {
    isChecked: boolean
    text: string
    onChange?: () => void
    isDisabled?: () => boolean
}

export class CheckboxShard extends Shard<CheckboxShardContext> {
    override generateBody(): Record<keyof NonNullable<CheckboxShardContext["modules"]>, HTMLElement | SVGElement> {
        const { isChecked, width, text, onChange, isDisabled } = this.context;
        const checkbox = document.createElement("div");
        checkbox.style.display = "flex";
        checkbox.style.alignItems = "center";
        checkbox.style.columnGap = "1vw";

        const input = document.createElement("input");
        input.type = "checkbox"
        input.checked = isChecked;
        input.style.borderRadius = "min(0.8dvh, 0.3dvw)";
        input.style.aspectRatio = "1/1";
        input.classList.add("zcCheckbox", "checkbox");

        const p = document.createElement("p");
        p.textContent = text;
        p.style.color = "var(--tmd-text, black)";
        setFontFamily(p, MOD_DATA.fontFamily);

        if (typeof isDisabled === "function" && isDisabled()) checkbox.classList.add("zcDisabled");
        checkbox.addEventListener("change", () => {
            if (typeof isDisabled === "function" && isDisabled()) return checkbox.classList.add("zcDisabled");
            if (typeof onChange === "function") onChange();
        });
        checkbox.append(input, p);

        return {
            base: checkbox,
            checkbox: input,
            label: p
        };
    }

    override update(): void {
        super.update();
        autosetFontSize(this.body!.label as HTMLElement);
    }
}
