import {
    addCustomTranslation,
    removeCustomTranslation,
    getCustomTranslation,
    getActiveCustomTranslation,
    setActiveCustomTranslation,
    type CustomTranslationRecord,
    type TranslationData,
    clearActiveCustomTranslation,
    getAllCustomTranslations,
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

export class CustomTranslationsSubscreen extends BaseSubscreen {
    public get name(): string {
        return "Custom Translations";
    }

    private translationsContainer: HTMLDivElement | null = null;

    protected onLoad(): void {
        this.translationsContainer = this.createContainer({
            x: 200,
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
                        padding: u(1),
                        boxSizing: "border-box",
                    }),
                ],
            },
        });

        this.createText({
            x: 1180,
            y: 220,
            width: 620,
            text: "Upload a JSON translation file to create a custom translation for a specific mod of Zoi's ecosystem. Custom translations are stored locally and persist after reload. You can download, activate, deactivate or delete them at any time.",
        });

        this.createFileInput({
            x: 1180,
            y: 750,
            width: 620,
            height: 160,
            title: "Upload translation file",
            accept: ".json,application/json",
            onFile: (file) => {
                this.createCustomTranslation(file);
            },
        });

        this.renderTranslationList();
    }

    private async renderTranslationList(): Promise<void> {
        if (!this.translationsContainer) return;
        this.translationsContainer.replaceChildren();

        const records = await getAllCustomTranslations();

        if (records.length === 0) {
            this.createText({
                parent: this.translationsContainer,
                text: "No custom translations yet.",
                width: 840,
            });
            return;
        }

        for (const record of records) {
            const active = await getActiveCustomTranslation(record.modKey);
            const isActive = active?.name === record.name;

            const card = document.createElement("div");
            Object.assign(card.style, {
                display: "flex",
                flexDirection: "column",
                gap: u(1.2),
                padding: u(1.6),
                boxSizing: "border-box",
                width: "100%",
                height: "auto",
                borderRadius: u(1),
                border: isActive
                    ? "2px solid var(--tmd-accent-hover, rgb(30, 139, 255))"
                    : "1px solid var(--tmd-accent, black)",
                background: "var(--tmd-element, white)",
            });
            this.translationsContainer.append(card);

            this.createText({
                parent: card,
                text: record.name,
                fontSize: 3.6,
                modules: {
                    base: [
                        new StyleModule({
                            width: "100%",
                            fontWeight: "bold",      
                        })
                    ]
                }
            });

            this.createText({
                parent: card,
                text: record.modKey,
                fontSize: 2.8,
                width: 800,
                modules: {
                    base: [
                        new StyleModule({
                            position: "relative",
                            left: "auto",
                            top: "auto",
                            width: "100%",
                            opacity: "0.85",
                        })
                    ]
                }
            });

            const actions = this.createContainer({
                parent: card,
                modules: {
                    content: [
                        new StyleModule({
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            gap: u(1.2),
                            marginTop: u(0.5),
                            width: "100%",
                            height: "auto",
                        })
                    ]
                }
            });

            this.createButton({
                parent: actions,
                text: "Download",
                variant: "filled",
                padding: 0.6,
                onClick: () => {
                    downloadJson(record.name, record.data);
                },
            });

            this.createButton({
                parent: actions,
                text: isActive ? "Deactivate" : "Activate",
                variant: "filled",
                padding: 0.6,
                onClick: () => {
                    this.toggleActive(record, isActive);
                },
            });

            this.createButton({
                parent: actions,
                text: "Delete",
                variant: "filled",
                padding: 0.6,
                onClick: () => {
                    this.deleteCustomTranslation(record);
                },
            });
        }
    }

    private async toggleActive(
        record: CustomTranslationRecord,
        isActive: boolean
    ): Promise<void> {
        try {
            if (isActive) {
                await clearActiveCustomTranslation(record.name);
            } else {
                await setActiveCustomTranslation(record.name);
            }
            await this.renderTranslationList();
        } catch (error) {
            await dialogsManager.confirm({
                message: `Failed to update translation: ${error instanceof Error ? error.message : String(error)
                    }`,
            });
        }
    }

    private async createCustomTranslation(file: File): Promise<void> {
        try {
            const parsed = JSON.parse(await file.text()) as TranslationData;
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                throw new Error("JSON root must be an object");
            }

            const mods = (window.ZOIS_CORE?.getDependents() ?? [])
                .filter((item) => item.modData.localization !== undefined)
                .map((item) => ({
                    name: `${item.modData.fullName} (${item.modData.key})`,
                    value: item.modData.key,
                }));

            if (mods.length === 0) {
                await dialogsManager.confirm({
                    message: "No zois-core mods with localization found",
                });
                return;
            }

            const modKey = await dialogsManager.pick({
                message: "Select a mod for this custom translation",
                options: mods,
            });
            if (modKey === false) return;

            const name = await dialogsManager.prompt({
                message: "Enter a name for this custom translation",
            });
            if (name === false) return;

            const trimmed = name.trim();
            if (!trimmed) return;

            const existing = await getCustomTranslation(trimmed);
            if (existing) {
                await dialogsManager.confirm({
                    message: `Translation "${trimmed}" already exists`,
                });
                return;
            }

            await addCustomTranslation(trimmed, parsed, modKey);
            await this.renderTranslationList();
        } catch (error) {
            await dialogsManager.confirm({
                message: `Failed to create translation: ${error instanceof Error ? error.message : String(error)
                    }`,
            });
        }
    }

    private async deleteCustomTranslation(
        record: CustomTranslationRecord
    ): Promise<void> {
        const ok = await dialogsManager.confirm({
            message: `Delete custom translation "${record.name}"?`,
        });
        if (!ok) return;

        await removeCustomTranslation(record.name);
        await this.renderTranslationList();
    }
}