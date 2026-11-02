import { EventBus, getEventBus } from "../events";
import { logger } from "../logging";
import { Anchor } from "../ui";

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

export let coreSettings: CoreSettings = {};

export let coreEventBus: EventBus | null = null;

export function initCoreEventBus(): void {
    coreEventBus = getEventBus("zois-core");
}

export function loadCoreSettings(): void {
    if (typeof localStorage.getItem !== "function") {
        logger.error("Failed to read zois-core settings from local storage");
        return;
    }
    coreSettings = JSON.parse(LZString.decompressFromBase64(localStorage.getItem("ZOIS_CORE") ?? "") ?? "{}");
}

export function saveSettings(): void {
    if (typeof coreSettings !== "object") return;
    if (typeof localStorage.setItem !== "function") {
        logger.error("Failed to save zois-core settings in local storage");
        return;
    }
    const compressed = LZString.compressToBase64(JSON.stringify(coreSettings));
    localStorage.setItem("ZOIS_CORE", compressed);
    coreEventBus?.emit("coreSettingsChanged", {
        settings: structuredClone(coreSettings)
    });
}
