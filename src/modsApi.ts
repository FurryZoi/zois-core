import bcModSdk, { PatchHook, ModSDKModInfo, GetDotedPathType, ModSDKModAPI } from "bondage-club-mod-sdk";
import { getPlayer, ModData, ZoiOpenEvent } from "./index";
import { getCurrentSubscreen, setSubscreen } from "./ui";
import { dialogsManager } from "./popups";

export enum HookPriority {
    OBSERVE = 0,
    ADD_BEHAVIOR = 1,
    MODIFY_BEHAVIOR = 5,
    OVERRIDE_BEHAVIOR = 10,
    TOP = 100
}

export let modSdk: ModSDKModAPI;
export let MOD_DATA: ModData;

export function createMod(modData: ModData): void {
    MOD_DATA = modData;
    window.ZOISCORE_MODS ??= [];
    window.ZOISCORE_MODS.push({
        name: MOD_DATA.name,
        fullName: MOD_DATA.fullName,
        key: MOD_DATA.key,
        version: MOD_DATA.version,
        deepLinkSubscreens: MOD_DATA.deepLinkSubscreens ?? []
    });

    modSdk = bcModSdk.registerMod({
        name: MOD_DATA.name,
        fullName: MOD_DATA.fullName,
        version: MOD_DATA.version,
        repository: MOD_DATA.repository
    });
}

export function registerMod(): void {
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
        "zoiscore:open",
        async (event) => {
            if (!(event instanceof ZoiOpenEvent)) return;
            const subscreen = event.detail.subscreen;
            const mod = event.detail.mod;
            if (!!mod && mod !== MOD_DATA.key) return;
            const currentSubscreen = getCurrentSubscreen();
            if (currentSubscreen?.constructor.name === subscreen) return;
            const s = MOD_DATA.deepLinkSubscreens?.find((s) => s.constructor.name === subscreen);
            if (s && await dialogsManager.confirm({ message: "This deep link wants to redirect you to another subscreen. Confirm the redirecting." })) setSubscreen(s);
        }
    );
}

export function hookFunction<TFunctionName extends string>(
    functionName: TFunctionName,
    priority: HookPriority,
    hook: PatchHook<GetDotedPathType<typeof globalThis, TFunctionName>>
): () => void {
    if (!modSdk) throw new Error("zois-core is not registered");
    return modSdk.hookFunction(functionName, priority, hook);
}

export function patchFunction(functionName: string, patches: Record<string, string | null>): void {
    if (!modSdk) throw new Error("zois-core is not registered");
    modSdk.patchFunction(functionName, patches);
}

export function callOriginal<TFunctionName extends string>(
    target: TFunctionName,
    args: [...Parameters<GetDotedPathType<typeof globalThis, TFunctionName>>],
    context?: any
): ReturnType<GetDotedPathType<typeof globalThis, TFunctionName>> {
    if (!modSdk) throw new Error("zois-core is not registered");
    return modSdk.callOriginal(target, args);
}

export function getLoadedMods(): ModSDKModInfo[] {
    return bcModSdk.getModsInfo();
}

export function findModByName(name: string): boolean {
    return !!bcModSdk.getModsInfo().find((m) => m.name === name);
}