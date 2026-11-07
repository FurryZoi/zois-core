import { X, Palette } from "lucide";
import { createElement } from "lucide";
import { getDynamicClass, getDynamicKeyframes } from "../ui";
import type { ToastRenderData } from "./base";
import { ToastTheme, ToastTier } from "./base";
import { dismissToast } from "../toasts";
import { getSettings } from "../settings";
import { createThemesDialog } from "../toastThemesDialog";
import { eventBus } from "../events";

const FIXED_UNIT = 10;

const CYBER_TYPING_SPEED = 30;
const CYBER_ACCENT = "#00ff41";
const CYBER_GLOW = "rgba(0, 255, 65, 0.35)";

const TYPE_LABELS: Record<string, string> = {
    info: "[INFO]",
    success: "[SUCCESS]",
    warning: "[WARNING]",
    error: "[CRITICAL ERROR]",
    spinner: "[PROCESSING]",
};

function ensureCyberKeyframes() {
    getDynamicKeyframes("cyber-micro-glitch", {
        "0%, 100%": { transform: "translateX(0)", filter: "blur(0)" },
        "25%": { transform: "translateX(-2px)", filter: "blur(0.5px)" },
        "75%": { transform: "translateX(2px)", filter: "blur(0.5px)" },
    });
    getDynamicKeyframes("cyber-blink", {
        "0%, 100%": { opacity: "1" },
        "50%": { opacity: "0" },
    });
    getDynamicKeyframes("cyber-scanline-sweep", {
        "0%": { backgroundPosition: "0 -100%" },
        "100%": { backgroundPosition: "0 200%" },
    });
    getDynamicKeyframes("cyber-neon-pulse", {
        "0%, 100%": {
            boxShadow:
                "0 0 1.07em rgba(0, 0, 0, 0.5), 0 0 1.29em var(--toast-glow), inset 0 0 2.14em rgba(0, 0, 0, 0.4)",
        },
        "50%": {
            boxShadow:
                "0 0 1.07em rgba(0, 0, 0, 0.5), 0 0 2em var(--toast-glow), inset 0 0 2.14em rgba(0, 0, 0, 0.4)",
        },
    });
    getDynamicKeyframes("cyber-glitch-entry", {
        "0%": {
            transform: "translateX(60px) scale(0.95) skewX(0deg)",
            filter: "blur(2px)",
        },
        "15%": {
            transform: "translateX(-8px) scale(1.02) skewX(-6deg)",
            filter: "blur(0)",
        },
        "30%": { transform: "translateX(6px) scale(0.99) skewX(4deg)" },
        "45%": { transform: "translateX(-3px) scale(1.01) skewX(-2deg)" },
        "60%": { transform: "translateX(2px) scale(1) skewX(1deg)" },
        "75%": { transform: "translateX(-1px) scale(1) skewX(0deg)" },
        "100%": {
            transform: "translateX(0) scale(1) skewX(0deg)",
            filter: "blur(0)",
        },
    });
    getDynamicKeyframes("cyber-rgb-split", {
        "0%, 100%": { opacity: "0" },
        "10%, 30%, 50%": { opacity: "0.7" },
        "20%, 40%": { opacity: "0" },
    });
    getDynamicKeyframes("cyber-glitch-exit", {
        "0%": {
            opacity: "1",
            transform: "translateX(0) scale(1)",
            filter: "blur(0)",
        },
        "20%": {
            opacity: "0.9",
            transform: "translateX(-6px) scale(1.02) skewX(8deg)",
            filter: "blur(0)",
        },
        "40%": {
            opacity: "0.7",
            transform: "translateX(8px) scale(0.98) skewX(-6deg)",
        },
        "60%": {
            opacity: "0.4",
            transform: "translateX(-4px) scale(1.01)",
            filter: "blur(1px)",
        },
        "100%": {
            opacity: "0",
            transform: "translateX(40px) scale(0.92)",
            filter: "blur(4px)",
        },
    });
    getDynamicKeyframes("cyber-progress-shrink", {
        from: { transform: "scaleX(1)" },
        to: { transform: "scaleX(0)" },
    });
}

function typewriterEffect(
    element: HTMLElement,
    text: string,
    glitchLayer: HTMLElement | null,
    onComplete?: () => void
) {
    let i = 0;
    const interval = setInterval(() => {
        element.textContent += text.charAt(i);
        if (glitchLayer) {
            glitchLayer.setAttribute("data-text", element.textContent ?? "");
        }
        if (Math.random() < 0.08) {
            const toastEl = element.closest("[data-zc-cyber-toast]") as HTMLElement | null;
            if (toastEl) {
                toastEl.classList.add("micro-glitch");
                setTimeout(() => toastEl.classList.remove("micro-glitch"), 80);
            }
        }
        i++;
        if (i > text.length - 1) {
            clearInterval(interval);
            if (onComplete) onComplete();
        }
    }, CYBER_TYPING_SPEED);
}

