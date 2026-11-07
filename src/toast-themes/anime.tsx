import {
    X,
    Palette,
    createElement,
} from "lucide";
import { getDynamicClass, getDynamicKeyframes } from "../ui";
import { ToastRenderData, ToastTheme, ToastTier, ToastType } from "./base";
import { dismissToast } from "../toasts";
import infoSvg from "../assets/icons/anime-toast-theme/info.svg";
import warningSvg from "../assets/icons/anime-toast-theme/warning.svg";
import errorSvg from "../assets/icons/anime-toast-theme/error.svg";
import successSvg from "../assets/icons/anime-toast-theme/success.svg";
import { hookFunction, HookPriority } from "../modSdk";
import { createThemesDialog } from "../toastThemesDialog";
import { getSettings } from "../settings";

const FIXED_UNIT = 10;

const BACKGROUND_COLOR = "#15122b";

const ACCENT_COLOR: Record<ToastType, string> = {
    info: "#5cc8ff",
    warning: "#ffcf3d",
    error: "#ff4d6d",
    success: "#6dffb0",
    spinner: "#ff9ecb",
};

const LABEL: Record<ToastType, string> = {
    info: "情報",
    warning: "警告",
    error: "エラー",
    success: "成功",
    spinner: "読込中",
};

const ICON_SVG: Record<Exclude<ToastType, "spinner">, string> = {
    info: infoSvg,
    warning: warningSvg,
    error: errorSvg,
    success: successSvg,
};

const PETALS = [
    { left: "28%", duration: "4.2s", delay: "0s" },
    { left: "52%", duration: "5.1s", delay: "1.3s" },
    { left: "74%", duration: "4.6s", delay: "2.4s" },
    { left: "90%", duration: "5.6s", delay: "0.7s" },
];

type AnimeKeyframes = {
    burst: string;
    petal: string;
    ring: string;
    spin: string;
    spinReverse: string;
    pulse: string;
};

let keyframes: AnimeKeyframes | undefined;

function сharacterIsWearingFullCosplayGirl(C: Character) {
    const requiredPieces = [
        { group: "Cloth", name: "AnimeGirl" },
        { group: "Shoes", name: "AnimeGirlBoots" },
        { group: "Gloves", name: "AnimeGirlGloves" },
        { group: "Hat", name: "AnimeGirlTiara" },
        { group: "Necklace", name: "AnimeGirlNecklace" },
    ];
    if (!C || !C.Appearance) return false;
    return requiredPieces.every(({ group, name }) => {
        const item = InventoryGet(C, group as AssetGroupName);
        return !!item && item.Asset.Name === name;
    });
}

function ensureStyles(): AnimeKeyframes {
    if (keyframes) return keyframes;

    keyframes = {
        burst: getDynamicKeyframes("anime-burst", {
            from: { transform: "translate(-50%, -50%) rotate(0deg)" },
            to: { transform: "translate(-50%, -50%) rotate(360deg)" },
        }),
        petal: getDynamicKeyframes("anime-petal", {
            "0%": { opacity: "0", transform: "translate(0, 0) rotate(0deg)" },
            "12%": { opacity: "0.9" },
            "100%": { opacity: "0", transform: "translate(-3.2em, 5.5em) rotate(540deg)" },
        }),
        ring: getDynamicKeyframes("anime-ring", {
            "0%": { transform: "scale(1)", opacity: "0.9" },
            "100%": { transform: "scale(1.8)", opacity: "0" },
        }),
        spin: getDynamicKeyframes("anime-spin", {
            from: { transform: "rotate(0deg)" },
            to: { transform: "rotate(360deg)" },
        }),
        spinReverse: getDynamicKeyframes("anime-spin-reverse", {
            from: { transform: "rotate(360deg)" },
            to: { transform: "rotate(0deg)" },
        }),
        pulse: getDynamicKeyframes("anime-pulse", {
            "0%": { transform: "scale(0.6)", opacity: "0.6" },
            "50%": { transform: "scale(1.15)", opacity: "1" },
            "100%": { transform: "scale(0.6)", opacity: "0.6" },
        }),
    };
    return keyframes;
}

function decodeSvg(source: string): string {
    if (!source.startsWith("data:")) {
        return new TextDecoder().decode(Uint8Array.from(atob(source), (c) => c.charCodeAt(0)));
    }
    const comma = source.indexOf(",");
    const payload = source.slice(comma + 1);
    if (!source.slice(0, comma).includes(";base64")) return decodeURIComponent(payload);
    return new TextDecoder().decode(Uint8Array.from(atob(payload), (c) => c.charCodeAt(0)));
}

function getCharacterIcon(type: Exclude<ToastType, "spinner">, accent: string): HTMLSpanElement {
    const o = "0.045em";
    const className = getDynamicClass({
        base: { display: "flex", width: "1.68em", height: "1.68em", position: "relative", zIndex: "1" },
        ">svg": {
            width: "100%",
            height: "100%",
            display: "block",
            overflow: "visible",
            filter: `drop-shadow(${o} 0 0 ${accent}) drop-shadow(-${o} 0 0 ${accent}) drop-shadow(0 ${o} 0 ${accent}) drop-shadow(0 -${o} 0 ${accent})`,
        },
    });
    const holder = document.createElement("span");
    holder.className = className;
    holder.innerHTML = decodeSvg(ICON_SVG[type]);
    const svg = holder.querySelector("svg");
    if (svg) svg.style.color = accent;
    return holder;
}

