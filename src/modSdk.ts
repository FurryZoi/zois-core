import bcModSdk, { PatchHook, ModSDKModInfo, GetDotedPathType, ModSDKModAPI } from "bondage-club-mod-sdk";
import { MOD_DATA } from "./index";
import { logger } from "./logging";


export enum HookPriority {
    OBSERVE = 0,
    ADD_BEHAVIOR = 1,
    MODIFY_BEHAVIOR = 5,
    OVERRIDE_BEHAVIOR = 10,
    TOP = 100
}

export let modSdk: ModSDKModAPI;

export function createModSdk(): void {
    modSdk = bcModSdk.registerMod({
        name: MOD_DATA.name,
        fullName: MOD_DATA.fullName,
        version: MOD_DATA.version,
        repository: MOD_DATA.repository
    });
}

export function hookFunction<TFunctionName extends string>(
    functionName: TFunctionName,
    priority: HookPriority,
    hook: PatchHook<GetDotedPathType<typeof globalThis, TFunctionName>>
): () => void {
    if (!modSdk) throw new Error("zois-core is not registered");
    try {
        return modSdk.hookFunction(functionName, priority, hook);
    } catch (e) {
        logger.error(e);
        return () => { };
    }
}

export function patchFunction(functionName: string, patches: Record<string, string | null>): void {
    if (!modSdk) throw new Error("zois-core is not registered");
    try {
        modSdk.patchFunction(functionName, patches);
    } catch (e) {
        logger.error(e);
    }
}

export function callOriginal<TFunctionName extends string>(
    target: TFunctionName,
    args: [...Parameters<GetDotedPathType<typeof globalThis, TFunctionName>>],
    context?: any
): ReturnType<GetDotedPathType<typeof globalThis, TFunctionName>> | undefined {
    if (!modSdk) throw new Error("zois-core is not registered");
    try {
        return modSdk.callOriginal(target, args);
    } catch (e) {
        logger.error(e);
        return undefined;
    }
}

export function getLoadedMods(): ModSDKModInfo[] {
    return bcModSdk.getModsInfo();
}

export function findModByName(name: string): boolean {
    return !!bcModSdk.getModsInfo().find((m) => m.name === name);
}