import { coreSettings } from "../core";
import { CoreSubscreen } from "./coreSubscreen";

export class GeneralSubscreen extends CoreSubscreen {
    override get name(): string {
        return "General"
    }

    override load(): void {
        super.load();
        this.createCheckbox({
            x: 60,
            y: 200,
            text: "Dev Mode",
            isChecked: !!coreSettings.devMode,
            onChange: () => {
                coreSettings.devMode = false;
                delete PreferenceExtensionsSettings.ZOIS_CORE;
            }
        })
    }
}