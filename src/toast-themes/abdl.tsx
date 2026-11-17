import {
    X,
    Palette,
    createElement,
} from "lucide";
import { getDynamicClass, getDynamicKeyframes } from "../ui";
import { ToastRenderData, ToastTheme, ToastThemeTier, ToastType } from "./base";
import { dismissToast } from "../toasts";
import { createThemesDialog } from "../toastThemesDialog";
import { getSettings } from "../settings";
import heartSvg from "../assets/icons/toast-themes/abdl/heart.svg";
import starSvg from "../assets/icons/toast-themes/abdl/star.svg";
import sparkleSvg from "../assets/icons/toast-themes/abdl/sparkle.svg";
import bottleSvg from "../assets/icons/toast-themes/abdl/bottle.svg";
import diaperSvg from "../assets/icons/toast-themes/abdl/diaper.svg";
import teddySvg from "../assets/icons/toast-themes/abdl/teddy.svg";
import { hookFunction, HookPriority } from "../modSdk";
import { logger } from "../logging";

const FIXED_UNIT = 10;

const OUTLINE_COLOR = "#6b4f7a";
const TITLE_COLOR = "#5a3f6b";
const TEXT_COLOR = "#6f5a7e";
const ART_STROKE = "#b9a5d8";
const NURSERY_ROOM_NAME = "ABDL Nursery";

const ACCENT_COLOR: Record<ToastType, string> = {
    info: "#6fb8f0",
    warning: "#f7b84b",
    error: "#ff6f9c",
    success: "#5fd3a5",
    spinner: "#b69cf0",
};

const TINT_COLOR: Record<ToastType, string> = {
    info: "#eaf5ff",
    warning: "#fff6df",
    error: "#ffe9f1",
    success: "#e8faf2",
    spinner: "#f2ecff",
};

const FLOATERS: {
    left: string;
    size: string;
    source: string;
    color: string;
    duration: string;
    delay: string;
}[] = [
    { left: "30%", size: "0.6em", source: heartSvg, color: "#ffb3cf", duration: "5.2s", delay: "0s" },
    { left: "55%", size: "0.5em", source: starSvg, color: "#ffe08a", duration: "6s", delay: "1.6s" },
    { left: "76%", size: "0.6em", source: heartSvg, color: "#cdb8f5", duration: "5.6s", delay: "2.8s" },
    { left: "91%", size: "0.45em", source: starSvg, color: "#a8dcfa", duration: "6.4s", delay: "0.9s" },
];

type AbdlKeyframes = {
    float: string;
    sway: string;
    beat: string;
};

let keyframes: AbdlKeyframes | undefined;

