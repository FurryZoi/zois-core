import { createElement, X } from "lucide";
import { getDynamicClass } from "../ui";
import { ToastType } from "./toast-themes/base";
import { getActiveThemeId, isToastThemeUnlocked, setActiveTheme, themes } from "./toastThemes";
import { Dialog, DialogButton, DialogText } from "./dialogs";

export function createThemesDialog(): void {
    const toastTypes: { type: ToastType; name: string }[] = [
        { type: "info", name: "Info" },
        { type: "success", name: "Success" },
        { type: "warning", name: "Warning" },
        { type: "error", name: "Error" },
        { type: "spinner", name: "Loading" },
    ];

    let activeThemeId = getActiveThemeId();

    const themeCardClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            background: "var(--tmd-element, none)",
            border: "1px solid var(--tmd-accent, black)",
            borderRadius: "4px",
            padding: "8px",
            color: "var(--tmd-text, black)",
            position: "relative"
        }
    });
    const exitButtonClassName = getDynamicClass({
        base: {
            position: "absolute",
            top: "6px",
            right: "6px",
            display: "grid",
            placeItems: "center",
            aspectRatio: "1/1"
        }
    });
    const tierStyles = {
        R: {
            fontWeight: "600",
            textShadow: "none",
            background: "none",
        },
        SR: {
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: "700",
            textShadow: "0 0 4px rgba(0, 242, 254, 0.6)",
            filter: "drop-shadow(0 0 4px rgba(79, 172, 254, 0.5))",
        },
        SSR: {
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ffd700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: "800",
            textShadow: "0 0 6px rgba(245, 87, 108, 0.7)",
            filter: "drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))",
        }
    };
    const dialog = (
        <Dialog wide>
            <DialogButton
                class={exitButtonClassName}
                onClick={() => {
                    dialog.remove();
                }}
            >
                {createElement(X)}
            </DialogButton>
            <DialogText style={{ fontSize: "2em", fontWeight: "bold" }}>
                Toast themes
            </DialogText>
            <div style={{ overflowY: "scroll", display: "flex", flexDirection: "column", gap: "12px" }}>
                {themes.map((t, i) => {
                    const tierClassName = getDynamicClass({
                        base: {
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            fontSize: "28px",
                            ...tierStyles[t.theme.tier]
                        }
                    });
                    const applyButtonClassName = getDynamicClass({
                        base: {
                            color: "var(--tmd-text, white) !important",
                            background: "var(--tmd-accent, black) !important",
                        },
                        hover: {
                            color: "var(--tmd-text, black) !important",
                            background: "var(--tmd-accent-hover, white) !important"
                        },
                        disabled: {
                            background: "var(--tmd-accent-disabled, #959595) !important",
                            pointerEvents: "none"
                        }
                    });
                    const typesContainerClassName = getDynamicClass({
                        base: {
                            display: "flex",
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: "6px"
                        }
                    });

                    const typeButtonClassName = getDynamicClass({
                        base: {
                            fontSize: "16px !important",
                            padding: "2px 8px !important"
                        }
                    });

                    if (!isToastThemeUnlocked(t.theme)) {
                        return (
                            <div class={themeCardClassName} style={{ paddingBottom: "25px" }}>
                                <span style={{ fontWeight: "bold", fontSize: "22px" }}>????</span>
                                <span class={tierClassName}>{t.theme.tier}</span>
                            </div>
                        );
                    }

                    const toastPreview = t.theme.render({
                        message: "Awesome theme!",
                        duration: 9999999999999,
                        isInteractable: false,
                        id: i.toString(),
                        type: "info",
                        size: {
                            scaleWithCanvas: false,
                            scaleFactor: 1
                        }
                    });
                    toastPreview.style.width = "fit-content";
                    toastPreview.style.maxWidth = "100%";
                    const toastPreviewContainer = (<div>{toastPreview}</div>) as HTMLDivElement;
                    const typeButtons = toastTypes.map(({ type, name }) => {
                        const button = (
                            <DialogButton
                                class={typeButtonClassName}
                                onClick={() => {
                                    const nextPreview = t.theme.render({
                                        message: "Awesome theme!",
                                        duration: 9999999999999,
                                        isInteractable: false,
                                        id: i.toString(),
                                        type,
                                        size: {
                                            scaleWithCanvas: false,
                                            scaleFactor: 1
                                        }
                                    });
                                    nextPreview.style.width = "fit-content";
                                    nextPreview.style.maxWidth = "100%";
                                    toastPreviewContainer.replaceChildren(nextPreview);
                                }}
                            >
                                {name}
                            </DialogButton>
                        ) as HTMLButtonElement;
                        return { type, button };
                    });

                    return (
                        <div class={themeCardClassName}>
                            <span style={{ fontWeight: "bold", fontSize: "22px" }}>{t.theme.name}</span>
                            <span style={{ fontSize: "18px", padding: "6px", borderRadius: "4px", background: "var(--tmd-element-hover, #ececec)" }}>
                                {t.theme.details}
                            </span>
                            <span class={tierClassName}>{t.theme.tier}</span>
                            <div class={typesContainerClassName}>
                                {typeButtons.map((b) => b.button)}
                            </div>
                            {toastPreviewContainer}
                            <DialogButton
                                class={applyButtonClassName}
                                disabled={activeThemeId === t.id}
                                onClick={(e) => {
                                    const btns = document.getElementsByClassName(applyButtonClassName);
                                    for (const b of btns) (b as HTMLButtonElement).disabled = false;
                                    e.currentTarget.disabled = true;
                                    setActiveTheme(t.theme);
                                }}
                            >
                                Apply
                            </DialogButton>
                        </div>
                    );
                })}
            </div>
        </Dialog>
    ) as HTMLDialogElement;
    document.body.append(dialog);
    dialog.showModal();
}

