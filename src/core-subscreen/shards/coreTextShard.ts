import { MOD_DATA } from "../../index";
import { Anchor, autosetFontSize, setFontFamily, setFontSize } from "../../ui";
import { Shard, ShardContext, TextShard } from "../../shards";

export class CoreTextShard extends TextShard {
    override get defaultColor() {
        return "rgb(162, 255, 19)";
    }
}
