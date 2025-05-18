import styles from "@/styles.css";



interface ModData {
    modName: string
    modKey: string
    chatMessageBackground?: string
    chatMessageColor?: string
}

export let MOD_DATA: ModData = {
    modName: "",
    modKey: ""
};

export function registerCore(modData: ModData): void {
    if (!window.ZOISCORE_STYLES_LOADED) {
        const style = document.createElement("style");
        style.innerHTML = styles;
        document.head.append(style);
        window.ZOISCORE_STYLES_LOADED = true;
    }
    MOD_DATA = { ...modData };
}

export function sleep(ms: number): Promise<() => {}> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function waitFor(func: () => boolean, cancelFunc = () => false): Promise<boolean> {
    while (!func()) {
        if (cancelFunc()) {
            return false;
        }
        // eslint-disable-next-line no-await-in-loop
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

