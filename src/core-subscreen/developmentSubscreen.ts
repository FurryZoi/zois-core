import { coreSettings, saveSettings } from "../core";
import { CoreSubscreen } from "./coreSubscreen";
import { createCheckbox } from "./shards";

export class DevelopmentSubscreen extends CoreSubscreen {
    override get name(): string {
        return "Development";
    };

    override load(): void {
        super.load();
        createCheckbox({
            x: 60,
            y: 200,
            text: "Auto Connect To Dev Backend Server",
            isChecked: !!coreSettings.autoConnectToDevBackendServer,
            onChange: () => {
                coreSettings.autoConnectToDevBackendServer = !coreSettings.autoConnectToDevBackendServer;
                saveSettings();
                window.location.replace(window.location.href);
            }
        });
    };
};
