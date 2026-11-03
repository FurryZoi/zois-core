import { createElement, Terminal } from "lucide";
import { dialogsManager } from "../dialogs";
import { getEventBus } from "../events";
import { formatString, version, waitFor } from "../index";
import { hookFunction, HookPriority } from "../modSdk";
import { addDynamicClass, getCurrentSubscreen, setPosition, setSize, setSubscreen } from "../ui";
import { createConfirmDialog, createPickDialog, createPickPlayerDialog, createPromptDialog } from "./dialogs";
import {
    coreEventBus,
    coreSettings,
    initCoreEventBus,
    loadCoreSettings,
    saveSettings,
} from "./settings";
import styles from "./styles.css";
import { MainSubscreen } from "./subscreens/main";
import {
    registerToastThemes,
    resolveActiveToastTheme
} from "./toastThemes";
import { initCssVars } from "./cssVars";

export function registerSubscreen(): void {
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
        resize: () => {
            getCurrentSubscreen()?.resize();
        },
        click: () => {
            getCurrentSubscreen()?.click();
        },
        exit: () => {
            getCurrentSubscreen()?.exit();
        }
    });
}

export function activateCore(): void {
    if ((window as any).__ZOIS_CORE_ACTIVATED__) return;
    (window as any).__ZOIS_CORE_ACTIVATED__ = true;

    if (!document.getElementById("zois-core-styles")) {
        const style = document.createElement("style");
        style.id = "zois-core-styles";
        style.innerHTML = styles;
        document.head.append(style);
    }

    initCoreEventBus();
    loadCoreSettings();
    registerToastThemes();

    window.ZOIS_CORE = Object.freeze({
        version,
        enableDevMode: () => {
            if (typeof Player?.MemberNumber !== "number") return;
            coreSettings.devMode = true;
            saveSettings();
            registerSubscreen();
        },
        getSettings: () => {
            return JSON.parse(JSON.stringify(coreSettings));
        },
        getEventBus,
        resolveActiveToastTheme,
        dialogs: {
            createConfirmDialog,
            createPromptDialog,
            createPickDialog,
            createPickPlayerDialog
        }
    });

    if (coreSettings.autoConnectToDevBackendServer) {
        hookFunction("CommonGetServer", HookPriority.OVERRIDE_BEHAVIOR, (args, next) => {
            return "https://bondage-club-server-test.herokuapp.com/";
        });
        const btn = ElementButton.Create(
            "zc-login-btn",
            () => {
                dialog.showModal();
            },
            {
                tooltip: "[zois-core] Backend server options",
                tooltipPosition: "right",
                image: "Icons/Online.png",
            }
        );
        document.body.append(btn);
        const dialog = ElementCreate({
            tag: "dialog",
            children: [
                ElementCreate({
                    tag: "div",
                    children: [
                        ElementCreate({
                            tag: "label",
                            children: ["You are connected to dev backend server"]
                        }),
                        ElementButton.Create("", () => {
                            coreSettings.autoConnectToDevBackendServer = !coreSettings.autoConnectToDevBackendServer;
                            saveSettings();
                            window.location.replace(window.location.href);
                        }, { label: "Switch back to prod backend server" }),
                        ElementButton.Create("", () => dialog.close(), { label: "Close" })
                    ]
                })
            ],
            parent: document.body
        });
        addDynamicClass(dialog, {
            ">div": {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "calc(3px * var(--size-unit))",
                width: "100%",
                height: "100%",
            },
            ">div>label": {
                display: "block",
                width: "100%",
                fontWeight: "bold",
                fontSize: "calc(3px * var(--size-unit))",
                textAlign: "center"
            },
            ">div>button:not(:last-child)": {
                fontSize: "calc(2px * var(--size-unit))",
                borderRadius: "4px",
                padding: "calc(3px * var(--size-unit)) calc(16px * var(--size-unit))",
            },
            ">div>button:last-child": {
                fontSize: "calc(2px * var(--size-unit))",
                padding: "calc(2px * var(--size-unit)) calc(8px * var(--size-unit))",
                borderRadius: "4px",
                width: "min(20dvh, 10dvw)",
                position: "absolute",
                right: "calc(2px * var(--size-unit))",
                bottom: "calc(2px * var(--size-unit))"
            }
        });
        hookFunction("LoginRun", HookPriority.OBSERVE, (args, next) => {
            setPosition(btn, 0, 0, "bottom-left");
            setSize(dialog, 600, 250);
            setSize(btn, 90, 90);
            return next(args);
        });
        hookFunction("LoginUnload", HookPriority.OBSERVE, (args, next) => {
            ElementRemove("zc-login-btn");
            return next(args);
        });
        ServerURL = CommonGetServer();
        ServerInit();
    }

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

    document.addEventListener("click", async (event) => {
        const link = (event.target as HTMLElement).closest("a");

        if (link && link.href) {
            try {
                const url = new URL(link.href);

                if (url.protocol === "zc:") {
                    event.preventDefault();

                    if (link.href.startsWith("zc://open")) {
                        const target = url.pathname.split("/").filter(Boolean)[1];
                        if (target === undefined) return;
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
                            default: {
                                coreEventBus?.emit("setSubscreen", {
                                    target,
                                    isTrusted: false
                                });
                            }
                        }
                    }
                }
            } catch (e) {
            }
        }
    }, true);

    waitFor(() => MainCanvas !== undefined).then(() => {
        initCssVars();
    });

    if (coreSettings.devMode) {
        registerSubscreen();
    }
}