function getSpinnerIcon(accent: string, kf: AnimeKeyframes): HTMLDivElement {
    const containerClass = getDynamicClass({
        base: {
            position: "relative",
            width: "1.68em",
            height: "1.68em",
            zIndex: "1",
        },
    });
    const outerClass = getDynamicClass({
        base: {
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            boxSizing: "border-box",
            borderRadius: "50%",
            border: "0.12em solid transparent",
            borderTopColor: accent,
            borderBottomColor: `${accent}55`,
            animation: `${kf.spin} 1.1s linear infinite`,
        },
    });
    const innerClass = getDynamicClass({
        base: {
            position: "absolute",
            top: "20%",
            left: "20%",
            right: "20%",
            bottom: "20%",
            boxSizing: "border-box",
            borderRadius: "50%",
            border: "0.1em solid transparent",
            borderLeftColor: "#ffffff",
            borderRightColor: `${accent}88`,
            animation: `${kf.spinReverse} 0.8s linear infinite`,
        },
    });
    const dotClass = getDynamicClass({
        base: {
            position: "absolute",
            top: "40%",
            left: "40%",
            right: "40%",
            bottom: "40%",
            borderRadius: "50%",
            background: accent,
            boxShadow: `0 0 0.4em ${accent}`,
            animation: `${kf.pulse} 1s ease-in-out infinite`,
        },
    });

    const el = (
        <div class={containerClass}>
            <div class={outerClass} />
            <div class={innerClass} />
            <div class={dotClass} />
        </div>
    ) as HTMLDivElement;
    return el;
}

export class AnimeToastTheme extends ToastTheme {
    public name = "Anime"
    public details = "Very first SSR theme with amazing style.\nUnlocks when you put on a full Cosplay Girl suit."
    public tier = ToastTier.SSR;

    public init(): void {
        hookFunction("CharacterRefresh", HookPriority.OBSERVE, (args, next) => {
            const result = next(args);
            if (this.isUnlocked) return;
            const C = args[0] as Character | undefined;
            if (C && C.IsPlayer?.()) {
                if (сharacterIsWearingFullCosplayGirl(C)) this.unlock();
            }
            return result;
        });
    }