function ensureStyles(): AbdlKeyframes {
    if (keyframes) return keyframes;

    keyframes = {
        float: getDynamicKeyframes("abdl-float", {
            "0%": { opacity: "0", transform: "translate(0, 0) rotate(0deg) scale(0.6)" },
            "15%": { opacity: "0.9" },
            "100%": { opacity: "0", transform: "translate(0.8em, -5em) rotate(25deg) scale(1)" },
        }),
        sway: getDynamicKeyframes("abdl-sway", {
            "0%, 100%": { transform: "rotate(-4deg) scale(1)" },
            "50%": { transform: "rotate(4deg) scale(1.08)" },
        }),
        beat: getDynamicKeyframes("abdl-beat", {
            "0%, 100%": { transform: "scale(1)" },
            "15%": { transform: "scale(1.3)" },
            "30%": { transform: "scale(1)" },
            "45%": { transform: "scale(1.2)" },
            "60%": { transform: "scale(1)" },
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

function toDataUrl(svg: string): string {
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function parseSvg(source: string): { viewBox: string; inner: string } {
    const svg = decodeSvg(source);
    const match = svg.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
    const viewBox = match?.[1].match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 32 32";
    return { viewBox, inner: match?.[2] ?? "" };
}

function recolorSvg(source: string, color: string): string {
    return decodeSvg(source)
        .replace(/style="color:[^"]*"/, `style="color:${color}"`)
        .split(OUTLINE_COLOR)
        .join(ART_STROKE);
}

type ArtPlacement = {
    source: string;
    x: number;
    y: number;
    scale: number;
    rot?: number;
    color?: string;
};

const ART: ArtPlacement[] = [
    { source: bottleSvg, x: 32, y: 46, rot: -14, scale: 0.72 },
    { source: starSvg, x: 68, y: 18, scale: 0.8, color: "#ffe08a" },
    { source: heartSvg, x: 76, y: 72, rot: -10, scale: 0.55, color: "#cdb8f5" },
    { source: sparkleSvg, x: 132, y: 16, scale: 0.9, color: "#ffffff" },
    { source: heartSvg, x: 134, y: 74, rot: 12, scale: 0.5, color: "#ffb3cf" },
    { source: diaperSvg, x: 164, y: 46, rot: -8, scale: 0.7 },
    { source: starSvg, x: 198, y: 16, scale: 0.7, color: "#a8dcfa" },
    { source: heartSvg, x: 198, y: 74, rot: -12, scale: 0.55, color: "#9fe3c8" },
    { source: teddySvg, x: 228, y: 46, rot: 6, scale: 0.62 },
    { source: sparkleSvg, x: 250, y: 76, scale: 0.8, color: "#ffffff" },
    { source: heartSvg, x: 248, y: 14, rot: 14, scale: 0.45, color: "#ffcfae" },
];

let backgroundArt: string | undefined;

/**
 * Single SVG tile used as the toast background. It is assembled from the
 * icon files, so every drawing lives in assets/icons/toast-themes/abdl.
 * The tile repeats horizontally.
 */
function getBackgroundArt(): string {
    if (backgroundArt) return backgroundArt;

    const parts = ART.map(({ source, x, y, scale, rot = 0, color }) => {
        const { viewBox, inner } = parseSvg(source);
        const [, , vw, vh] = viewBox.split(/\s+/).map(Number);
        const w = vw * scale;
        const h = vh * scale;
        const style = color ? ` style="color:${color}"` : "";
        return `<g transform="rotate(${rot} ${x} ${y})"><svg x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" viewBox="${viewBox}" overflow="visible"${style}>${inner}</svg></g>`;
    });

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="90" viewBox="0 0 260 90"><g opacity="0.62">${parts.join("")}</g></svg>`;
    backgroundArt = toDataUrl(svg.split(OUTLINE_COLOR).join(ART_STROKE));
    return backgroundArt;
}

function getHeartIcon(accent: string, animation: string): HTMLSpanElement {
    const className = getDynamicClass({
        base: {
            display: "flex",
            width: "1.6em",
            height: "1.6em",
            position: "relative",
            zIndex: "1",
            transformOrigin: "50% 60%",
            animation,
        },
        ">svg": {
            width: "100%",
            height: "100%",
            display: "block",
            overflow: "visible",
            filter: `drop-shadow(0 0.08em 0.14em ${accent}88)`,
        },
    });
    const holder = document.createElement("span");
    holder.className = className;
    holder.innerHTML = decodeSvg(heartSvg);
    const svg = holder.querySelector("svg");
    if (svg) svg.style.color = accent;
    return holder;
}

export class AbdlToastTheme extends ToastTheme {
    public name = "ABDL"
    public details = "Cute pastel theme for ABDL lovers.\nColorful hearts, bottles, diapers and teddy bears.\nUnlocked after entering ABDL Nursery."
    public tier = ToastThemeTier.SR;

    public init(): void {
        if (!this.isUnlocked && ChatRoomData?.Name.toLowerCase() === NURSERY_ROOM_NAME.toLowerCase()) this.unlock();
        hookFunction("ChatRoomSync", HookPriority.OBSERVE, (args, next) => {
            if (this.isUnlocked) return next(args);
            const [data] = args;
            logger.debug(data);
            if (data.Name.toLowerCase() === NURSERY_ROOM_NAME.toLowerCase()) this.unlock();
            return next(args);
        });
    }

    public render(renderData: ToastRenderData): HTMLDivElement {
        renderData.isInteractable ??= true;
        const kf = ensureStyles();

        const pos = getSettings().toasts?.position ?? "bottom-left";

        const accent = ACCENT_COLOR[renderData.type];
        const tint = TINT_COLOR[renderData.type];

        const toastClassName = getDynamicClass({
            base: {
                display: "flex",
                columnGap: "0.55em",
                alignItems: "flex-start",
                maxWidth: "25vw",
                position: "relative",
                overflow: "hidden",
                backgroundColor: tint,
                backgroundImage: `${getBackgroundArt()}, linear-gradient(135deg, #fffafc 0%, ${tint} 100%)`,
                backgroundRepeat: "repeat-x, no-repeat",
                backgroundPosition: "right center, center",
                backgroundSize: "auto 100%, 100% 100%",
                border: `1.5px solid ${accent}`,
                borderRadius: "0.35em",
                boxShadow: `0 6px 18px ${accent}40, 0 0 0 1px rgba(0,0,0,0.04)`,
            },
            "::before": {
                content: "\"\"",
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                background:
                    "linear-gradient(90deg, rgba(255,251,253,0.82) 0%, rgba(255,251,253,0.58) 45%, rgba(255,251,253,0.28) 100%)",
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
                background: `${accent}2e`,
                border: `1px solid ${accent}80`,
                color: TITLE_COLOR,
                fontWeight: "600",
                fontSize: "0.8em",
                padding: "0.15em 0.8em",
                borderRadius: "0.3em",
                cursor: "pointer",
                transition: "background 0.15s ease, border-color 0.15s ease",
            },
            ">button:hover": {
                background: `${accent}52`,
                borderColor: accent,
            },
            ">button:active": {
                background: `${accent}70`,
            },
        });

        const actionsClassName = getDynamicClass({
            base: {
                position: "absolute",
                top: "0.35em",
                right: "0.35em",
                display: "flex",
                gap: "0.15em",
                zIndex: "10",
            },
            ">button": {
                background: "rgba(255,255,255,0.7)",
                border: `1px solid ${accent}88`,
                cursor: "pointer",
                padding: "0.1em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: "0.8",
                color: TITLE_COLOR,
                borderRadius: "0.3em",
                transition: "opacity 0.15s ease, background 0.15s ease",
            },
            ">button:hover": {
                opacity: "1",
                background: "#fff",
            },
            ">button>svg": {
                width: "0.85em",
                height: "0.85em",
            },
        });

        const floaterClassName = getDynamicClass({
            base: {
                position: "absolute",
                bottom: "-0.7em",
                opacity: "0",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                pointerEvents: "none",
                zIndex: "1",
            },
        });

        const closeIcon = createElement(X);
        const paletteIcon = createElement(Palette);

        const icon = getHeartIcon(
            accent,
            renderData.type === "spinner"
                ? `${kf.beat} 0.9s ease-in-out infinite`
                : `${kf.sway} 2.8s ease-in-out infinite`
        );

        const toast = (
            <div
                class={toastClassName}
                data-zc-toast-type={renderData.type}
                data-zc-toast-id={renderData.id}
            >
                {renderData.type !== "spinner" && renderData.duration !== 0 && (
                    <div
                        class="zcToast-ProgressBar"
                        style={{
                            animation: `zcToast-progress ${renderData.duration}ms linear 0s 1 alternate none`,
                            position: "absolute",
                            top: "0",
                            left: "0",
                            height: "100%",
                            background: `linear-gradient(90deg, ${accent}40, ${accent}12)`,
                            zIndex: "0",
                        }}
                    />
                )}
                {FLOATERS.map((f) => (
                    <span
                        class={floaterClassName}
                        style={{
                            left: f.left,
                            width: f.size,
                            height: f.size,
                            backgroundImage: toDataUrl(recolorSvg(f.source, f.color)),
                            animation: `${kf.float} ${f.duration} ease-out ${f.delay} infinite`,
                        }}
                    />
                ))}
                <div class={actionsClassName}>
                    <button
                        type="button"
                        title="Theme menu"
                        onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            if (!renderData.isInteractable) return;
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
                            if (!renderData.isInteractable) return;
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
                    {!!renderData.title && (
                        <p
                            style={{
                                color: TITLE_COLOR,
                                fontWeight: "700",
                                fontSize: "0.9em",
                                margin: "0",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                width: "100%",
                            }}
                        >
                            {renderData.title}
                        </p>
                    )}
                    <p
                        style={{
                            color: TEXT_COLOR,
                            fontSize: !!renderData.title ? "0.72em" : "0.85em",
                            overflowWrap: "anywhere",
                            fontWeight: !!renderData.title ? "500" : "700",
                            margin: "0",
                            marginTop: !!renderData.title ? "0.15em" : undefined,
                            lineHeight: "1.35",
                        }}
                    >
                        {renderData.message}
                    </p>
                    {renderData.buttons !== undefined && (
                        <div class={buttonsContainerClassName}>
                            {renderData.buttons.map((b) => (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!renderData.isInteractable) return;
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
            renderData.size.scaleWithCanvas
                ? `calc(var(--size-unit) * ${value * renderData.size.scaleFactor}px)`
                : `${value * renderData.size.scaleFactor * FIXED_UNIT}px`;

        toast.style.fontSize = sz(2.15);
        toast.style.padding = `${sz(0.85)} ${sz(0.95)}`;
        toast.style.animation = `${pos.includes("left") ? "zcSlideInFromLeft" : "zcSlideInFromRight"
            } 0.3s ease-out forwards`;
        void toast.offsetHeight;

        if (renderData.type !== "spinner" && renderData.duration !== 0) {
            setTimeout(() => {
                toast.style.animation = `${pos.includes("left") ? "zcSlideOutToLeft" : "zcSlideOutToRight"
                    } 0.3s ease-out forwards`;
            }, renderData.duration);
            setTimeout(() => toast.remove(), renderData.duration + 300);
        }

        return toast;
    }
}

export const abdlToastTheme = new AbdlToastTheme();
