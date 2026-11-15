import {
    LANGUAGES,
    getLocale,
    type Locale,
} from "../localization";
import { BaseSubscreen, svgFromString, u } from "../ui";
import { StyleModule } from "../shard-modules";
import { LanguageDetailsSubscreen } from "./languageDetails";
import { CustomTranslationsSubscreen } from "./customTranslations";

export class LocalizationSubscreen extends BaseSubscreen {
    public get name(): string {
        return "Localization";
    }

    protected onLoad(): void {
        const languagesContainer = this.createContainer({
            x: 200,
            y: 200,
            width: 800,
            height: 620,
            scroll: "y",
            modules: {
                content: [
                    new StyleModule({
                        display: "flex",
                        flexDirection: "column",
                        gap: u(2),
                    }),
                ],
            },
        });

        LANGUAGES.forEach((l) => {
            this.createButton({
                parent: languagesContainer,
                icon: svgFromString(l.flag),
                text: l.name,
                padding: 1,
                modules: {
                    base: [new StyleModule({ width: "100%" })]
                },
                onClick: () => {
                    this.setSubscreen(new LanguageDetailsSubscreen(l.locale as Locale));
                },
            });
        });

        this.createButton({
            x: 200,
            y: 840,
            width: 800,
            height: 70,
            text: "Manage Custom Translations",
            padding: 1,
            onClick: () => {
                this.setSubscreen(new CustomTranslationsSubscreen());
            },
        });

        const locale = getLocale();
        const language = locale
            ? LANGUAGES.find((l) => l.locale === locale) ?? null
            : null;

        if (language) {
            this.createSvg({
                x: 1280,
                y: 180,
                svg: language.flag,
                width: 360,
                recolor: false,
                modules: {
                    base: [
                        new StyleModule({
                            border: "1px solid var(--tmd-accent, black)"
                        })
                    ]
                }
            });

            this.createText({
                x: 1280,
                y: 450,
                width: 360,
                text: language.name,
                fontSize: 5,
                modules: {
                    base: [
                        new StyleModule({
                            textAlign: "center"
                        })
                    ]
                }
            });
        } else {
            this.createText({
                x: 1220,
                y: 360,
                width: 400,
                text: "?",
                fontSize: 12,
            });

            this.createText({
                x: 1220,
                y: 620,
                width: 400,
                text: "Locale is not defined",
                fontSize: 4,
            });
        }

        this.createText({
            x: 1065,
            y: 550,
            width: 800,
            height: 365,
            padding: 1,
            text: "Here the list of languages supported by the Zoi's mods ecosystem. Translations are expanded and updated over time. Select a language — if translation file is missing or a string is not found, the mod falls back to its default language. But once a translation into the target language becomes available, the text of the mods will be translated.",
            withBackground: true
        });
    }
}