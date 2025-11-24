import styles from "./styles.css";
import { findModByName, registerMod } from "./modsApi";
import { initVirtualDOM, useToastsStore, useDialogStore } from "./popups";


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

export function registerCore(modData: ModData): void {
    if (!window.ZOISCORE) {
        const style = document.createElement("style");
        style.innerHTML = styles;
        document.head.append(style);
        window.ZOISCORE = Object.freeze({
            loaded: true,
            useToastsStore,
            useDialogStore
        });
        initVirtualDOM();
    }
    MOD_DATA = { ...modData };
    registerMod();
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

export function getPlayer(value: string | number): Character {
    if (!value) return;
    return ChatRoomCharacter.find((Character) => {
        return (
            Character.MemberNumber == value ||
            Character.Name.toLowerCase() === value ||
            Character.Nickname?.toLowerCase() === value
        );
    });
}

export function getNickname(target: Character): string {
    return CharacterNickname(target);
}

export function getThemedColorsModule(): ThemedColorsModule | null {
    if (!findModByName("Themed")) return null;
    const themedData = JSON.parse(LZString.decompressFromBase64(Player.ExtensionSettings.Themed ?? ""));
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

export function normalizeObject(obj: unknown) {
    if (typeof obj !== "object" || obj === null) return obj;

    if (Array.isArray(obj)) {
        return obj.map(normalizeObject).sort();
    }

    return Object.keys(obj)
        .sort()
        .reduce((acc, key) => {
            acc[key] = normalizeObject(obj[key]);
            return acc;
        }, {});
}