import { MOD_DATA } from "..";
import { addDynamicClass, autosetFontSize, DynamicClassStyles, setFontFamily } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface BackNextButtonShardContext extends ShardContext<"backButton" | "nextButton" | "text"> {
    items: [string, any?][]
    currentIndex: number
    onChange?: (value: any) => void
    isDisabled?: (value: any) => boolean
}

export class BackNextButtonShard extends Shard<BackNextButtonShardContext> {
    protected get dynamicClassContainer(): DynamicClassStyles {
        return {
            base: {
                display: "flex",
                columnGap: "2vw",
                justifyContent: "center",
                alignItems: "center",
                background: "var(--tmd- element, white)",
                color: "var(--tmd-text, black)",
                border: "2px solid var(--tmd-accent, black)",
                borderRadius: "4px"
            }
        }
    }

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
            disabled: {
                background: "var(--tmd-element-disabled, #ffa590)",
                pointerEvents: "none"
            }
        };
    }

    override generateBody(): Record<keyof NonNullable<BackNextButtonShardContext["modules"]>, HTMLElement | SVGElement> {
        const { onChange, isDisabled } = this.context;
        const div = document.createElement("div");
        addDynamicClass(div, this.dynamicClassContainer);
        setFontFamily(div, MOD_DATA.fontFamily);

        let currentIndex = this.context.currentIndex;
        let items = this.context.items;

        const updateClasses = () => {
            if (
                currentIndex === 0 ||
                (
                    typeof isDisabled === "function" &&
                    isDisabled(items[currentIndex - 1][1])
                )
            ) backBtn.disabled = true;
            else backBtn.disabled = false;
            if (
                currentIndex === items.length - 1 ||
                (
                    typeof isDisabled === "function" &&
                    isDisabled(items[currentIndex + 1][1])
                )
            ) nextBtn.disabled = true;
            else nextBtn.disabled = false;;
        }

        const backBtn = document.createElement("button");
        backBtn.style.cssText = `
                position: absolute; left: 1vw; font-size: 3.5vw; aspect-ratio: 1/1;
                height: 140%; background-image: url("Icons/Prev.png"); background-size: 100%;
                `;
        addDynamicClass(backBtn, this.dynamicClassButton);
        backBtn.addEventListener("click", () => {
            if (currentIndex === 0) return backBtn.classList.add("zcDisabled");
            if (typeof isDisabled === "function" && isDisabled(items[currentIndex - 1][1])) return backBtn.classList.add("zcDisabled");
            currentIndex--;
            text.textContent = items[currentIndex][0];
            if (typeof onChange === "function") onChange(items[currentIndex][1]);
            updateClasses();
        });

        const nextBtn = document.createElement("button");
        nextBtn.style.cssText = `
                position: absolute; right: 1vw; font-size: 3.5vw; aspect-ratio: 1/1;
                height: 140%; background-image: url("Icons/Next.png"); background-size: 100%;
                `;
        addDynamicClass(nextBtn, this.dynamicClassButton);
        nextBtn.addEventListener("click", () => {
            if (currentIndex === items.length - 1) return nextBtn.classList.add("zcDisabled");
            if (typeof isDisabled === "function" && isDisabled(items[currentIndex + 1][1])) return nextBtn.classList.add("zcDisabled");
            currentIndex++;
            text.textContent = items[currentIndex][0];
            if (typeof onChange === "function") onChange(items[currentIndex][1]);
            updateClasses();
        });

        updateClasses();

        const text = document.createElement("b");
        text.textContent = items[currentIndex][0];

        div.append(backBtn, text, nextBtn);

        return {
            base: div,
            backButton: backBtn,
            nextButton: nextBtn,
            text
        };
    }

    override update(): void {
        super.update();
        autosetFontSize(this.body!.base as HTMLElement);
    }
}
