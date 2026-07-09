import { Check, ChevronDown, createElement } from "lucide";
import { MOD_DATA } from "../../index";
import { ShardContext, Shard, SelectShard } from "../../shards";
import { addDynamicClass, setFontFamily, autosetFontSize, DynamicClassStyles } from "../../ui";


export class CoreSelectShard extends SelectShard {
    override get dynamicClassContainer(): DynamicClassStyles {
        return {
            ...super.dynamicClassContainer,
            base: {
                ...super.dynamicClassContainer.base,
                background: "#20a214",
                color: "rgb(162, 255, 19)",
                border: "2px solid #33c633",
            }
        }
    }
}
