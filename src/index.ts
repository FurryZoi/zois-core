import { registerCore } from "./core";
import { dialogsManager } from "./dialogs";
import { loadLocalization } from "./localization";
import { createModSdk, findModByName, hookFunction, HookPriority } from "./modSdk";
import { BaseSubscreen, getCurrentSubscreen, setSubscreen, SubscreenConstructor } from "./ui";


export interface ModData {
    name: string
    fullName: string
    key: string
    version: string
    repository?: string
    chatMessageBackground?: string
    chatMessageColor?: string
    fontFamily?: string
    singleToastsTheme?: {
        backgroundColor: string
        progressBarColor: string
        titleColor: string
        messageColor: string
        iconFillColor: string
        iconStrokeColor: string
    }
    subscreens?: Record<string, SubscreenConstructor>
    localization?: {
        locales: {
            default: string
            supported: string[]
        }
        translationsFolderPath: string
    }
    changelog?: {
        data: {
            hash: string
            author: string
            message: string
            date: string
        }[]
        repo: string
        owner: string
    }
}

interface ThemedColorsModule {
    base: {
        accent: string
        accentDisabled: string
        accentHover: string
        element: string
        elementDisabled: string
        elementHint: string
        elementHover: string
        main: string
        text: string
    }
    special: {
        allowed: string
        blocked: string
        crafted: string
        equipped: string
        limited: string
        roomBlocked: string
        roomFriend: string
        roomGame: string
    }
}

export { version } from "../package.json";
export let MOD_DATA: ModData;

export function bootstrap(modData: ModData): void {
    if (!window.ZOIS_CORE) registerCore();
    MOD_DATA = modData;
    createModSdk();
    loadLocalization();

    hookFunction("GameKeyDown", HookPriority.ADD_BEHAVIOR, (args, next) => {
        const currentSubscreen = getCurrentSubscreen();
        if (CommonKey.IsPressed(args[0], "Escape") && !!currentSubscreen) {
            currentSubscreen.exit();
            return false;
        }
        const zcDialog = document.querySelector(".zcDialog");
        if (zcDialog instanceof HTMLDivElement) {
            zcDialog.focus();
            return false;
        }
        return next(args);
    });

    window.addEventListener(
        "zois-core:setsubscreen",
        async (_event) => {
            const event = _event as SetSubscreenEvent;
            const target = event.detail.target;
            const isTrusted = event.detail.isTrusted;
            if (target === undefined) return;
            if (target.startsWith(MOD_DATA.key + ":")) {
                const currentSubscreen = getCurrentSubscreen();
                const mod = target.substring(0, MOD_DATA.key.length);
                const subscreen = target.substring(MOD_DATA.key.length + 1);
                if (currentSubscreen?.constructor?.name === subscreen) return;
                const s = MOD_DATA.subscreens?.[subscreen];
                if (s === undefined) return;
                if (isTrusted || await dialogsManager.confirm({ message: `Confirm the redirecting to modded subscreen ${target}` })) {
                    await PreferenceOpenSubscreen("Extensions");
                    await PreferenceSubscreenExtensionsOpen(mod, ["Online", "ChatRoom"]);
                    setSubscreen(new s());
                }
            }
        }
    );
}

export function formatString(text: string): (
    { html: string, isBeatifulString: true } |
    { isBeatifulString: false }
) {
    if (!text || typeof text !== 'string') {
        return { isBeatifulString: false };
    }

    let result = text;
    let hasChanges = false;

    const markdownRegex = /\[([^\]]+?)\]\(([^)]+?)\)/g;
    const newResult = result.replace(markdownRegex, (match, linkText, url) => {
        hasChanges = true;
        const escapedText = linkText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapedText}</a>`;
    });

    if (newResult !== result) {
        result = newResult;
    }

    const zcRegex = /(?<!\S)zc:\/\/open[^\s<>"']*(?!\S)/gi;
    result = result.replace(zcRegex, (match) => {
        hasChanges = true;
        return `<a href="${match}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });

    if (hasChanges) {
        return {
            html: result,
            isBeatifulString: true
        };
    }

    return { isBeatifulString: false };
}

