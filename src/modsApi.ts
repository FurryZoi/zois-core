import bcModSdk, { PatchHook, ModSDKModInfo, GetDotedPathType, ModSDKModAPI } from "bondage-club-mod-sdk";
import { getPlayer, MOD_DATA } from "./index";
import { getCurrentSubscreen } from "./ui";

export enum HookPriority {
    OBSERVE = 0,
    ADD_BEHAVIOR = 1,
    MODIFY_BEHAVIOR = 5,
    OVERRIDE_BEHAVIOR = 10,
    TOP = 100
}

export let modSdk: ModSDKModAPI;

export function registerMod(): void {
    modSdk = bcModSdk.registerMod({
        name: MOD_DATA.name,
        fullName: MOD_DATA.fullName,
        version: MOD_DATA.version,
        repository: MOD_DATA.repository
    });

    hookFunction("GameKeyDown", HookPriority.ADD_BEHAVIOR, (args, next) => {
        if (CommonKey.IsPressed(args[0], "Escape") && getCurrentSubscreen()) return getCurrentSubscreen().exit();
        return next(args);
    });
}

export function hookFunction(functionName: string, priority: HookPriority, hook: PatchHook): () => void {
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