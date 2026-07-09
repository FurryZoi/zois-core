import styles from "./styles.css";
import { ModData, formatString, ZoiOpenEvent, version, CoreSettingsChangedEvent, waitFor } from "./index";
import { hookFunction, HookPriority } from "./modSdk";
import { Anchor, BaseSubscreen, getCurrentSubscreen, setSubscreen, SubscreenConstructor } from "./ui";
import { MainSubscreen } from "./core-subscreen/mainSubscreen";
import { createElement, Terminal } from "lucide";
import { ButtonShard, ContainerShard } from "./shards";
import { StyleModule } from "./shard-modules";

interface Mod {
    name: string
    fullName: string
    key: string
    version: string
    subscreens?: SubscreenConstructor[]
}

export interface CoreSettings {
    devMode?: boolean
    toasts?: {
        position?: Anchor
        preventUsingSingleTheme?: boolean
        singleTheme?: ModData["singleToastsTheme"]
        blacklist?: {
            enabled?: boolean
            content?: string[]
        }
    }
}

let previousSubscreen: BaseSubscreen | null = null;
let currentSubscreen: BaseSubscreen | null = null;
export let coreSettings: CoreSettings = {};

// function setSubscreen(subscreen: BaseSubscreen | null) {
//     previousSubscreen = currentSubscreen;
//     if (currentSubscreen) currentSubscreen.unload();
//     currentSubscreen = subscreen;
//     if (currentSubscreen) currentSubscreen.load();
// }

export function syncSettings() {
    if (typeof coreSettings !== "object") return;
    Player.ExtensionSettings.ZOIS_CORE = LZString.compressToBase64(JSON.stringify(coreSettings));
    ServerPlayerExtensionSettingsSync("ZOIS_CORE");
    document.dispatchEvent(new CoreSettingsChangedEvent());
}

export function registerSubscreen() {
    PreferenceRegisterExtensionSetting({
        Identifier: "ZOIS_CORE",
        Image: () => {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(createElement(Terminal));
            return "data:image/svg+xml," + svgString;
        },
        ButtonText: () => "Zoi's Modding Core",
        load: () => {
            setSubscreen(new MainSubscreen());
        },
        run: () => {
            getCurrentSubscreen()?.run();
        },
        click: () => {
            getCurrentSubscreen()?.click();
        },
        exit: () => {
            getCurrentSubscreen()?.exit();
        }
    });
}

let loginScreenElements: Element[] = [];

export async function registerCore() {
    if (localStorage.getItem("autoConnectToDevServer") === "true") {
        hookFunction("CommonGetServer", HookPriority.OVERRIDE_BEHAVIOR, (args, next) => {
            return "https://bondage-club-server-test.herokuapp.com/";
        });
        const containerShard = new ContainerShard({
            x: 1250,
            y: 900,
            modules: {
                base: [
                    new StyleModule({
                        display: "flex"
                    })
                ]
            }
        });
        const container = containerShard.mount() as HTMLDivElement;
        new ButtonShard({
            padding: 1,
            parent: container,
            text: "You connected to dev server",

        }).mount();
        new ButtonShard({
            width: 90,
            height: 90,
            padding: 1,
            icon: "Icons/Cancel.png",
            parent: container,
            onClick: () => {
                localStorage.removeItem("autoConnectToDevServer");
                location.reload();
            }
        }).mount();
        loginScreenElements.push(container);
        hookFunction("LoginUnload", HookPriority.OVERRIDE_BEHAVIOR, (args, next) => {
            loginScreenElements.forEach((e) => e.remove());
            return next(args);
        });
        ServerURL = CommonGetServer();
        ServerInit();
    }
    await waitFor(() => typeof Player?.MemberNumber === "number");
    if (typeof Player.ExtensionSettings.ZOIS_CORE === "string") {
        coreSettings = JSON.parse(LZString.decompressFromBase64(Player.ExtensionSettings.ZOIS_CORE) ?? "{}");
    }
    if (coreSettings.devMode) registerSubscreen();
    const style = document.createElement("style");
    style.innerHTML = styles;
    document.head.append(style);
    window.ZOISCORE = Object.freeze({
        loaded: true,
        version,
        // setSubscreen: (subscreen: string | null, constructorParams: unknown[] = [], callback?: (subscreen: BaseSubscreen) => void) => {
        //     if (subscreen === null) {
        //         setSubscreen(null);
        //         return;
        //     }
        //     const [modKey, subscreenName] = subscreen.split(":");
        //     if (modKey === undefined || subscreenName === undefined) {
        //         console.error(`Invalid subscreen`, subscreen);
        //         return;
        //     }
        //     const targetMod = mods.find((m) => m.key === modKey);
        //     if (!targetMod) {
        //         console.error(`Invalid mod`, modKey);
        //         return;
        //     }
        //     const targetSubscreenConstructor = targetMod.subscreens?.find((s) => s.name === subscreenName);
        //     if (!targetSubscreenConstructor) {
        //         console.error(`Invalid subscreen`, subscreenName);
        //         return;
        //     }
        //     if (currentSubscreen !== null) {
        //         currentSubscreen
        //     }
        //     const subscreenObject = new targetSubscreenConstructor(...constructorParams);
        //     callback?.(subscreenObject);
        //     setSubscreen(subscreenObject);
        // },
        enableDevMode: () => {
            coreSettings.devMode = true;
            syncSettings();
            registerSubscreen();
        },
        getSettings: () => {
            return JSON.parse(JSON.stringify(coreSettings));
        }
    });
    hookFunction("ChatRoomMessageCreateReplyMessageElement", HookPriority.OVERRIDE_BEHAVIOR, (args, next) => {
        const [msgId, displayMessage, data] = args;
        const r = formatString(displayMessage);
        if (!r.isBeatifulString) return next(args);
        if (!msgId) {
            return [displayMessage];
        }
        const metadata = ChatRoomGetMetadataElem(data.time, data.sender);
        metadata.setAttribute("aria-hidden", "true");
        return [
            ElementCreate({
                tag: "span",
                classList: ["chat-room-message-content"],
                attributes: { "msgid": msgId },
                innerHTML: r.html,
            }),
            ElementMenu.Create(
                ElementGenerateID(),
                [
                    metadata,
                    ElementButton.Create(
                        null,
                        () => ChatRoomMessageSetReply(msgId),
                        { noStyling: true, tooltip: "Reply" },
                        { button: { attributes: { name: "reply" } } },
                    ),
                ],
                { direction: "rtl", role: "menu" },
                { menu: { classList: ["chat-room-message-popup"], attributes: { "aria-direction": "horizontal" } } },
            ),
        ];
    });
    document.addEventListener('click', (event) => {
        const link = (event.target as HTMLElement).closest('a');

        if (link && link.href) {
            try {
                const url = new URL(link.href);

                if (url.protocol === 'zc:') {
                    event.preventDefault();

                    if (link.href.startsWith("zc://open")) {
                        const target = url.pathname.split("/").filter(Boolean)[1];
                        if (target === undefined) return;
                        window.dispatchEvent(new ZoiOpenEvent({ target }));
                    }
                }
            } catch (e) {
            }
        }
    }, true);
}