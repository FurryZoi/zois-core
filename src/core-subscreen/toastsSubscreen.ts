import { CoreSettingsChangedEvent } from "../index";
import { Anchor } from "../ui";
import { coreSettings } from "../core";
import { CoreSubscreen } from "./coreSubscreen";
import { toastsManager } from "../toasts";

export class ToastsSubscreen extends CoreSubscreen {
    override get name(): string {
        return "Toasts";
    }

    override load(): void {
        super.load();
        this.createCheckbox({
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

        this.createCheckbox({
            x: 60,
            y: 280,
            text: "Prevent Using Single Theme",
            isChecked: !!coreSettings.toasts?.preventUsingSingleTheme,
            onChange: () => {
                coreSettings.toasts ??= {};
                coreSettings.toasts.preventUsingSingleTheme = !coreSettings.toasts.preventUsingSingleTheme;
            }
        });

        this.createText({
            text: "Toasts Position:",
            x: 60,
            y: 380,
        });

        this.createSelect({
            x: 400,
            y: 360,
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
            onChange: (pos: Anchor) => {
                coreSettings.toasts ??= {};
                coreSettings.toasts.position = pos;
            }
        });

        this.createInputList({
            title: "Blacklist",
            x: 1100,
            y: 200,
            width: 800,
            height: 600,
            value: coreSettings.toasts?.blacklist?.content ?? [],
            onChange: (value) => {
                coreSettings.toasts ??= {};
                coreSettings.toasts.blacklist ??= {};
                coreSettings.toasts.blacklist.content = value as string[];
            }
        });

        this.createButton({
            text: "Test",
            x: 60,
            y: 850,
            padding: 1,
            width: 400,
            onClick: () => {
                document.dispatchEvent(new CoreSettingsChangedEvent());
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
    }
}