    public render({ title, message, type, duration, id, buttons, size, isInteractable = true }: ToastRenderData): HTMLDivElement {
        const kf = ensureStyles();

        const pos = getSettings().toasts?.position ?? "bottom-left";

        const accent = ACCENT_COLOR[type];

        const textColor = "#d9d4f2";
        const titleColor = "#ffffff";

        const toastClassName = getDynamicClass({
            base: {
                display: "flex",
                columnGap: "0.6em",
                alignItems: "flex-start",
                maxWidth: "25vw",
                position: "relative",
                overflow: "hidden",
                background: `linear-gradient(135deg, ${BACKGROUND_COLOR} 0%, #231a45 100%)`,
                border: `2px solid ${accent}`,
                borderRadius: "0.15em",
                clipPath: "polygon(0.8em 0, 100% 0, 100% calc(100% - 0.8em), calc(100% - 0.8em) 100%, 0 100%, 0 0.8em)",
            },
            "::before": {
                content: "\"\"",
                position: "absolute",
                top: "50%",
                left: "1.6em",
                width: "26em",
                height: "26em",
                background: `repeating-conic-gradient(from 0deg, ${accent}40 0deg 3deg, transparent 3deg 9deg)`,
                maskImage: "radial-gradient(circle, black 5%, transparent 62%)",
                animation: `${kf.burst} 18s linear infinite`,
                pointerEvents: "none",
                zIndex: "0",
            },
            "::after": {
                content: "\"\"",
                position: "absolute",
                top: "0",
                right: "0",
                width: "55%",
                height: "100%",
                backgroundImage: `radial-gradient(circle, ${accent}77 0.07em, transparent 0.1em)`,
                backgroundSize: "0.45em 0.45em",
                maskImage: "linear-gradient(115deg, transparent 40%, black 100%)",
                opacity: "0.55",
                pointerEvents: "none",
                zIndex: "0",
            },
        });

        const iconColumnClass = getDynamicClass({
            base: {
                flexShrink: "0",
                alignSelf: "flex-start",
                position: "relative",
                zIndex: "1",
                margin: "0",
            },
        });

        const petalClassName = getDynamicClass({
            base: {
                position: "absolute",
                top: "-0.8em",
                width: "0.55em",
                height: "0.4em",
                background: "#ffb7d5",
                borderRadius: "100% 0 100% 0",
                opacity: "0",
                pointerEvents: "none",
                zIndex: "1",
            },
        });

        const tagClassName = getDynamicClass({
            base: {
                display: "block",
                width: "fit-content",
                marginBottom: "0.25em",
                padding: "0.05em 0.9em 0.05em 0.7em",
                fontSize: "0.55em",
                fontWeight: "800",
                letterSpacing: "0.1em",
                color: BACKGROUND_COLOR,
                background: accent,
                clipPath: "polygon(0 0, 100% 0, calc(100% - 0.6em) 100%, 0 100%)",
            },
        });

        const buttonsContainerClassName = getDynamicClass({
            base: {
                display: "flex",
                gap: "0.4em",
                marginTop: "0.4em",
                flexWrap: "wrap",
                position: "relative",
                zIndex: "3",
            },
            ">button": {
                flexShrink: "0",
                background: accent,
                border: "none",
                color: BACKGROUND_COLOR,
                fontWeight: "800",
                fontSize: "0.8em",
                padding: "0.2em 1em",
                clipPath: "polygon(0.4em 0, 100% 0, calc(100% - 0.4em) 100%, 0 100%)",
                cursor: "pointer",
                transition: "transform 0.15s ease, filter 0.15s ease",
            },
            ">button:hover": {
                transform: "translateY(-0.1em)",
                filter: "brightness(1.15)",
            },
            ">button:active": {
                transform: "translateY(0.05em)",
            },
        });

        const actionsClassName = getDynamicClass({
            base: {
                position: "absolute",
                top: "0.4em",
                right: "0.35em",
                display: "flex",
                gap: "0.1em",
                zIndex: "10",
            },
            ">button": {
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0.1em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: "0.75",
                color: titleColor,
                borderRadius: "0.15em",
                transition: "opacity 0.15s ease, background 0.15s ease, transform 0.15s ease",
            },
            ">button:hover": {
                opacity: "1",
                background: `${accent}44`,
                transform: "rotate(90deg)",
            },
            ">button>svg": {
                width: "0.9em",
                height: "0.9em",
            },
        });

        const closeIcon = createElement(X);
        const paletteIcon = createElement(Palette);

        const icon =
            type === "spinner"
                ? getSpinnerIcon(accent, kf)
                : getCharacterIcon(type, accent);

        const toast = (
            <div
                class={toastClassName}
                data-zc-toast-type={type}
                data-zc-toast-id={id}
            >
                {type !== "spinner" && typeof duration === "number" && (
                    <div
                        class="zcToast-ProgressBar"
                        style={{
                            animation: `zcToast-progress ${duration}ms linear 0s 1 alternate none`,
                            position: "absolute",
                            top: "0",
                            left: "0",
                            height: "100%",
                            background: `linear-gradient(90deg, ${accent}38, ${accent}10)`,
                            zIndex: "0",
                        }}
                    />
                )}
                {PETALS.map((p) => (
                    <span
                        class={petalClassName}
                        style={{
                            left: p.left,
                            animation: `${kf.petal} ${p.duration} linear ${p.delay} infinite`,
                        }}
                    />
                ))}
                <div class={actionsClassName}>
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
                <div class={iconColumnClass}>
                    {icon}
                </div>
                <div
                    style={{
                        width: "100%",
                        minWidth: "0",
                        paddingRight: "2.5em",
                        position: "relative",
                        zIndex: "1",
                    }}
                >
                    <span class={tagClassName}>{LABEL[type]}</span>
                    {!!title && (
                        <p
                            style={{
                                color: titleColor,
                                fontWeight: "800",
                                fontStyle: "italic",
                                fontSize: "0.9em",
                                margin: "0",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                width: "100%",
                                textShadow: `0.06em 0.06em 0 ${accent}88`,
                            }}
                        >
                            {title}
                        </p>
                    )}
                    <p
                        style={{
                            color: textColor,
                            fontSize: !!title ? "0.72em" : "0.85em",
                            overflowWrap: "anywhere",
                            fontWeight: !!title ? "400" : "700",
                            margin: "0",
                            marginTop: !!title ? "0.15em" : undefined,
                            lineHeight: "1.3",
                        }}
                    >
                        {message}
                    </p>
                    {buttons !== undefined && (
                        <div class={buttonsContainerClassName}>
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
            </div>
        ) as HTMLDivElement;

        const sz = (value: number): string =>
            size.scaleWithCanvas
                ? `calc(var(--size-unit) * ${value * size.scaleFactor}px)`
                : `${value * size.scaleFactor * FIXED_UNIT}px`;

        toast.style.fontSize = sz(2.15);
        toast.style.padding = `${sz(0.85)} ${sz(0.95)}`;
        toast.style.animation = `${pos.includes("left") ? "zcSlideInFromLeft" : "zcSlideInFromRight"
            } 0.3s ease-out forwards`;
        void toast.offsetHeight;

        if (type !== "spinner") {
            setTimeout(() => {
                toast.style.animation = `${pos.includes("left") ? "zcSlideOutToLeft" : "zcSlideOutToRight"
                    } 0.3s ease-out forwards`;
            }, duration);
            setTimeout(() => toast.remove(), duration + 300);
        }

        return toast;
    }
}

export const animeToastTheme = new AnimeToastTheme();