export class SetSubscreenEvent extends CustomEvent<{ target: string, isTrusted: boolean }> {
    constructor(detail: { target: string, isTrusted: boolean }) {
        super(`zois-core:setsubscreen`, { detail });
    }
}

export class SubscreenLoadedEvent extends CustomEvent<{ subscreen: BaseSubscreen }> {
    constructor(detail: { subscreen: BaseSubscreen }) {
        super(`zois-core:subscreenloaded`, { detail });
    }
}

export class SubscreenUnloadedEvent extends CustomEvent<{ subscreen: BaseSubscreen }> {
    constructor(detail: { subscreen: BaseSubscreen }) {
        super(`zois-core:subscreenunloaded`, { detail });
    }
}

export class CoreSettingsChangedEvent extends CustomEvent<never> {
    constructor() {
        super(`zois-core:coresettingschanged`);
    }
}

export function sleep(ms: number): Promise<() => {}> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitFor(func: () => boolean, cancelFunc = () => false): Promise<boolean> {
    while (!func()) {
        if (cancelFunc()) {
            return false;
        }
        await sleep(10);
    }
    return true;
}

export function getRandomNumber(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function isVersionNewer(version1: string, version2: string): boolean {
    const v1Parts = version1.split('.');
    const v2Parts = version2.split('.');

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const v1Part = parseInt(v1Parts[i] || '0', 10);
        const v2Part = parseInt(v2Parts[i] || '0', 10);

        if (v1Part > v2Part) {
            return true;
        } else if (v1Part < v2Part) {
            return false;
        }
    }

    return false;
}

export function colorsEqual(c1: string[] | string | null | undefined, c2: string[] | string | null | undefined): boolean {
    if (!c1 && !c2) return true;
    if ((!c1 && c2 === "Default") || (!c2 && c1 === "Default")) return true;
    if (c1 === "Default" && Array.isArray(c2) && c2.filter(d => d === "Default").length === c2.length) return true;
    if (c2 === "Default" && Array.isArray(c1) && c1.filter(d => d === "Default").length === c1.length) return true;
    return JSON.stringify(c1) === JSON.stringify(c2);
}

export function getSizeInKbytes(b: any): number {
    if (typeof b === "string") {
        return Math.round(new TextEncoder().encode(b).byteLength / 100) / 10;
    } else {
        return Math.round(new TextEncoder().encode(JSON.stringify(b)).byteLength / 100) / 10;
    }
}

export function getPlayer(value: string | number): Character | null {
    if (!value) return null;
    return ChatRoomCharacter.find((Character) => {
        return (
            Character.MemberNumber == value ||
            Character.Name.toLowerCase() === value ||
            Character.Nickname?.toLowerCase() === value
        );
    }) ?? null;
}

export function getNickname(target: Character): string {
    return CharacterNickname(target);
}

export function getThemedColorsModule(): ThemedColorsModule | null {
    if (!findModByName("Themed")) return null;
    const data = LZString.decompressFromBase64(Player.ExtensionSettings.Themed ?? "") ?? "{}";
    let themedData;
    try {
        themedData = JSON.parse(data);
    } catch { };
    if (
        !themedData?.GlobalModule?.themedEnabled ||
        !themedData?.GlobalModule?.doVanillaGuiOverhaul
    ) return null;
    return themedData.ColorsModule;
}

export function injectStyles(stylesToInject: string) {
    const style = document.createElement("style");
    style.innerHTML = stylesToInject;
    document.head.append(style);
}

export function waitForStart(callback: () => void) {
    waitFor(() => typeof window.Player?.MemberNumber === "number").then(() => setTimeout(callback, getRandomNumber(3000, 6000)));
}

export function normalizeObject<T>(obj: T[]): T[];
export function normalizeObject<T extends object>(obj: T): T;
export function normalizeObject(obj: unknown) {
    if (!CommonIsObject(obj)) return obj;

    if (Array.isArray(obj)) {
        return obj.map(normalizeObject).sort();
    }

    return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
            acc[key] = normalizeObject((obj as { [key: string]: any })[key]);
            return acc;
        }, {} as { [key: string]: any });
}