function getCyberToastClass(): string {
    const accent = CYBER_ACCENT;
    const glow = CYBER_GLOW;
    const entryName = getDynamicKeyframes("cyber-glitch-entry", {
        "0%": {
            transform: "translateX(60px) scale(0.95) skewX(0deg)",
            filter: "blur(2px)",
        },
        "15%": {
            transform: "translateX(-8px) scale(1.02) skewX(-6deg)",
            filter: "blur(0)",
        },
        "30%": { transform: "translateX(6px) scale(0.99) skewX(4deg)" },
        "45%": { transform: "translateX(-3px) scale(1.01) skewX(-2deg)" },
        "60%": { transform: "translateX(2px) scale(1) skewX(1deg)" },
        "75%": { transform: "translateX(-1px) scale(1) skewX(0deg)" },
        "100%": {
            transform: "translateX(0) scale(1) skewX(0deg)",
            filter: "blur(0)",
        },
    });
    const pulseName = getDynamicKeyframes("cyber-neon-pulse", {
        "0%, 100%": {
            boxShadow:
                "0 0 1.07em rgba(0, 0, 0, 0.5), 0 0 1.29em var(--toast-glow), inset 0 0 2.14em rgba(0, 0, 0, 0.4)",
        },
        "50%": {
            boxShadow:
                "0 0 1.07em rgba(0, 0, 0, 0.5), 0 0 2em var(--toast-glow), inset 0 0 2.14em rgba(0, 0, 0, 0.4)",
        },
    });
    const exitName = getDynamicKeyframes("cyber-glitch-exit", {
        "0%": {
            opacity: "1",
            transform: "translateX(0) scale(1)",
            filter: "blur(0)",
        },
        "20%": {
            opacity: "0.9",
            transform: "translateX(-6px) scale(1.02) skewX(8deg)",
            filter: "blur(0)",
        },
        "40%": {
            opacity: "0.7",
            transform: "translateX(8px) scale(0.98) skewX(-6deg)",
        },
        "60%": {
            opacity: "0.4",
            transform: "translateX(-4px) scale(1.01)",
            filter: "blur(1px)",
        },
        "100%": {
            opacity: "0",
            transform: "translateX(40px) scale(0.92)",
            filter: "blur(4px)",
        },
    });
    const microName = getDynamicKeyframes("cyber-micro-glitch", {
        "0%, 100%": { transform: "translateX(0)", filter: "blur(0)" },
        "25%": { transform: "translateX(-2px)", filter: "blur(0.5px)" },
        "75%": { transform: "translateX(2px)", filter: "blur(0.5px)" },
    });
    const rgbName = getDynamicKeyframes("cyber-rgb-split", {
        "0%, 100%": { opacity: "0" },
        "10%, 30%, 50%": { opacity: "0.7" },
        "20%, 40%": { opacity: "0" },
    });
    const scanName = getDynamicKeyframes("cyber-scanline-sweep", {
        "0%": { backgroundPosition: "0 -100%" },
        "100%": { backgroundPosition: "0 200%" },
    });

    return getDynamicClass({
        base: {
            maxWidth: "25vw",
            padding: "1.43em",
            paddingBottom: "1.71em",
            background: "rgba(10, 10, 15, 0.95)",
            border: `1px solid ${accent}`,
            color: accent,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            position: "relative",
            overflow: "hidden",
            pointerEvents: "auto",
            cursor: "default",
            boxShadow: `0 0 1.07em rgba(0, 0, 0, 0.5), 0 0 1.43em ${glow}, inset 0 0 2.14em rgba(0, 0, 0, 0.4)`,
            opacity: "0",
            transform: "translateX(60px) scale(0.95)",
            filter: "blur(2px)",
            transition:
                "opacity 0.35s ease, transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), filter 0.35s ease",
            backgroundImage:
                "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
            backgroundSize: "100% 0.14em, 0.21em 100%",
        } as Partial<CSSStyleDeclaration>,
        before: {
            content: "''",
            position: "absolute",
            top: "0",
            right: "0",
            bottom: "0",
            left: "0",
            background:
                "linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.03) 48%, rgba(255, 255, 255, 0.08) 50%, rgba(255, 255, 255, 0.03) 52%, transparent 100%)",
            backgroundSize: "100% 200%",
            animation: `${scanName} 3s linear infinite`,
            pointerEvents: "none",
            opacity: "0.6",
        } as Partial<CSSStyleDeclaration>,
        after: {
            content: "''",
            position: "absolute",
            bottom: "-1px",
            right: "-1px",
            width: "1.07em",
            height: "1.07em",
            background: "#000",
            borderTop: `1px solid ${accent}`,
            borderLeft: `1px solid ${accent}`,
        } as Partial<CSSStyleDeclaration>,
        ".visible": {
            opacity: "1",
            transform: "translateX(0) scale(1)",
            filter: "blur(0)",
            animation: `${entryName} 0.55s cubic-bezier(0.22, 1, 0.36, 1), ${pulseName} 2.5s ease-in-out infinite 0.55s`,
        } as Partial<CSSStyleDeclaration>,
        ".exiting": {
            animation: `${exitName} 0.4s ease-in forwards`,
            pointerEvents: "none",
        } as Partial<CSSStyleDeclaration>,
        ".micro-glitch": {
            animation: `${microName} 0.08s steps(2) 1`,
        } as Partial<CSSStyleDeclaration>,
        ".paused .cyber-progress": {
            animationPlayState: "paused",
        } as Partial<CSSStyleDeclaration>,
        ".visible .cyber-glitch": {
            animation: `${rgbName} 0.55s steps(2) 1`,
        } as Partial<CSSStyleDeclaration>,
    });
}

