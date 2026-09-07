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

/**
* Hook a BC function.
* @template TFunctionName - The name of the hooked function, _e.g._ `"Player.CanChange"`
* @param functionName - Name of function to hook. Can contain dots to change methods in objects (e.g. `Player.CanChange`)
* @param priority - Number used to determinate order hooks will be called in. Higher number is called first
* @param hook - The hook itself to use, @see PatchHook
* @returns Function that can be called to remove this hook
*/
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

/**
* Patch a BC function
*
* **This method is DANGEROUS** to use and has high potential to conflict with other mods.
*
* Only use it if what you are trying to accomplish can't be done easily with `hookFunction`.
*
* This function tranforms BC function to string, replaces patches as pure text and then `eval`uates it.
* If you don't know what this means, please avoid this function.
* @template TFunctionName - The name of the patched function, _e.g._ `"Player.CanChange"`
* @param functionName - Name of function to patch. Can contain dots to change methods in objects (e.g. `Player.CanChange`)
* @param patches - Object in key: value format, where keys are chunks to replace and values are result.
*
* Patches from multiple calls are merged; where key matches the older one is replaced.
* Specifying value of `null` removes patch with this key.
*/
export function patchFunction(functionName: string, patches: Record<string, string | null>): void {
    if (!modSdk) throw new Error("zois-core is not registered");
    try {
        modSdk.patchFunction(functionName, patches);
    } catch (e) {
        logger.error(e);
    }
}

/**
* Call original function, bypassing any hooks and ignoring any patches applied by ALL mods.
* @template TFunctionName - The name of the called function, _e.g._ `"Player.CanChange"`
* @param functionName - Name of function to call. Can contain dots to change methods in objects (e.g. `Player.CanChange`)
* @param args - Arguments to use for the call
*/
export function callOriginal<TFunctionName extends string>(
    target: TFunctionName,
    args: [...Parameters<GetDotedPathType<typeof globalThis, TFunctionName>>]
): ReturnType<GetDotedPathType<typeof globalThis, TFunctionName>> | undefined {
    if (!modSdk) throw new Error("zois-core is not registered");
    try {
        return modSdk.callOriginal(target, args);
    } catch (e) {
        logger.error(e);
        return undefined;
    }
}

/**
* Returns info about all registered mods.
*/
export function getLoadedMods(): ModSDKModInfo[] {
    return bcModSdk.getModsInfo();
}

/**
* Determines whether a mod with the specified name is registered.
*/
export function findModByName(name: string): boolean {
    return !!bcModSdk.getModsInfo().find((m) => m.name === name);
}

/**
 * Get hash of original function in CRC32.
 *
 * The hash is computed from source obtained using `toString` with line endings normalized to LF
 * @param functionName - Name of function. Can contain dots to change methods in objects (e.g. `Player.CanChange`)
 */
export function getOriginalHash(functionName: string): string {
    if (!modSdk) throw new Error("zois-core is not registered");
    return modSdk.getOriginalHash(functionName);
}

/**
 * Remove all patches by `patchFunction` from specified function.
 * @param functionName - Name of function to patch. Can contain dots to change methods in objects (e.g. `Player.CanChange`)
 */
export function removePatches(functionName: string) {
    if (!modSdk) throw new Error("zois-core is not registered");
    modSdk.removePatches(functionName);
}