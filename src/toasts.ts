import { animeToastTheme } from "./toast-themes/anime";
import { cyberToastTheme } from "./toast-themes/cyber";
import { defaultToastTheme } from "./toast-themes/default";
import { ToastRenderData, ToastTheme } from "./toast-themes/base";
import { logger } from "./logging";
import { eventBus } from "./events";
import { setPosition } from "./ui";
import { getSettings } from "./settings";

export const EXTENSIONS_CURRENT_TOAST_THEME_KEY = "ZC_TOAST_THEME";
export const EXTENSIONS_UNLOCKED_TOAST_THEMES_KEY = "ZC_TOAST_THEMES";

export const themes: { id: number; theme: ToastTheme }[] = [
    { id: 1000, theme: defaultToastTheme },
    { id: 1001, theme: cyberToastTheme },
    { id: 1002, theme: animeToastTheme },
];

export function initToastThemes(): void {
    try {
        for (const entry of themes) {
            entry.theme.init();
        }
        logger.log("Initialized toast themes of zois-core shared environment");
    } catch (e) {
        logger.error("Failed to initialize toast themes of zois-core shared environment", e);
    }
}

export function getToastThemeById(id: number): ToastTheme | undefined {
    return themes.find((e) => e.id === id)?.theme;
}

export function getToastThemeId(theme: ToastTheme): number | undefined {
    return themes.find((e) => e.theme instanceof theme.constructor)?.id;
}

export function getUnlockedToastThemeIds(): number[] {
    if (typeof Player === "undefined" || !Player?.ExtensionSettings) return [];
    const stored = Player.ExtensionSettings[EXTENSIONS_UNLOCKED_TOAST_THEMES_KEY];
    if (typeof stored !== "string" || stored.length === 0) return [];
    const ids = new Set<number>();
    for (const c of stored) {
        ids.add(c.charCodeAt(0));
    }
    return [...ids];
}

export function isToastThemeUnlocked(theme: ToastTheme): boolean {
    const id = getToastThemeId(theme);
    if (id === 1000) return true;
    if (id === undefined) return false;
    return getUnlockedToastThemeIds().includes(id);
}

export function unlockToastTheme(theme: ToastTheme): void {
    if (typeof Player === "undefined" || !Player) return;
    if (!Player.ExtensionSettings) {
        (Player as any).ExtensionSettings = {};
    }
    const current = typeof Player.ExtensionSettings[EXTENSIONS_UNLOCKED_TOAST_THEMES_KEY] === "string"
        ? Player.ExtensionSettings[EXTENSIONS_UNLOCKED_TOAST_THEMES_KEY]
        : "";
    const id = getToastThemeId(theme);
    if (id === undefined) return;
    const ids = new Set<number>();
    for (const c of current) {
        ids.add(c.charCodeAt(0));
    }
    ids.add(id);
    Player.ExtensionSettings[EXTENSIONS_UNLOCKED_TOAST_THEMES_KEY] = [...ids].sort((a, b) => a - b).map((n) => String.fromCharCode(n)).join("");
    ServerPlayerExtensionSettingsSync(EXTENSIONS_UNLOCKED_TOAST_THEMES_KEY);
}

export function resetToastThemes() {
    Player.ExtensionSettings[EXTENSIONS_UNLOCKED_TOAST_THEMES_KEY] = "";
    Player.ExtensionSettings[EXTENSIONS_CURRENT_TOAST_THEME_KEY] = "";
    ServerPlayerExtensionSettingsSync(EXTENSIONS_UNLOCKED_TOAST_THEMES_KEY);
    ServerPlayerExtensionSettingsSync(EXTENSIONS_CURRENT_TOAST_THEME_KEY);
}

export function getActiveToastThemeId(): number {
    const defaultTheme = themes[0];
    const stored =
        typeof Player !== "undefined" &&
        Player?.ExtensionSettings?.[EXTENSIONS_CURRENT_TOAST_THEME_KEY];

    if (typeof stored !== "string" || stored.length === 0) {
        return defaultTheme.id;
    }

    const id = stored.charCodeAt(0);
    const found = getToastThemeById(id);
    if (found === undefined) return defaultTheme.id;
    if (!isToastThemeUnlocked(found)) return defaultTheme.id;
    return id;
}

export function setActiveToastTheme(theme: ToastTheme): void {
    if (typeof Player === "undefined" || !Player) return;
    if (!isToastThemeUnlocked(theme)) return;
    const id = getToastThemeId(theme);
    if (id === undefined) return;
    if (!Player.ExtensionSettings) {
        (Player as any).ExtensionSettings = {};
    }
    Player.ExtensionSettings[EXTENSIONS_CURRENT_TOAST_THEME_KEY] = String.fromCharCode(id);
    if (typeof ServerPlayerExtensionSettingsSync === "function") {
        ServerPlayerExtensionSettingsSync(EXTENSIONS_CURRENT_TOAST_THEME_KEY);
    }
}

