import { Anchor } from "../../ui";
import { CoreSubscreen } from "./core";
import { toastsManager } from "../../toasts";
import { createButton, createCheckbox, createInput, createInputList, createSelect, createText } from "../shards";
import { resetThemes } from "../toastThemes";
import { AttributesModule } from "../../shard-modules";
import { coreSettings, saveSettings } from "../settings";

export class ToastsSubscreen extends CoreSubscreen {
    override get name(): string {
        return "Toasts";
    };

    override onLoad(): void {
        super.onLoad();

        createText({
            text: "Scale factor (Defaults to 1)",
            x: 60,
            y: 200,
        });

        const scaleFactorInput = createInput({
            x: 60,
            y: 275,
            width: 400,
            placeholder: "Scale factor",
            value: coreSettings.toasts?.scaleFactor?.toString() ?? "1",
            modules: {
                base: [
                    new AttributesModule({
                        type: "number",
                        min: "0.25",
                        max: "4"
                    })
                ]
            },
            onChange: (value) => {
                if (scaleFactorInput.value === "") {
                    return;
                }
                const min = parseFloat(scaleFactorInput.min);
                const max = parseFloat(scaleFactorInput.max);
                const val = Math.min(max, Math.max(min, parseFloat(value)));
                if (val.toString() !== value) {
                    scaleFactorInput.value = val.toString();
                }
                coreSettings.toasts ??= {};
                coreSettings.toasts.scaleFactor = val;
            }
        });

        createText({
            text: "Position:",
            x: 60,
            y: 400
        });

        createSelect({
            x: 275,
            y: 395,
            width: 500,
            options: [
                {
                    name: "top-left",
                    text: "Top Left"
                },
                {
                    name: "top-right",
                    text: "Top Right"
                },
                {
                    name: "bottom-left",
                    text: "Bottom Left"
                },
                {
                    name: "bottom-right",
                    text: "Bottom Right"
                }
            ],
            currentOption: coreSettings.toasts?.position ?? "bottom-left",
            onChange: (pos) => {
                coreSettings.toasts ??= {};
                coreSettings.toasts.position = pos as Anchor;
            }
        });

        createCheckbox({
            x: 1100,
            y: 200,
            text: "Blacklist Enabled",
            isChecked: !!coreSettings.toasts?.blacklist?.enabled,
            onChange: () => {
                coreSettings.toasts ??= {};
                coreSettings.toasts.blacklist ??= {};
                coreSettings.toasts.blacklist.enabled = !coreSettings.toasts.blacklist.enabled;
            }
        });

        createInputList({
            x: 1100,
            y: 300,
            width: 800,
            height: 600,
            title: "Blacklist",
            fontSize: 3.2,
            placeholder: "Regular expression",
            value: coreSettings.toasts?.blacklist?.content ?? [],
            onChange: (value) => {
                coreSettings.toasts ??= {};
                coreSettings.toasts.blacklist ??= {};
                coreSettings.toasts.blacklist.content = value;
            }
        });

        createButton({
            text: "Test",
            x: 60,
            y: 850,
            padding: 1,
            width: 300,
            onClick: () => {
                saveSettings();
                toastsManager.success({
                    title: "Something was completed successfully",
                    message: "Message details",
                    duration: 8000
                });
                toastsManager.info({
                    title: "Very important announcement",
                    message: "You have been informed that you have been informed",
                    duration: 8000
                });
                toastsManager.warn({
                    title: "Don't look at me like that",
                    message: "You were warned",
                    duration: 8000
                });
                toastsManager.error({
                    title: "Critical bug found",
                    message: "Catch him!",
                    duration: 8000
                });
            }
        });

        createButton({
            text: "Reset Themes",
            x: 400,
            y: 850,
            padding: 1,
            width: 300,
            onClick: () => {
                resetThemes();
            }
        });
    };
};