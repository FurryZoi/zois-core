import { MOD_DATA } from "../index";
import { autosetFontSize, setFontFamily } from "../ui";
import { Shard, ShardContext } from "./shard";

export interface CardShardContext extends ShardContext<"base" | "name" | "value" | "icon"> {
    name: string
    value: string | number
    icon?: SVGElement
}

export class CardShard extends Shard<CardShardContext> {
    override generateBody(): Record<keyof NonNullable<CardShardContext["modules"]>, HTMLElement | SVGElement> {
        const { name, value, icon } = this.context;
        const cardEl = document.createElement("div");
        cardEl.classList.add("zcCard");
        setFontFamily(cardEl, MOD_DATA.fontFamily);

        const cardName = document.createElement("p");
        cardName.classList.add("zcCard_name");
        cardName.textContent = name;

        const cardValue = document.createElement("p");
        cardValue.classList.add("zcCard_value");
        cardValue.textContent = `${value}`;

        if (icon) {
            icon.style.cssText += "position: absolute; top: 0.4em; right: 0.4em; width: 1.2em; height: 1.2em;";
            cardEl.append(icon);
        }

        cardEl.append(cardName, cardValue);

        return {
            base: cardEl,
            name: cardName,
            value: cardValue,
            icon: icon as SVGElement
        };
    }

    override update(): void {
        super.update();
        autosetFontSize(this.body!.base as HTMLElement);
    }
}
