import { DynamicClassStyles } from "../../ui";
import { ButtonShard } from "../../shards";

export class CoreButtonShard extends ButtonShard {
    protected get dynamicClassButton(): DynamicClassStyles {
        return {
            ...super.dynamicClassButton,
            base: {
                ...super.dynamicClassButton.base,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                columnGap: "1.25vw",
                border: "2px solid #33c633",
                outline: "none",
                cursor: "pointer",
                background: "#20a214",
                color: "#004800",
                borderRadius: "0.1em"
            },
            hover: {
                ...super.dynamicClassButton.hover,
                background: "#39bd2dff",
                color: "#76ff76ff",
                borderColor: "#76ff76ff"
            }
        };
    }
}
