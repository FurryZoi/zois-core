import { dialogsManager } from "./dialogs";
import { eventBus, getEventBus } from "./events";
import { version, waitFor } from "./index";
import { hookFunction, HookPriority } from "./modSdk";
import { openCoreSettingsDialog } from "./settingsDialog";
import styles from "./styles.css";
import { initToastThemes } from "./toasts";
import { initCssVars } from "./cssVars";
import { logger } from "./logging";
import { getSettings, registerSettingsSubscreen } from "./settings";
import { createElement, Terminal } from "lucide";

function setupLoginButton(): void {
    try {
        const buttonId = "zc-settings-btn";

        const btn = ElementButton.Create(
            buttonId,
            () => openCoreSettingsDialog(),
            {
                tooltip: "zois-core settings",
                tooltipPosition: "right",
                image: (() => {
                    const serializer = new XMLSerializer();
                    const svgString = serializer.serializeToString(createElement(Terminal));
                    return "data:image/svg+xml," + svgString;
                })()
            },
        );

        hookFunction("LoginLoad", HookPriority.OBSERVE, (args, next) => {
            ElementPositionFixed(btn, 0, MainCanvasHeight - 90, 90, 90);
            document.body.append(btn);
            return next(args);
        });

        hookFunction("LoginResize", HookPriority.OBSERVE, (args, next) => {
            ElementPositionFixed(btn, 0, MainCanvasHeight - 90, 90, 90);
            return next(args);
        });

        hookFunction("LoginUnload", HookPriority.OBSERVE, (args, next) => {
            ElementRemove(buttonId);
            return next(args);
        });

        if (CurrentScreen === "Login") {
            LoginResize(false);
            document.body.append(btn);
        }
        logger.log("Initialized login button of zois-core shared environment");
    } catch (e) {
        logger.error("Failed to initialize login button of zois-core shared environment", e);
    }
}

function initMagicLinks() {
    try {
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
                                    if (await dialogsManager.confirm({ message: "This magic link wants to redirect you to Admin subscreen. Confirm the redirecting." })) {
                                        ChatRoomOpenAdminScreen();
                                    }
                                    break;
                                }
                                case "Wardrobe": {
                                    if (await dialogsManager.confirm({ message: "This magic link wants to redirect you to Wardrobe subscreen. Confirm the redirecting." })) {
                                        ChatRoomOpenWardrobeScreen();
                                    }
                                    break;
                                }
                                case "Information": {
                                    if (await dialogsManager.confirm({ message: "This magic link wants to redirect you to Information subscreen. Confirm the redirecting." })) {
                                        ChatRoomOpenInformationScreen();
                                    }
                                    break;
                                }
                                default: {
                                    eventBus?.emit("setSubscreen", {
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
        logger.log("Initialized magic links of zois-core shared environment");
    } catch (e) {
        logger.error("Failed to initialize magic links of zois-core shared environment", e);
    }
}

function formatString(text: string): (
    { html: string, isBeatifulString: true } |
    { isBeatifulString: false }
) {
    if (!text || typeof text !== 'string') {
        return { isBeatifulString: false };
    }

    let result = text;
    let hasChanges = false;

    const markdownRegex = /\[([^\]]+?)\]\(([^)]+?)\)/g;
    const newResult = result.replace(markdownRegex, (match, linkText, url) => {
        hasChanges = true;
        const escapedText = linkText
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${escapedText}</a>`;
    });

    if (newResult !== result) {
        result = newResult;
    }

    const zcRegex = /(?<!\S)zc:\/\/open[^\s<>"']*(?!\S)/gi;
    result = result.replace(zcRegex, (match) => {
        hasChanges = true;
        return `<a href="${match}" target="_blank" rel="noopener noreferrer">${match}</a>`;
    });

    if (hasChanges) {
        return {
            html: result,
            isBeatifulString: true
        };
    }

    return { isBeatifulString: false };
}

export interface DependentInfo {
    name: string
    fullName: string
    version: string
    repository?: string
}

const dependents: DependentInfo[] = [];

function getDependents(): DependentInfo[] {
    return dependents.map((dependent) => ({ ...dependent }));
}

export function addDependent(dependent: DependentInfo): void {
    const existingIndex = dependents.findIndex((item) => item.name === dependent.name);
    const entry = { ...dependent };

    if (existingIndex === -1) {
        dependents.push(entry);
    } else {
        dependents[existingIndex] = entry;
    }
}

export function initShared(): void {
    if (window.ZOIS_CORE) return;

    logger.log("Initializing zois-core shared environment");

    if (!document.getElementById("zois-core-styles")) {
        const style = document.createElement("style");
        style.id = "zois-core-styles";
        style.innerHTML = styles;
        document.head.append(style);
    }

    waitFor(() => MainCanvas !== undefined).then(initCssVars);

    ServerIsLoggedInAsync().then(initToastThemes);

    initMagicLinks();

    window.ZOIS_CORE = Object.freeze({
        version,
        getEventBus,
        getDependents,
        addDependent,
    });

    const coreSettings = getSettings();

    if (coreSettings.devMode) {
        setupLoginButton();
        registerSettingsSubscreen();
    }

    if (coreSettings.autoConnectToDevBackendServer) {
        hookFunction("CommonGetServer", HookPriority.OVERRIDE_BEHAVIOR, (args, next) => {
            return "https://bondage-club-server-test.herokuapp.com/";
        });
        ServerURL = CommonGetServer();
        ServerInit();
    }
}
