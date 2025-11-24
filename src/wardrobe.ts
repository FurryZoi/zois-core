import { normalizeObject } from "./index";

class AppearanceComparer {
    private seedsCache = new Map<string, number>();

    public getSeed(arr: Item[]) {
        const normalized = normalizeObject(ServerAppearanceBundle(arr));
        const key = JSON.stringify(normalized);

        if (!this.seedsCache.has(key)) {
            this.seedsCache.set(key, this.generateSeed(key));
        }

        return this.seedsCache.get(key);
    }

    public generateSeed(str: string): number {
        let seed = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            seed = ((seed << 5) - seed) + char;
            seed = seed & seed;
        }
        return seed;
    }

    public compare(arr1: Item[], arr2: Item[]): boolean {
        return this.getSeed(arr1) === this.getSeed(arr2);
    }

    public getDifference(arr1: Item[], arr2: Item[]) {
        const diff: {
            added: string[]
            modified: string[]
            removed: string[]
        } = {
            added: [],
            modified: [],
            removed: []
        };
        if (this.compare(arr1, arr2)) return diff;
        const diffMap = ServerBuildAppearanceDiff("Female3DCG", arr1, ServerAppearanceBundle(arr2));
        for (const [group, diffResult] of Object.entries(diffMap)) {
            if (diffResult[0] === null && diffResult[1] !== null) {
                diff.added.push(diffResult[1].Asset.Description);
                continue;
            }
            if (diffResult[0] !== null && diffResult[1] === null) {
                diff.removed.push(diffResult[0].Asset.Description);
                continue;
            }
            if (diffResult[0].Asset.Name !== diffResult[1].Asset.Name) {
                diff.removed.push(diffResult[0].Asset.Description);
                diff.added.push(diffResult[1].Asset.Description);
                continue;
            }
            if (!this.compare([diffResult[0]], [diffResult[1]])) diff.modified.push(diffResult[0].Asset.Description);
        }
        return diff;
    }
}

export const appearanceComparer = new AppearanceComparer();

export function smartGetAsset(item: Item | Asset): Asset {
    const asset = Asset.includes(item as Asset) ? item as Asset : (item as Item).Asset;
    if (!Asset.includes(asset)) {
        throw new Error("Failed to convert item to asset");
    }
    return asset;
}

export function smartGetAssetGroup(item: Item | Asset | AssetGroup): AssetGroup {
    const group = AssetGroup.includes(item as AssetGroup) ? item as AssetGroup : Asset.includes(item as Asset) ? (item as Asset).Group : (item as Item).Asset.Group;
    if (!AssetGroup.includes(group)) {
        throw new Error("Failed to convert item to group");
    }
    return group;
}

export function smartGetItemName(item: Item): string {
    if (item?.Craft?.Name) return item.Craft.Name;
    return item?.Asset?.Description;
}

export function isAssetGroupName(name: string): name is AssetGroupName {
    return AssetGroup.some((group) => group.Name === name);
}

export function isCloth(item: Item | Asset | AssetGroup, allowCosplay: boolean = false): boolean {
    const group = smartGetAssetGroup(item);
    return group.Category === "Appearance" && group.AllowNone && group.Clothing && (allowCosplay || !group.BodyCosplay);
}

export function isCosplay(item: Item | Asset | AssetGroup): boolean {
    const group = smartGetAssetGroup(item);
    return group.Category === "Appearance" && group.AllowNone && group.Clothing && group.BodyCosplay;
}

export function isBody(item: Item | Asset | AssetGroup): boolean {
    const group = smartGetAssetGroup(item);
    return group.Category === "Appearance" && !group.Clothing;
}

export function isBind(
    item: Item | Asset | AssetGroup,
    excludeSlots: AssetGroupName[] = ["ItemNeck", "ItemNeckAccessories", "ItemNeckRestraints"]
): boolean {
    const group = smartGetAssetGroup(item);
    if (group.Category !== "Item" || group.BodyCosplay) return false;
    return !excludeSlots.includes(group.Name);
}

