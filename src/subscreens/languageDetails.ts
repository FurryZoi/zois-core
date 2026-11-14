import {
    getLocale,
    LANGUAGES,
    setLocale,
    type Locale,
    type TranslationData,
} from "../localization";
import { BaseSubscreen, u } from "../ui";
import { StyleModule } from "../shard-modules";
import { dialogsManager } from "../dialogs";

function downloadJson(filename: string, data: TranslationData): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export class LanguageDetailsSubscreen extends BaseSubscreen {
    private readonly locale: Locale;

    public get name(): string {
        return (
            LANGUAGES.find((l) => l.locale === this.locale)?.name ?? this.locale
        );
    }

    constructor(locale: Locale) {
        super();
        this.locale = locale;
    }

    protected onLoad(): void {
        const language = LANGUAGES.find((l) => l.locale === this.locale);
        if (!language) {
            this.createText({
                x: 200,
                y: 220,
                width: 1600,
                text: `Unknown locale: ${this.locale}`,
                fontSize: 5,
            });
            return;
        }

        this.createSvg({
            x: 160,
            y: 200,
            svg: language.flag,
            width: 500,
            recolor: false,
            modules: {
                base: [
                    new StyleModule({
                        border: "1px solid var(--tmd-accent, black)"
                    })
                ]
            }
        });

        this.createButton({
            x: 160,
            y: 600,
            width: 500,
            text: "Use Language",
            variant: "filled",
            padding: 1,
            isDisabled: () => getLocale() === this.locale,
            onClick: () => {
                setLocale(this.locale);
                this.exit();
            },
        });

        const list = this.createContainer({
            x: 900,
            y: 200,
            width: 900,
            height: 700,
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

        this.renderModSupport(list);
    }

    private async renderModSupport(container: HTMLDivElement): Promise<void> {
        const dependents = (window.ZOIS_CORE?.getDependents() ?? []).filter((item) => item.modData.localization !== undefined);

        if (dependents.length === 0) return;

        for (const { modData } of dependents) {
            const localization = modData.localization!;
            const percent = await this.getModSupportPercent(
                modData,
                this.locale
            );

            this.createText({
                parent: container,
                text: `${modData.fullName} (${modData.key})`,
                fontSize: 4,
                width: 840,
                padding: 1,
                withBackground: true,
            });

            this.createText({
                parent: container,
                text: `Language support: ${percent}%`,
                fontSize: 3.3,
                width: 840,
            });

            this.createButton({
                parent: container,
                text: "Download Language File",
                padding: 1,
                modules: {
                    base: [new StyleModule({ width: "100%" })],
                },
                isDisabled: () => !localization.locales.supported.includes(this.locale),
                onClick: () => {
                    this.downloadModLanguageFile(
                        localization.translationsFolderPath,
                        modData.key
                    );
                },
            });
        }
    }

    private async downloadModLanguageFile(
        folderPath: string,
        modKey: string
    ): Promise<void> {
        try {
            const data = await this.fetchModTranslation(folderPath, this.locale);
            if (!data) {
                throw new Error(
                    `Translation file for "${this.locale}" was not found for mod "${modKey}"`
                );
            }

            downloadJson(`${modKey}-${this.locale}.json`, data);
        } catch (error) {
            await dialogsManager.confirm({
                message: `Failed to download translation: ${error instanceof Error ? error.message : String(error)
                    }`,
            });
        }
    }

    private getLeafKeys(
        value: unknown,
        prefix = "",
        result: string[] = []
    ): string[] {
        if (!value || typeof value !== "object" || Array.isArray(value)) {
            return result;
        }

        for (const [key, child] of Object.entries(
            value as Record<string, unknown>
        )) {
            const path = prefix ? `${prefix}.${key}` : key;
            if (typeof child === "string") result.push(path);
            else this.getLeafKeys(child, path, result);
        }

        return result;
    }

    private async fetchModTranslation(
        folderPath: string,
        locale: string
    ): Promise<TranslationData | null> {
        try {
            const response = await fetch(
                `${folderPath}/${locale}.json?=${Date.now()}`
            );
            if (!response.ok) return null;
            return (await response.json()) as TranslationData;
        } catch {
            return null;
        }
    }

    private coveragePercent(
        reference: TranslationData | null,
        candidate: TranslationData | null
    ): number {
        const referenceKeys = this.getLeafKeys(reference);
        if (referenceKeys.length === 0) return candidate ? 100 : 0;
        if (!candidate) return 0;

        const candidateKeys = new Set(this.getLeafKeys(candidate));
        const matched = referenceKeys.filter((key) =>
            candidateKeys.has(key)
        ).length;
        return Math.round((matched / referenceKeys.length) * 100);
    }

    private async getModSupportPercent(
        modData: {
            localization?: {
                locales: { default: string; supported: string[] };
                translationsFolderPath: string;
            };
        },
        locale: Locale
    ): Promise<number> {
        const localization = modData.localization;
        if (!localization) return 0;

        if (!localization.locales.supported.includes(locale)) {
            return 0;
        }

        const defaultData = await this.fetchModTranslation(
            localization.translationsFolderPath,
            localization.locales.default
        );
        const localeData = await this.fetchModTranslation(
            localization.translationsFolderPath,
            locale
        );

        return this.coveragePercent(defaultData, localeData);
    }
}