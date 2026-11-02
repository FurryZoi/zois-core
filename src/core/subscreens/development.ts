import { CoreSubscreen } from "./core";
import { createCheckbox } from "../shards";
import { coreSettings, saveSettings } from "../settings";

export class DevelopmentSubscreen extends CoreSubscreen {
    override get name(): string {
        return "Development";
    };

    override onLoad(): void {
        super.onLoad();
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
