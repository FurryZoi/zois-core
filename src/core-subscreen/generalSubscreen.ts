import { coreSettings } from "../core";
import { CoreSubscreen } from "./coreSubscreen";
import { createCheckbox } from "./shards";

export class GeneralSubscreen extends CoreSubscreen {
    override get name(): string {
        return "General";
    };

    override load(): void {
        super.load();
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
