import { createElement, CircleX, Trash2 } from "lucide";
import { MOD_DATA } from "../../index";
import { StyleModule } from "../../shard-modules";
import { ShardContext, Shard, InputListShard } from "../../shards";
import { DynamicClassStyles, setFontFamily } from "../../ui";
import { ButtonShard } from "../../shards";



export class CoreInputListShard extends InputListShard {
    override get dynamicClassContainer(): DynamicClassStyles {
        return {
            ...super.dynamicClassContainer,
            base: {
                ...super.dynamicClassContainer.base,
                background: "#20a214 !important",
                border: "2px solid #33c633",
            },
            "> div:first-child > b": {
                ...super.dynamicClassContainer["> div:first-child > b"],
                color: "rgb(155, 255, 0)"
            },
            "> div:last-child > div": {
                ...super.dynamicClassContainer["> div:last-child > div"],
                background: "rgb(112, 234, 68)",
                color: "black",
            },
        };
    }

    override get dynamicClassToolsButton(): DynamicClassStyles {
        return {
            ...super.dynamicClassToolsButton,
            base: {
                ...super.dynamicClassToolsButton.base,
                background: "rgb(112, 234, 68)",
                color: "black",
            },
            hover: {
                background: "rgb(77, 221, 65)",
            },
        };
    }
}
