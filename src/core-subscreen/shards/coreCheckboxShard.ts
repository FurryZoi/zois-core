import { MOD_DATA } from "../../index";
import { Shard, CheckboxShardContext, CheckboxShard } from "../../shards";
import { DynamicClassStyles, setFontFamily, autosetFontSize } from "../../ui";

export class CoreCheckboxShard extends CheckboxShard {
    protected get dynamicClassInput(): DynamicClassStyles {
        return {
            ...super.dynamicClassInput,
            base: {
                ...super.dynamicClassInput.base,
                border: "var(--border-width) solid #33c633 !important",
                backgroundColor: "#20a214 !important",
                color: "rgb(162, 255, 19) !important"
            },
            hover: {
                ...super.dynamicClassInput.hover,
                backgroundColor: "#39bd2dff !important",
                color: "#76ff76ff !important"
            },
            before: {
                ...super.dynamicClassInput.before,
                backgroundColor: "rgb(162, 255, 19) !important"
            },
            ".zcDisabled": {
                ...super.dynamicClassInput[".zcDisabled"],
                backgroundColor: "var(--disabled-color)"
            }
        };
    }

    protected get textColor() { return "rgb(162, 255, 19)" };
}
