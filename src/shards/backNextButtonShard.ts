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
                columnGap: "0.5em",
                justifyContent: "center",
                alignItems: "center",
                color: "var(--tmd-text, black)",
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

    protected get dynamicClassValueContainer(): DynamicClassStyles {
        return {
            base: {
                position: "relative",
                display: "grid",
                placeItems: "center",
                background: "var(--tmd-element, white)",
                width: "100%",
                height: "100%",
                borderRadius: "4px",
                overflow: "hidden",
                border: "2px solid var(--tmd-accent, rgb(34, 34, 34))",
                boxSizing: "border-box"
            }
        };
    }

    protected render(): Record<keyof NonNullable<BackNextButtonShardContext["modules"]>, HTMLElement | SVGElement> {
        const { onChange, isDisabled } = this.context;
        const div = document.createElement("div");
        addDynamicClass(div, this.dynamicClassContainer);
        setFontFamily(div, MOD_DATA.fontFamily);

        let currentIndex = this.context.currentIndex;
        let items = this.context.items;
        let isAnimating = false;

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
            else nextBtn.disabled = false;
        }

        const slideText = (direction: "next" | "back", newIndex: number) => {
            if (isAnimating) return;
            isAnimating = true;

            const outgoing = text;
            const incoming = document.createElement("b");

            incoming.style.cssText = `
                position: absolute;
                inset: 0;
                display: grid;
                place-items: center;
                width: 100%;
                text-align: center;
                margin: 0;
                user-select: none;
            `;
            incoming.textContent = items[newIndex][0];

            const fromX = direction === "next" ? "100%" : "-100%";
            const toX = direction === "next" ? "-100%" : "100%";

            incoming.style.transform = `translateX(${fromX})`;
            valueContainer.appendChild(incoming);

            void incoming.offsetWidth;

            outgoing.style.transition = "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
            incoming.style.transition = "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";

            outgoing.style.transform = `translateX(${toX})`;
            incoming.style.transform = "translateX(0)";

            const onEnd = () => {
                incoming.removeEventListener("transitionend", onEnd);

                outgoing.remove();

                text = incoming;
                text.style.position = "relative";
                text.style.inset = "auto";
                text.style.transform = "";
                text.style.transition = "";

                currentIndex = newIndex;
                if (typeof onChange === "function") onChange(items[currentIndex][1]);
                updateClasses();

                isAnimating = false;
            };

            incoming.addEventListener("transitionend", onEnd, { once: true });
        };

        const backBtn = document.createElement("button");
        backBtn.style.cssText = `
            font-size: 3.5vw; aspect-ratio: 1/1;
            height: 100%; background-image: url("Icons/Prev.png"); background-size: 100%;
        `;
        addDynamicClass(backBtn, this.dynamicClassButton);
        backBtn.addEventListener("click", () => {
            if (isAnimating) return;
            if (currentIndex === 0) return;
            if (typeof isDisabled === "function" && isDisabled(items[currentIndex - 1][1])) return;
            slideText("back", currentIndex - 1);
        });

        const nextBtn = document.createElement("button");
        nextBtn.style.cssText = `
            font-size: 3.5vw; aspect-ratio: 1/1;
            height: 100%; background-image: url("Icons/Next.png"); background-size: 100%;
        `;
        addDynamicClass(nextBtn, this.dynamicClassButton);
        nextBtn.addEventListener("click", () => {
            if (isAnimating) return;
            if (currentIndex === items.length - 1) return;
            if (typeof isDisabled === "function" && isDisabled(items[currentIndex + 1][1])) return;
            slideText("next", currentIndex + 1);
        });

        updateClasses();

        const valueContainer = document.createElement("div");
        addDynamicClass(valueContainer, this.dynamicClassValueContainer);

        let text = document.createElement("b");
        text.style.cssText = `
            position: relative;
            width: 100%;
            text-align: center;
            display: grid;
            place-items: center;
            user-select: none;
        `;
        text.textContent = items[currentIndex][0];

        valueContainer.append(text);

        div.append(backBtn, valueContainer, nextBtn);

        return {
            base: div,
            backButton: backBtn,
            nextButton: nextBtn,
            text
        };
    }

    protected update(): void {
        super.update();
        autosetFontSize(this.body!.base as HTMLElement);
    }
}