import { createElement, X } from "lucide";
import { getDynamicClass } from "./ui";
import { ToastRenderData, ToastType } from "./toast-themes/base";
import { getActiveToastThemeId, isToastThemeUnlocked, setActiveToastTheme, themes } from "./toasts";
import { Dialog, DialogButton, DialogCloseButton, DialogText } from "./dialogs";


export function createThemesDialog(): void {
    const toastTypes: { type: ToastType; name: string }[] = [
        { type: "info", name: "Info" },
        { type: "success", name: "Success" },
        { type: "warning", name: "Warning" },
        { type: "error", name: "Error" },
        { type: "spinner", name: "Loading" }
    ];

    let activeThemeId = getActiveToastThemeId();

    const themeCardClassName = getDynamicClass({
        base: {
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            background: "var(--tmd-element, #f2f2f2)",
            border: "1px solid var(--tmd-element, #d0d0d0)",
            borderRadius: "8px",
            padding: "14px",
            color: "var(--tmd-text, #292929)",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
        }
    });

    const tierStyles = {
        R: {
            color: "var(--tmd-text, #555)",
            fontWeight: "600",
            textShadow: "none"
        },
        SR: {
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: "700",
            textShadow: "0 0 4px rgba(0, 242, 254, 0.6)",
            filter: "drop-shadow(0 0 4px rgba(79, 172, 254, 0.5))"
        },
        SSR: {
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ffd700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontWeight: "800",
            textShadow: "0 0 6px rgba(245, 87, 108, 0.7)",
            filter: "drop-shadow(0 0 6px rgba(255, 215, 0, 0.6))"
        }
    };

    const sectionContainerClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "10px",
            padding: "12px",
            borderRadius: "8px",
            background: "var(--tmd-element-hover, #e9e9e9)",
            border: "1px solid var(--tmd-element, #d0d0d0)"
        }
    });

    const sectionTitleClassName = getDynamicClass({
        base: {
            fontSize: "13px",
            fontWeight: "700",
            letterSpacing: "1px",
            color: "var(--tmd-text, #555)",
            opacity: "0.75"
        }
    });

    const detailsClassName = getDynamicClass({
        base: {
            width: "100%",
            boxSizing: "border-box",
            fontSize: "17px",
            lineHeight: "1.4"
        }
    });

    const typesContainerClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "6px"
        }
    });

    const typeButtonClassName = getDynamicClass({
        base: {
            fontSize: "15px !important",
            padding: "4px 10px !important",
            borderRadius: "5px !important"
        }
    });

    const setAsDefaultButtonClassName = getDynamicClass({
        base: {
            cursor: "pointer",
            color: "var(--tmd-text, white) !important",
            background: "var(--tmd-accent, #444) !important",
            padding: "8px 16px",
            fontSize: "17px",
            fontWeight: "600",
            border: "1px solid var(--tmd-accent-hover, #333)",
            borderRadius: "6px",
            transition: "background 0.15s ease, color 0.15s ease"
        },
        hover: {
            color: "var(--tmd-text, black) !important",
            background: "var(--tmd-accent-hover, #ddd) !important"
        },
        disabled: {
            background: "var(--tmd-accent-disabled, #959595) !important",
            pointerEvents: "none",
            opacity: "0.7"
        }
    });

    const scrollContainerClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            gap: "14px",
            padding: "4px",
            overflowY: "auto",
            scrollbarWidth: "none"
        }
    });

    const scrollbarStyle = document.createElement("style");
    scrollbarStyle.textContent = `.${scrollContainerClassName}::-webkit-scrollbar { display: none; }`;

    const dialog = (
        <Dialog wide>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <DialogText style={{ fontSize: "2em", fontWeight: "bold" }}>Toast themes</DialogText>
                <DialogCloseButton onClick={() => dialog.close()} />
            </div>
            <div class={scrollContainerClassName}>
                {[...themes]
                    .sort((a, b) => {
                        const tierOrder = { R: 0, SR: 1, SSR: 2 };
                        return tierOrder[a.theme.tier] - tierOrder[b.theme.tier];
                    })
                    .map((t, i) => {
                        const currentTierClassName: string = getDynamicClass({
                            base: {
                                position: "absolute",
                                top: "12px",
                                right: "14px",
                                fontSize: "25px",
                                ...tierStyles[t.theme.tier]
                            }
                        });

                        if (!isToastThemeUnlocked(t.theme)) {
                            return (
                                <div class={themeCardClassName} style={{ paddingBottom: "20px" }}>
                                    <span style={{ fontWeight: "bold", fontSize: "22px" }}>????</span>
                                    <span class={currentTierClassName}>{t.theme.tier}</span>
                                    <span style={{ fontSize: "16px", opacity: "0.75" }}>You should unlock this theme first.</span>
                                </div>
                            );
                        }

                        let previewType: ToastType = "info";
                        let showButtons: boolean = false;

                        const createPreview = (): HTMLElement => {
                            const previewButtons = [
                                {
                                    name: "Button 1",
                                    action: () => { }
                                },
                                {
                                    name: "Button 2",
                                    action: () => { }
                                }
                            ];
                            const renderData: ToastRenderData = previewType === "spinner" ? {
                                message: "Awesome theme!",
                                isInteractable: false,
                                id: i.toString(),
                                type: previewType,
                                size: {
                                    scaleWithCanvas: false,
                                    scaleFactor: 1
                                },
                                buttons: showButtons ? previewButtons : undefined
                            } : {
                                message: "Awesome theme!",
                                duration: 0,
                                isInteractable: false,
                                id: i.toString(),
                                type: previewType,
                                size: {
                                    scaleWithCanvas: false,
                                    scaleFactor: 1
                                },
                                buttons: showButtons ? previewButtons : undefined
                            };

                            const preview: HTMLElement = t.theme.render(renderData);
                            preview.style.width = "fit-content";
                            preview.style.maxWidth = "100%";

                            return preview;
                        };

                        const toastPreviewContainer = (
                            <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "flex-start", width: "100%", minHeight: "60px" }}>{createPreview()}</div>
                        ) as HTMLDivElement;

                        const updatePreview = (): void => {
                            toastPreviewContainer.replaceChildren(createPreview());
                        };

                        const typeButtons = toastTypes.map(({ type, name }) => {
                            const button = (
                                <DialogButton
                                    variant="outline"
                                    class={typeButtonClassName}
                                    onClick={() => {
                                        previewType = type;
                                        updatePreview();
                                    }}
                                >
                                    {name}
                                </DialogButton>
                            ) as HTMLButtonElement;

                            return { type, button };
                        });

                        return (
                            <div class={themeCardClassName}>
                                <span style={{ fontWeight: "700", fontSize: "22px", paddingRight: "70px" }}>{t.theme.name}</span>
                                <span class={currentTierClassName}>{t.theme.tier}</span>
                                <div class={sectionContainerClassName}>
                                    <span class={sectionTitleClassName}>Details</span>
                                    <span class={detailsClassName}>{t.theme.details}</span>
                                </div>
                                <div class={sectionContainerClassName}>
                                    <span class={sectionTitleClassName}>Preview Controls</span>
                                    <div class={typesContainerClassName}>{typeButtons.map((b) => b.button)}</div>
                                    <label style={{ display: "inline-flex", gap: "8px", alignItems: "center", cursor: "pointer", fontSize: "15px" }}>
                                        <input
                                            type="checkbox"
                                            style={{ accentColor: "var(--tmd-accent, #555)", width: "20px", height: "20px" }}
                                            onChange={(event) => {
                                                showButtons = event.currentTarget.checked;
                                                updatePreview();
                                            }}
                                        />
                                        Show Buttons
                                    </label>
                                </div>
                                <div class={sectionContainerClassName}>
                                    <span class={sectionTitleClassName}>Preview</span>
                                    {toastPreviewContainer}
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                                    <button
                                        class={setAsDefaultButtonClassName}
                                        disabled={activeThemeId === t.id}
                                        onClick={(event) => {
                                            const buttons = document.getElementsByClassName(setAsDefaultButtonClassName);
                                            for (const button of buttons) {
                                                (button as HTMLButtonElement).disabled = false;
                                            }
                                            event.currentTarget.disabled = true;
                                            activeThemeId = t.id;
                                            setActiveToastTheme(t.theme);
                                        }}
                                    >
                                        Set as default
                                    </button>
                                </div>
                            </div>
                        );
                    })}
            </div>
        </Dialog>
    ) as HTMLDialogElement;

    document.head.append(scrollbarStyle);
    dialog.addEventListener("close", () => scrollbarStyle.remove(), { once: true });
    document.body.append(dialog);
    dialog.showModal();
}
