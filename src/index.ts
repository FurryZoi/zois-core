import { ChangelogEntryTag } from "./changelogs";
import { dialogsManager } from "./dialogs";
import { createEventBus, eventBus } from "./events";
import { loadLocalization, type Locale } from "./localization";
import { createModSdk, hookFunction, HookPriority } from "./patching";
import { getCurrentSubscreen, setSubscreen, SubscreenConstructor } from "./ui";
import { initShared } from "./shared";
import { version } from "../package.json";
import { ModuleConstructor, ModuleLoadingStrategy, modulesManager } from "./modules";
import { MigratorConstructor } from "./migration";


export interface ModData {
    name: string
    fullName: string
    key: string
    version: string
    repository?: string
    chatMessageBackground?: string
    chatMessageColor?: string
    fontFamily?: string
    modules?: Record<string, ModuleConstructor>
    migrators?: Record<string, MigratorConstructor>
    subscreens?: Record<string, SubscreenConstructor>
    localization?: {
        locales: {
            default: Locale
            supported: Locale[]
        }
        translationsFolderPath: string
    }
    changelog?: {
        data: {
            date: string
            version: string
            contributors: {
                name: string
                avatar_url: string
                is_owner: boolean
            }[]
            changes: {
                message: string
                note?: string
                sha: string
                author: string
                date: string
                tags: ChangelogEntryTag[]
                commit_url: string,
            }[]
        }[]
    }
    onReady?: () => void
}

export { version };
export let MOD_DATA: ModData;

/**
 * Bootstraps the mod by initializing core systems and setting up essential hooks and event listeners.
 * @param modData - The mod configuration.
 */
export async function bootstrap(modData: ModData): Promise<void> {
    MOD_DATA = modData;
    createModSdk();
    createEventBus();

    if (!window.ZOIS_CORE) await initShared();

    window.ZOIS_CORE.addDependent({
        coreVersion: version,
        modData: {
            ...modData,
            modules: undefined,
            subscreens: undefined,
            migrators: undefined,
            onReady: undefined
        }
    });

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

    hookFunction("ChatRoomSafewordRevert", HookPriority.OBSERVE, (args, next) => {
        modulesManager.safeword();
        return next(args);
    })

    eventBus?.on("setSubscreen", async (data) => {
        const target = data.target;
        const isTrusted = data.isTrusted;
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
    });

    modulesManager.registerModules();
    modulesManager.loadByStrategy(ModuleLoadingStrategy.BEFORE_LOGIN);
    await ServerIsLoggedInAsync();
    await loadLocalization();
    modulesManager.loadByStrategy(ModuleLoadingStrategy.AFTER_LOGIN);
    if (modData.onReady) modData.onReady();
}

export function sleep(ms: number): Promise<() => {}> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Waits until the provided condition function returns `true`.
 * Optionally supports a cancel condition that aborts the wait early.
 * Checks the conditions every 10 milliseconds.
 * @param func - The condition function that must return `true` to resolve.
 * @param cancelFunc - Optional function that returns `true` to cancel the wait. Defaults to `() => false`.
 * @returns A promise that resolves to `true` if the condition was met, or `false` if cancelled.
 */
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

/**
 * Compares two version strings and determines whether the first version is newer than the second.
 * Versions are split by dots and compared numerically part by part.
 * Missing parts are treated as zero.
 * @param version1 - The first version string to compare.
 * @param version2 - The second version string to compare against.
 * @returns `true` if `version1` is newer than `version2`, otherwise `false`.
 */
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

/**
 * Finds a character in the current chat room by member number, name, or nickname.
 * 
 * The search is **case-insensitive**.
 * @param value - The member number, name, or nickname to search for.
 * @returns The matching `Character` object, or `null` if not found.
 */
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

export function injectStyles(stylesToInject: string) {
    const style = document.createElement("style");
    style.innerHTML = stylesToInject;
    document.head.append(style);
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