export function resolveActiveToastTheme(): ToastTheme {
    const id = getActiveToastThemeId();
    return getToastThemeById(id) ?? themes[0].theme;
}

export function dismissToast(toastElement: HTMLDivElement): void {
    if (!toastElement || toastElement.dataset.dismissed === "true") return;
    toastElement.dataset.dismissed = "true";
    clearTimeout((toastElement as any)._dismissTimer);

    if (toastElement.hasAttribute("data-zc-cyber-toast")) {
        toastElement.classList.remove("visible", "paused");
        toastElement.classList.add("exiting");
        setTimeout(() => {
            if (toastElement.parentElement) toastElement.remove();
        }, 400);
        return;
    }

    const pos =
        getSettings().toasts?.position ?? "bottom-left";
    toastElement.style.animation = `${pos.includes("left") ? "zcSlideOutToLeft" : "zcSlideOutToRight"
        } 0.3s ease-out forwards`;
    setTimeout(() => toastElement.remove(), 300);
}

function createToastsContainer(): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "zcToastsContainer";

    const update = () => {
        container.style.cssText = `font-family: ${CommonGetFontName()};`;
        setPosition(
            container,
            5,
            5,
            getSettings().toasts?.position ?? "bottom-left"
        );
    };

    document.body.append(container);
    update();
    eventBus?.on("coreSettingsChanged", update);
    return container;
}

export function getOrCreateToastsContainer(): HTMLElement {
    return (
        document.querySelector(".zcToastsContainer") ?? createToastsContainer()
    );
}

function createToast(data: ToastRenderData): void {
    const theme = resolveActiveToastTheme();
    const toast = theme.render(data);
    const container = getOrCreateToastsContainer();
    container.appendChild(toast);
}

type ToastProcessData = Omit<ToastRenderData, "size" | "id">;

export class ToastsManager {
    private generateToastId(): string {
        return crypto.randomUUID();
    }

    private process(toastProperties: ToastProcessData): string | false {
        const coreSettingsLocal = getSettings();
        if (
            coreSettingsLocal.toasts?.blacklist?.enabled &&
            coreSettingsLocal.toasts.blacklist.content?.length !== 0
        ) {
            if (
                coreSettingsLocal.toasts.blacklist.content?.some((v) => {
                    const regexp = new RegExp(v);
                    return regexp.test(toastProperties.title ?? "") || regexp.test(toastProperties.message);
                })
            ) {
                logger.log("Toast message blocked due to blacklist settings");
                return false;
            }
        }

        const id = this.generateToastId();

        createToast({
            ...toastProperties,
            id,
            size: {
                scaleWithCanvas: true,
                scaleFactor: coreSettingsLocal.toasts?.scaleFactor ?? 1
            }
        });

        return id;
    }

    /**
     * Displays informational toast.
     * @param options - Title, message and duration of toast.
     */
    public info(toastProperties: Omit<ToastProcessData, "type">): void {
        this.process({ ...toastProperties, type: "info" });
    }

    /**
     * Displays success toast.
     * @param options - Title, message and duration of toast.
     */
    public success(toastProperties: Omit<ToastProcessData, "type">): void {
        this.process({ ...toastProperties, type: "success" });
    }

    /**
     * Displays warning toast.
     * @param options - Title, message and duration of toast.
     */
    public warn(toastProperties: Omit<ToastProcessData, "type">): void {
        this.process({ ...toastProperties, type: "warning" });
    }

    /**
     * Displays error toast.
     * @param options - Title, message and duration of toast.
     */
    public error(toastProperties: Omit<ToastProcessData, "type">): void {
        this.process({ ...toastProperties, type: "error" });
    }

    /**
     * Displays a long-running spinner toast and returns its ID.
     * Toast can be deleted manually with `toastsManager.removeSpinner(ID)` or by the user by clicking.
     * @param options - Title and message of toast.
     * @returns The unique ID of the created spinner toast.
     */
    public spinner(toastProperties: Omit<ToastProcessData, "type">): string {
        const result = this.process({ ...toastProperties, type: "spinner" });
        if (result === false) return "";
        return result;
    }

    /**
     * Removes a spinner toast by its ID.
     * @param id - Unique ID of the spinner toast to remove.
     */
    public removeSpinner(id: string): void {
        const toast = document.querySelector<HTMLDivElement>(
            `div[data-zc-toast-id="${id}"]`
        );
        if (!toast) return;
        dismissToast(toast);
    }
}

/**
 * Toast notifications controller, alternative to BC's native `ToastManager`.
 */
export const toastsManager = new ToastsManager();