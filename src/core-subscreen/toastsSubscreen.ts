import { Anchor } from "../ui";
import { coreSettings, saveSettings } from "../core";
import { CoreSubscreen } from "./coreSubscreen";
import { toastsManager } from "../toasts";
import { createButton, createCheckbox, createInputList, createSelect, createText } from "./shards";

export class ToastsSubscreen extends CoreSubscreen {
    override get name(): string {
        return "Toasts";
    };

    override load(): void {
        super.load();
        createCheckbox({
            x: 60,
            y: 200,
            text: "Blacklist Enabled",
            isChecked: !!coreSettings.toasts?.blacklist?.enabled,
            onChange: () => {
                coreSettings.toasts ??= {};
                coreSettings.toasts.blacklist ??= {};
                coreSettings.toasts.blacklist.enabled = !coreSettings.toasts.blacklist.enabled;
            }
        });

        createCheckbox({
            x: 60,
            y: 280,
            text: "Prevent Using Single Theme",
            isChecked: !!coreSettings.toasts?.preventUsingSingleTheme,
            onChange: () => {
                coreSettings.toasts ??= {};
                coreSettings.toasts.preventUsingSingleTheme = !coreSettings.toasts.preventUsingSingleTheme;
            }
        });

        createText({
            text: "Toasts Position:",
            x: 60,
            y: 380
        });

        createSelect({
            x: 400,
            y: 374,
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

        createInputList({
            x: 1100,
            y: 200,
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
            width: 400,
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
    };
};
