import { BookText, createElement } from "lucide";
import { GeneralSubscreen } from "./generalSubscreen";
import { CoreSubscreen } from "./coreSubscreen";
import { syncSettings } from "../core";
import { ToastsSubscreen } from "./toastsSubscreen";
import { DevelopmentSubscreen } from "./developmentSubscreen";

export class MainSubscreen extends CoreSubscreen {
    override get name(): string {
        return "Zoi's Modding Core"
    }

    override load(): void {
        super.load();
        this.createText({
            x: 60,
            y: 120,
            text: "Here are all the experimental settings and settings for developing and debugging my mods.",
        });

        [new GeneralSubscreen(), new ToastsSubscreen(), new DevelopmentSubscreen()].forEach((s, i) => {
            this.createButton({
                x: 100,
                y: 240 + 115 * i,
                padding: 2,
                text: s.name,
                width: 600,
                fontSize: 5,
                onClick: () => {
                    this.setSubscreen(s);
                }
            });
        });

        this.createButton({
            anchor: "bottom-right",
            x: 40,
            y: 40,
            width: 90,
            height: 90,
            icon: createElement(BookText),
            onClick: () => {
                window.open(`https://github.com/FurryZoi/zois-core`, "_blank");
            }
        });

        this.createText({
            text: "This place is in WIP stage",
            x: 1000,
            y: 500,
            fontSize: 6
        });
    }

    override exit(): void {
        super.exit();
        this.setSubscreen(null);
        PreferenceSubscreenExtensionsClear();
        syncSettings();
    }
}