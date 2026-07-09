import { MOD_DATA } from "../index";
import { logger } from "../logging";
import { addDynamicClass, autosetFontSize, DynamicClassStyles, setFontFamily } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface CheckboxShardContext extends ShardContext<"checkbox" | "label"> {
    isChecked: boolean
    text: string
    onChange?: () => void
    isDisabled?: () => boolean
}

export class CheckboxShard extends Shard<CheckboxShardContext> {
    protected get dynamicClassInput(): DynamicClassStyles {
        return {
            base: {
                width: "min(6dvh, 3dvw)",
                borderRadius: "min(0.8dvh, 0.3dvw)",
                aspectRatio: "1/1",
                border: "var(--border-width) solid black",
                borderWidth: "var(--border-width)",
                appearance: "none",
                backgroundColor: "var(--checkbox-color)",
                position: "relative",
                cursor: "pointer"
            },
            hover: {
                backgroundColor: "cyan"
            },
            before: {
                content: "''",
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                clipPath: "polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)",
                backgroundColor: "black",
                width: "90%",
                height: "90%",
                visibility: "hidden",
            },
            ":checked::before": {
                visibility: "visible"
            },
            ".zcDisabled": {
                backgroundColor: "var(--disabled-color)"
            }
        };
    }

    protected get textColor() { return "var(--tmd-text, black)" };

    override generateBody(): Record<keyof NonNullable<CheckboxShardContext["modules"]>, HTMLElement | SVGElement> {
        const { isChecked, text, onChange, isDisabled } = this.context;
        const checkbox = document.createElement("div");
        checkbox.style.display = "flex";
        checkbox.style.alignItems = "center";
        checkbox.style.columnGap = "1vw";

        const input = document.createElement("input");
        input.type = "checkbox"
        input.checked = isChecked;
        input.style.borderRadius = "min(0.8dvh, 0.3dvw)";
        input.style.aspectRatio = "1/1";
        input.classList.add("zcCheckbox");
        addDynamicClass(input, this.dynamicClassInput);

        const p = document.createElement("p");
        p.textContent = text;
        p.style.color = this.textColor;
        logger.debug(p.style.color, this.textColor);
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
