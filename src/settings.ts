import { createElement, Terminal } from "lucide";
import { eventBus } from "./events";
import { logger } from "./logging";
import { openCoreSettingsDialog } from "./settingsDialog";
import { Anchor } from "./ui";

const SETTINGS_IDENTIFIER = "ZOIS_CORE";

export interface CoreSettings {
    devMode?: boolean
    toasts?: {
        position?: Anchor
        scaleFactor?: number
        blacklist?: {
            enabled?: boolean
            content?: string[]
        }
    }
    autoConnectToDevBackendServer?: boolean
}

function normalizeSettings(raw: unknown): CoreSettings {
    if (!raw || typeof raw !== "object") return {};
    return { ...(raw as CoreSettings) };
}

export function registerSettingsSubscreen(): void {
    try {
        PreferenceRegisterExtensionSetting({
            Identifier: SETTINGS_IDENTIFIER,
            Image: () => {
                const serializer = new XMLSerializer();
                const svgString = serializer.serializeToString(createElement(Terminal));
                return "data:image/svg+xml," + svgString;
            },
            ButtonText: () => "zois-core settings",
            load: () => {
                openCoreSettingsDialog();
                PreferenceExit();
            },
            run: () => {
            },
            click: () => {
            },
            exit: () => {
            }
        });
        logger.log("Initialized extension setting button of zois-core shared environment");
    } catch (e) {
        logger.error("Failed to initialize extension setting button of zois-core shared environment", e);
    }
}

export function unloadSettingsSubscreen(): void {
    delete PreferenceExtensionsSettings[SETTINGS_IDENTIFIER]
}

export function getSettings(): CoreSettings {
    if (typeof localStorage.getItem !== "function") {
        logger.error("Failed to read zois-core settings from local storage: local storage is unavailable");
        return {};
    }

    try {
        return normalizeSettings(JSON.parse(LZString.decompressFromBase64(localStorage.getItem(SETTINGS_IDENTIFIER) ?? "") ?? "{}"));
    } catch (e) {
        logger.error("Failed to read zois-core settings from local storage:", e);
        return {};
    }
}

export function setSettings(
    data: CoreSettings | ((prev: CoreSettings) => CoreSettings)
): void {
    const newSettings = typeof data === "function"
        ? data(getSettings())
        : data;

    if (typeof localStorage.setItem !== "function") {
        logger.error("Failed to write zois-core settings to local storage: local storage is unavailable");
        return;
    }

    try {
        const compressed = LZString.compressToBase64(JSON.stringify(newSettings));
        localStorage.setItem(SETTINGS_IDENTIFIER, compressed);
    } catch (e) {
        logger.error("Failed to write zois-core settings to local storage:", e);
        return;
    }

    eventBus?.emit("coreSettingsChanged", {
        settings: structuredClone(newSettings)
    });

    if (newSettings.devMode) registerSettingsSubscreen();
    else unloadSettingsSubscreen();
}

export function resetSettings(): void {
    if (typeof localStorage.removeItem !== "function") {
        logger.error("Failed to delete zois-core settings from local storage: local storage is unavailable");
        return;
    }

    try {
        localStorage.removeItem(SETTINGS_IDENTIFIER);
    } catch (e) {
        logger.error("Failed to delete zois-core settings from local storage:", e);
    }

    eventBus?.emit("coreSettingsChanged", {
        settings: {}
    });
}
