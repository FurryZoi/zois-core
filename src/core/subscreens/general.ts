import { CoreSubscreen } from "./core";
import { createCheckbox } from "../shards";
import { coreSettings } from "../settings";

export class GeneralSubscreen extends CoreSubscreen {
    override get name(): string {
        return "General";
    };

    override onLoad(): void {
        super.onLoad();
        createCheckbox({
            x: 60,
            y: 200,
            text: "Dev Mode",
            isChecked: !!coreSettings.devMode,
            onChange: () => {
                coreSettings.devMode = !coreSettings.devMode;
            }
        });
    };
};
