import { MOD_DATA } from "../index";
// import { Anchor, autosetFontSize, setFontFamily, setFontSize } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface BackNextButtonShardContext extends ShardContext<"backButton" | "nextButton" | "text"> {
    items: [string, any?][]
    currentIndex: number
    isBold?: boolean
    onChange?: (value: any) => void
    isDisabled?: (value: any) => boolean
}

export class BackNextButtonShard extends Shard<BackNextButtonShardContext> {
    override generateBody(): Record<keyof NonNullable<BackNextButtonShardContext["modules"]>, HTMLElement | SVGElement> {
        let { items, currentIndex, isBold, onChange, isDisabled } = CommonCloneDeep(this.context);
        const div = document.createElement("div");
        div.classList.add("zcBackNextButton");
        // setFontFamily(div, MOD_DATA.fontFamily);

        const updateClasses = () => {
            if (
                currentIndex === 0 ||
                (
                    typeof isDisabled === "function" && isDisabled(items[currentIndex - 1][1])
                )
            ) backBtn.classList.add("zcBackNextButton-btnDisabled");
            else backBtn.classList.remove("zcBackNextButton-btnDisabled");
            if (
                currentIndex === items.length - 1 ||
                (
                    typeof isDisabled === "function" && isDisabled(items[currentIndex + 1][1])
                )
            ) nextBtn.classList.add("zcBackNextButton-btnDisabled");
            else nextBtn.classList.remove("zcBackNextButton-btnDisabled");
        }

        const backBtn = document.createElement("button");
        backBtn.style.cssText = `
                position: absolute; left: 1vw; font-size: 3.5vw; aspect-ratio: 1/1;
                height: 140%; background-image: url("Icons/Prev.png"); background-size: 100%;
                `;
        backBtn.classList.add("zcButton");
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
        nextBtn.classList.add("zcButton");
        nextBtn.addEventListener("click", () => {
            if (currentIndex === items.length - 1) return nextBtn.classList.add("zcDisabled");
            if (typeof isDisabled === "function" && isDisabled(items[currentIndex + 1][1])) return nextBtn.classList.add("zcDisabled");
            currentIndex++;
            text.textContent = items[currentIndex][0];
            if (typeof onChange === "function") onChange(items[currentIndex][1]);
            updateClasses();
        });

        updateClasses();

        const text = document.createElement("p");
        if (isBold) text.style.fontWeight = "bold";
        text.textContent = items[currentIndex][0];

        div.append(backBtn, text, nextBtn);

        return {
            base: div,
            backButton: backBtn,
            nextButton: nextBtn,
            text
        };
    }
}