export class CyberToastTheme extends ToastTheme {
    public name = "Cyber"
    public details = "Modified https://github.com/hsr88/cyber-toast-js adapted for BC. Unlocks after enabling dev mode."
    public tier = ToastTier.SR;

    public init(): void {
        if (!this.isUnlocked && getSettings().devMode) this.unlock();
        eventBus?.on("coreSettingsChanged", (event) => {
            if (this.isUnlocked) return;
            if (event.settings.devMode) this.unlock();
        });
    }

    public render({ title, message, type, duration, id, buttons, size, isInteractable = true }: ToastRenderData): HTMLDivElement {
        ensureCyberKeyframes();

        const header = TYPE_LABELS[type] ?? "[SYSTEM MESSAGE]";
        const displayText = title ? `${title}: ${message}` : message;
        const accent = CYBER_ACCENT;
        const glow = CYBER_GLOW;

        const toastClass = getCyberToastClass();
        const headerClass = getDynamicClass({
            base: {
                fontSize: "0.7em",
                opacity: "0.7",
                marginBottom: "0.57em",
                display: "flex",
                alignItems: "center",
                gap: "0.57em",
            },
            before: {
                content: "'>'",
                opacity: "0.9",
            } as Partial<CSSStyleDeclaration>,
        });
        const bodyClass = getDynamicClass({
            base: { position: "relative", zIndex: "1" },
        });
        const glitchClass = getDynamicClass({
            base: {
                position: "absolute",
                top: "0",
                right: "0",
                bottom: "0",
                left: "0",
                pointerEvents: "none",
                opacity: "0",
                mixBlendMode: "screen",
            } as Partial<CSSStyleDeclaration>,
            before: {
                content: "attr(data-text)",
                position: "absolute",
                top: "3.71em",
                left: "1.43em",
                right: "1.43em",
                fontSize: "1em",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#ff0055",
                clipPath: "inset(0 0 55% 0)",
                transform: "translateX(-3px)",
            } as Partial<CSSStyleDeclaration>,
            after: {
                content: "attr(data-text)",
                position: "absolute",
                top: "3.71em",
                left: "1.43em",
                right: "1.43em",
                fontSize: "1em",
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#00d9ff",
                clipPath: "inset(45% 0 0 0)",
                transform: "translateX(3px)",
            } as Partial<CSSStyleDeclaration>,
        });
        const textClass = getDynamicClass({
            base: { position: "relative", zIndex: "1" },
        });
        const blinkName = getDynamicKeyframes("cyber-blink", {
            "0%, 100%": { opacity: "1" },
            "50%": { opacity: "0" },
        });
        const cursorClass = getDynamicClass({
            base: {
                display: "inline-block",
                width: "0.57em",
                height: "1em",
                backgroundColor: "currentColor",
                animation: `${blinkName} 0.8s step-end infinite`,
                verticalAlign: "middle",
                marginLeft: "0.29em",
                boxShadow: "0 0 0.43em currentColor",
            },
        });
        const progressShrinkName = getDynamicKeyframes("cyber-progress-shrink", {
            from: { transform: "scaleX(1)" },
            to: { transform: "scaleX(0)" },
        });
        const progressClass = getDynamicClass({
            base: {
                position: "absolute",
                bottom: "0",
                left: "0",
                height: "0.14em",
                width: "100%",
                background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                transformOrigin: "left center",
                opacity: "0.85",
                boxShadow: `0 0 0.57em ${glow}`,
            },
        });
        const actionsClass = getDynamicClass({
            base: {
                position: "absolute",
                top: "0.57em",
                right: "0.57em",
                display: "flex",
                gap: "0.43em",
                zIndex: "10",
            },
            ">button": {
                background: "transparent",
                border: `1px solid ${accent}`,
                cursor: "pointer",
                padding: "0.14em 0.29em",
                fontSize: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: "0.75",
                color: accent,
            },
            ">button:hover": {
                opacity: "1",
                boxShadow: `0 0 0.57em ${glow}`,
            },
            ">button>svg": {
                width: "1em",
                height: "1em",
            },
        });
        const buttonsContainerClass = getDynamicClass({
            base: {
                display: "flex",
                gap: "0.43em",
                marginTop: "0.71em",
                flexWrap: "wrap",
                position: "relative",
                zIndex: "3",
            },
            ">button": {
                flexShrink: "0",
                background: "transparent",
                border: `1px solid ${accent}`,
                color: accent,
                fontWeight: "bold",
                fontSize: "0.75em",
                padding: "0.29em 0.71em",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                cursor: "pointer",
                transition: "opacity 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
                opacity: "0.85",
            },
            ">button:hover": {
                opacity: "1",
                background: "rgba(0, 255, 65, 0.12)",
                boxShadow: `0 0 0.71em ${glow}`,
            },
            ">button:active": {
                background: "rgba(0, 255, 65, 0.2)",
            },
        });

        const closeIcon = createElement(X);
        const paletteIcon = createElement(Palette);

        const glitchLayer = (<div data-text="" />) as HTMLDivElement;
        glitchLayer.className = glitchClass + " cyber-glitch";

        const textContent = (<span />) as HTMLSpanElement;
        textContent.className = textClass;

        const cursor = (<span />) as HTMLSpanElement;
        cursor.className = cursorClass;

        const progressBar = (<div class="cyber-progress" />) as HTMLDivElement;
        progressBar.className = `${progressClass} cyber-progress`;

        const headerEl = (<div>{header}</div>) as HTMLDivElement;
        headerEl.className = headerClass;

        const bodyEl = (
            <div>
                {textContent}
                {cursor}
                {buttons !== undefined && (
                    <div class={buttonsContainerClass}>
                        {buttons.map((b) => (
                            <button
                                type="button"
                                onClick={() => {
                                    if (!isInteractable) return;
                                    b.action();
                                }}
                            >
                                {b.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        ) as HTMLDivElement;
        bodyEl.className = bodyClass;

        const toast = (
            <div
                data-dismissed="false"
                data-zc-toast-type={type}
                data-zc-toast-id={id}
                data-zc-cyber-toast="true"
                onMouseEnter={() => {
                    if (toast.dataset.dismissed === "true") return;
                    clearTimeout((toast as any)._dismissTimer);
                    (toast as any)._remainingTime -=
                        performance.now() - (toast as any)._activeStart;
                    toast.classList.add("paused");
                }}
                onMouseLeave={() => {
                    if (toast.dataset.dismissed === "true") return;
                    toast.classList.remove("paused");
                    (toast as any)._activeStart = performance.now();
                    (toast as any)._dismissTimer = setTimeout(
                        () => dismissToast(toast),
                        (toast as any)._remainingTime
                    );
                }}
            >
                {glitchLayer}
                <div class={actionsClass}>
                    <button
                        type="button"
                        title="Theme menu"
                        onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            if (!isInteractable) return;
                            createThemesDialog();
                        }}
                    >
                        {paletteIcon}
                    </button>
                    <button
                        type="button"
                        title="Close"
                        onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            if (!isInteractable) return;
                            dismissToast(toast);
                        }}
                    >
                        {closeIcon}
                    </button>
                </div>
                {headerEl}
                {bodyEl}
                {progressBar}
            </div>
        ) as HTMLDivElement;

        toast.className = toastClass;
        toast.style.setProperty("--toast-accent", accent);
        toast.style.setProperty("--toast-glow", glow);

        const sz = (value: number): string =>
            size.scaleWithCanvas
                ? `calc(var(--size-unit) * ${value * size.scaleFactor}px)`
                : `${value * size.scaleFactor * FIXED_UNIT}px`;

        toast.style.fontSize = sz(1.4);

        void toast.offsetWidth;
        toast.classList.add("visible");

        const typingDuration = displayText.length * CYBER_TYPING_SPEED;
        const totalDuration = duration + typingDuration;

        progressBar.style.animation = `${progressShrinkName} ${totalDuration}ms linear forwards`;

        (toast as any)._dismissTimer = setTimeout(
            () => dismissToast(toast),
            totalDuration
        );
        (toast as any)._remainingTime = totalDuration;
        (toast as any)._activeStart = performance.now();

        typewriterEffect(textContent, displayText, glitchLayer);

        return toast;
    }
}

export const cyberToastTheme = new CyberToastTheme();