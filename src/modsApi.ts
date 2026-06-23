import bcModSdk, { PatchHook, ModSDKModInfo, GetDotedPathType, ModSDKModAPI } from "bondage-club-mod-sdk";
import { getPlayer, ModData, ZoiOpenEvent } from "./index";
import { getCurrentSubscreen, setSubscreen } from "./ui";
import { dialogsManager } from "./dialogs";


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
    modSdk = bcModSdk.registerMod({
        name: modData.name,
        fullName: modData.fullName,
        version: modData.version,
        repository: modData.repository
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
        "zois-core:open",
        async (event) => {
            if (!(event instanceof ZoiOpenEvent)) return;
            const target = event.detail.target;
            if (target === undefined) return;
            if (target.startsWith(MOD_DATA.key + ":")) {
                const currentSubscreen = getCurrentSubscreen();
                const mod = target.substring(0, MOD_DATA.key.length);
                const subscreen = target.substring(MOD_DATA.key.length + 1);
                if (currentSubscreen?.constructor?.name === subscreen) return;
                const s = MOD_DATA.subscreens?.find((s) => s.name === subscreen);
                if (s && await dialogsManager.confirm({ message: "This deep link wants to redirect you to modded subscreen. Confirm the redirecting." })) {
                    await PreferenceOpenSubscreen("Extensions");
                    await PreferenceSubscreenExtensionsOpen(mod, ["Online", "ChatRoom"]);
                    setSubscreen(new s());
                }
            } else {
                switch (target) {
                    case "Admin": {
                        if (await dialogsManager.confirm({ message: "This deep link wants to redirect you to Admin subscreen. Confirm the redirecting." })) {
                            ChatRoomOpenAdminScreen();
                        }
                        break;
                    }
                    case "Wardrobe": {
                        if (await dialogsManager.confirm({ message: "This deep link wants to redirect you to Wardrobe subscreen. Confirm the redirecting." })) {
                            ChatRoomOpenWardrobeScreen();
                        }
                        break;
                    }
                    case "Information": {
                        if (await dialogsManager.confirm({ message: "This deep link wants to redirect you to Information subscreen. Confirm the redirecting." })) {
                            ChatRoomOpenInformationScreen();
                        }
                        break;
                    }
                }
            }
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