export type IncludeType = "Cosplay" | "Binds" | "Collar" | "Locks";

export function importAppearance(
    C: Character,
    bundleToAttach: Item[],
    include: IncludeType[] = ["Cosplay", "Binds", "Collar", "Locks"],
    characterValidate: Character = C,
    ignoreAccessValidation: boolean = false
): void {
    bundleToAttach = bundleToAttach.filter((i) => !!i && !isBody(i));
    if (!include.includes("Cosplay")) bundleToAttach = bundleToAttach.filter((i) => !isCosplay(i));
    if (!include.includes("Binds")) bundleToAttach = bundleToAttach.filter((i) => !isBind(i));
    if (!include.includes("Collar")) bundleToAttach = bundleToAttach.filter((i) => i.Asset.Group.Name !== "ItemNeck");
    if (!include.includes("Locks")) bundleToAttach = bundleToAttach.map((i) => {
        if (i.Property?.LockedBy) delete i.Property.LockedBy;
        return i;
    });

    const blockedGroups = [];
    if (ignoreAccessValidation) {
        C.Appearance = C.Appearance.filter((a) => isBody(a));
    } else {
        const validationParams = ValidationCreateDiffParams(characterValidate, Player.MemberNumber);
        C.Appearance = C.Appearance.filter((a) => {
            if (isBody(a)) {
                blockedGroups.push(a.Asset.Group.Name);
                return true;
            }
            if (
                !ValidationCanRemoveItem(
                    a, validationParams, !!bundleToAttach.find((b) => b?.Asset?.Group?.Name === a?.Asset?.Group?.Name)
                ) ||
                (
                    a.Property?.LockedBy &&
                    !DialogCanUnlock(characterValidate, a)
                ) ||
                (
                    a.Asset.Name === "SlaveCollar" &&
                    characterValidate.IsPlayer()
                )
            ) {
                blockedGroups.push(a.Asset.Group.Name);
                return true;
            }
            return false;
        });
    }

    for (const item of bundleToAttach) {
        if (!ignoreAccessValidation) {
            if (!validationCanAccessCheck(characterValidate, item.Asset.Group.Name, item.Asset)) continue;
            if (blockedGroups.includes(item.Asset.Group.Name)) continue;
        }
        CharacterAppearanceSetItem(C, item.Asset.Group.Name, item.Asset, item.Color);
        const _item = InventoryGet(C, item.Asset.Group.Name);
        if (item.Craft && CraftingValidate(item.Craft, item.Asset) !== CraftingStatusType.CRITICAL_ERROR) _item.Craft = item.Craft;
        if (item.Property) {
            ValidationSanitizeProperties(C, item);
            _item.Property = item.Property;
        }
    }

    CharacterRefresh(C);
    if (!C.IsNpc()) ChatRoomCharacterUpdate(C);
}

export function validationCanAccessCheck(C: Character, group: AssetGroupName, asset: Asset): boolean {
    return (
        !ValidationIsItemBlockedOrLimited(C, Player.MemberNumber, group, asset.Name) && ServerChatRoomGetAllowItem(Player, C)
    );
}

export function serverAppearanceBundleToAppearance(assetFamily: IAssetFamily, serverAppearanceBundle: AppearanceBundle): Item[] {
    return serverAppearanceBundle.map((t) => {
        return ServerBundledItemToAppearanceItem(assetFamily, t);
    });
}

export function addRequiredAppearanceItems(appearanceBundle: Item[]): void {
    AssetGroup.forEach((group) => {
        if (group.Category !== "Appearance" || group.AllowNone) return;
        if (appearanceBundle.find((i) => i.Asset.Group.Name === group.Name)) return;
        const asset = AssetGet("Female3DCG", group.Name, group.Asset[0]?.Name);
        if (!asset) return;
        appearanceBundle.push({ Asset: asset, Color: group.DefaultColor });
    });
}