import { version } from "react";
import styles from "./styles.css";
import { ModData, formatString, ZoiOpenEvent } from ".";
import { createMod, hookFunction, HookPriority, MOD_DATA, registerMod } from "./modsApi";
import { useToastsStore, useDialogStore, initVirtualDOM } from "./popups";
import { BaseSubscreen, SubscreenConstructor } from "./ui";

interface Mod {
    name: string
    fullName: string
    key: string
    version: string
    subscreens?: SubscreenConstructor[]
}

let previousSubscreen: BaseSubscreen | null = null;
let currentSubscreen: BaseSubscreen | null = null;

function setSubscreen(subscreen: BaseSubscreen | null) {
    previousSubscreen = currentSubscreen;
    if (currentSubscreen) currentSubscreen.unload();
    currentSubscreen = subscreen;
    if (currentSubscreen) currentSubscreen.load();
}

export function registerCore(modData: ModData): void {
    createMod(modData);
    const mods: Mod[] = [];
    mods.push(modData);
    if (!window.ZOISCORE) {
        const style = document.createElement("style");
        style.innerHTML = styles;
        document.head.append(style);
        window.ZOISCORE = Object.freeze({
            loaded: true,
            useToastsStore,
            useDialogStore,
            version,
            setSubscreen: (subscreen: string | null, constructorParams: unknown[] = [], callback?: (subscreen: BaseSubscreen) => void) => {
                if (subscreen === null) {
                    setSubscreen(null);
                    return;
                }
                const [modKey, subscreenName] = subscreen.split(":");
                if (modKey === undefined || subscreenName === undefined) {
                    console.error(`Invalid subscreen`, subscreen);
                    return;
                }
                const targetMod = mods.find((m) => m.key === modKey);
                if (!targetMod) {
                    console.error(`Invalid mod`, modKey);
                    return;
                }
                const targetSubscreenConstructor = targetMod.subscreens?.find((s) => s.name === subscreenName);
                if (!targetSubscreenConstructor) {
                    console.error(`Invalid subscreen`, subscreenName);
                    return;
                }
                if (currentSubscreen !== null) {
                    currentSubscreen
                }
                const subscreenObject = new targetSubscreenConstructor(...constructorParams);
                callback?.(subscreenObject);
                setSubscreen(subscreenObject);
            },
            getCurrentSubscreen: () => currentSubscreen,
            getPreviousSubscreen: () => previousSubscreen,
            setSubscreenPrevious: () => {
                setSubscreen(previousSubscreen);
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
            // Ищем ближайший элемент <a> от места клика
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
        initVirtualDOM();
    }
    registerMod();
}