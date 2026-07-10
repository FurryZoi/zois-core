import { MOD_DATA } from "../index";
import { logger } from "../logging";
import { addDynamicClass, autosetFontSize, DynamicClassStyles, setFontFamily } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface CheckboxShardContext extends ShardContext<"checkbox" | "label"> {
    isChecked: boolean;
    text: string;
    tooltip?: {
        position: "left" | "right";
        text: string;
    };
    onChange?: () => void;
    isDisabled?: () => boolean;
}

export class CheckboxShard extends Shard<CheckboxShardContext> {

    protected get dynamicClassInput(): DynamicClassStyles {
        return {
            base: {
                width: "min(6dvh, 3dvw)",
                height: "min(6dvh, 3dvw)",
                borderRadius: "min(0.8dvh, 0.3dvw)",
                border: "var(--border-width, 2px) solid #333",
                backgroundColor: "var(--checkbox-color, #fff)",
                position: "relative",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                appearance: "none",
            },
            ":checked": {
                backgroundColor: "var(--tmd-accent, black)",
                borderColor: "var(--tmd-accent, black)",
            },
            ":checked > svg": {
                strokeDashoffset: "0",
            },
            ":checked:hover": {
                backgroundColor: "var(--tmd-accent-hover, black)",
            },
            ".zcDisabled": {
                opacity: "0.6",
                cursor: "not-allowed",
                backgroundColor: "var(--disabled-color, #e5e5e5)",
            },
            ".pop": {
                animation: "pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards"
            },
            "> .tooltip": {
                position: "absolute",
                color: "var(--tmd-text, black)",
                fontSize: "0.65em",
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
        };
    }

    protected get dynamicClassCheckmark(): DynamicClassStyles {
        return {
            base: {
                width: "70%",
                height: "70%",
                stroke: "var(--tmd-text, white)",
                strokeWidth: "3.5",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                fill: "none",
                strokeDasharray: "24",
                strokeDashoffset: "24",
                transition: "stroke-dashoffset 0.45s cubic-bezier(0.25, 0.1, 0.25, 1)",
            }
        };
    }

    protected get textColor() {
        return "var(--tmd-text, black)";
    }

    override generateBody(): Record<keyof NonNullable<CheckboxShardContext["modules"]>, HTMLElement | SVGElement> {
        const { isChecked, text, tooltip, onChange, isDisabled } = this.context;

        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.columnGap = "1vw";
        wrapper.style.padding = "0.25em";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = isChecked;
        input.classList.add("zcCheckbox");
        addDynamicClass(input, this.dynamicClassInput);

        const checkmark = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        checkmark.setAttribute("viewBox", "0 0 24 24");
        checkmark.setAttribute("class", "checkmark");
        checkmark.innerHTML = `<path d="M5 13L9 17L19 7" />`;
        addDynamicClass(checkmark, this.dynamicClassCheckmark);

        const label = document.createElement("p");
        label.textContent = text;
        label.style.color = this.textColor;
        setFontFamily(label, MOD_DATA.fontFamily);

        if (typeof isDisabled === "function" && isDisabled()) {
            input.disabled = true;
            wrapper.classList.add("zcDisabled");
        }

        input.addEventListener("change", () => {
            if (typeof isDisabled === "function" && isDisabled()) {
                input.checked = !input.checked;
                return;
            }
            if (typeof onChange === "function") onChange();
            if (input.checked) {
                input.classList.add("pop");
                setTimeout(() => input.classList.remove("pop"), 400);
            }
        });

        input.appendChild(checkmark);
        wrapper.append(input, label);

        if (tooltip) {
            const tooltipEl = document.createElement("span");
            tooltipEl.classList.add("tooltip");
            tooltipEl.setAttribute("position", tooltip.position);
            tooltipEl.textContent = tooltip.text;
            input.appendChild(tooltipEl);
        }

        return {
            base: wrapper,
            checkbox: input,
            label: label
        };
    }

    override update(): void {
        super.update();
        if (this.body?.base) {
            autosetFontSize(this.body.base as HTMLElement);
        }
    }
}