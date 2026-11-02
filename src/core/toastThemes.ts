import { animeToastTheme } from "./toast-themes/anime";
import { cyberToastTheme } from "./toast-themes/cyber";
import { defaultToastTheme } from "./toast-themes/default";
import { ToastTheme } from "./toast-themes/base";

export const EXTENSIONS_CURRENT_TOAST_THEME_KEY = "ZC_TOAST_THEME";
export const EXTENSIONS_UNLOCKED_TOAST_THEMES_KEY = "ZC_TOAST_THEMES";

export const themes: { id: number; theme: ToastTheme }[] = [
    { id: 1000, theme: defaultToastTheme },
    { id: 1001, theme: cyberToastTheme },
    { id: 1002, theme: animeToastTheme },
];

export function registerToastThemes(): void {
    for (const entry of themes) {
        entry.theme.init();
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

export function resetThemes() {
    Player.ExtensionSettings[EXTENSIONS_UNLOCKED_TOAST_THEMES_KEY] = "";
    Player.ExtensionSettings[EXTENSIONS_CURRENT_TOAST_THEME_KEY] = "";
    ServerPlayerExtensionSettingsSync(EXTENSIONS_UNLOCKED_TOAST_THEMES_KEY);
    ServerPlayerExtensionSettingsSync(EXTENSIONS_CURRENT_TOAST_THEME_KEY);
}

export function getActiveThemeId(): number {
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

export function setActiveTheme(theme: ToastTheme): void {
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
    const id = getActiveThemeId();
    return getToastThemeById(id) ?? themes[0].theme;
}
