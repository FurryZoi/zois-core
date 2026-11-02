import {
    BadgeCheck,
    TriangleAlert,
    Info,
    LoaderCircle,
    X,
    Palette,
    createElement,
    CircleX,
} from "lucide";
import { getDynamicClass } from "../../ui";
import { ToastRenderData, ToastTheme, ToastTier, ToastType } from "./base";
import { dismissToast } from "../../toasts";
import { createThemesDialog } from "../toastThemesDialog";

const FIXED_UNIT = 10;

const BACKGROUND_COLOR = "#1a1d21";
const PROGRESS_BAR_COLOR = "#1e2126";

const ICON_COLOR: Record<Exclude<ToastType, "spinner">, string> = {
    info: "#6b8afd",
    warning: "#e6b422",
    error: "#f07178",
    success: "#7fd99a",
};

function getToastIcon(type: ToastType): SVGElement {
    const color =
        type === "spinner" ? ICON_COLOR.info : ICON_COLOR[type];
    const size = "1em";

    let icon: SVGElement;
    switch (type) {
        case "info":
            icon = createElement(Info);
            break;
        case "warning":
            icon = createElement(TriangleAlert);
            break;
        case "error":
            icon = createElement(CircleX);
            break;
        case "success":
            icon = createElement(BadgeCheck);
            break;
        case "spinner":
            icon = createElement(LoaderCircle);
            icon.style.stroke = color;
            icon.style.cssText += `flex-shrink:0;width:${size};height:${size};animation:zcSpin 0.7s linear infinite;`;
            return icon;
    }

    icon.style.fill = color;
    icon.style.stroke = BACKGROUND_COLOR;
    icon.style.cssText += `flex-shrink:0;width:${size};height:${size};`;
    return icon;
}

export class DefaultToastTheme extends ToastTheme {
    public name = "Default"
    public details = "Standard minimalist theme."
    public tier = ToastTier.R;

    public init(): void {}

    public render({ title, message, type, duration, id, buttons, size, isInteractable = true }: ToastRenderData): HTMLDivElement {
        const pos =
            window.ZOIS_CORE.getSettings().toasts?.position ?? "bottom-left";

        const accent =
            type === "success"
                ? "#7fd99a"
                : type === "error"
                    ? "#f07178"
                    : type === "warning"
                        ? "#e6b422"
                        : "#6b8afd";

        const textColor = "#b0bcc8";
        const titleColor = "#e8eef4";

        const toastClassName = getDynamicClass({
            base: {
                display: "flex",
                columnGap: "0.55em",
                alignItems: "flex-start",
                maxWidth: "25vw",
                borderRadius: "0.35em",
                position: "relative",
                overflow: "hidden",
                background: BACKGROUND_COLOR,
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow:
                    "0 6px 18px rgba(0,0,0,0.32), 0 0 0 1px rgba(0,0,0,0.2)",
            },
        });

        const iconWrapClass = getDynamicClass({
            base: {
                flexShrink: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "1.55em",
                height: "1.55em",
                borderRadius: "6px",
                background: `${accent}18`,
                position: "relative",
                zIndex: "1",
                marginTop: "0.05em",
            },
        });

        const buttonsContainerClassName = getDynamicClass({
            base: {
                display: "flex",
                gap: "0.4em",
                marginTop: "0.35em",
                flexWrap: "wrap",
                position: "relative",
                zIndex: "1",
            },
            ">button": {
                flexShrink: "0",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: titleColor,
                fontSize: "0.8em",
                padding: "0.2em 0.5em",
                borderRadius: "5px",
                cursor: "pointer",
                transition: "background 0.15s ease, border-color 0.15s ease",
            },
            ">button:hover": {
                background: "rgba(255,255,255,0.12)",
                borderColor: "rgba(255,255,255,0.18)",
            },
        });

        const actionsClassName = getDynamicClass({
            base: {
                position: "absolute",
                top: "0.35em",
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
                color: textColor,
                borderRadius: "4px",
                transition: "opacity 0.15s ease, background 0.15s ease",
            },
            ">button:hover": {
                opacity: "1",
                background: "rgba(255,255,255,0.1)",
            },
            ">button>svg": {
                width: "0.9em",
                height: "0.9em",
            },
        });

        const closeIcon = createElement(X);
        const paletteIcon = createElement(Palette);

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
                            borderRadius: "8px",
                            background: PROGRESS_BAR_COLOR,
                            zIndex: "0",
                        }}
                    />
                )}
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
                <div class={iconWrapClass}>{getToastIcon(type)}</div>
                <div
                    style={{
                        width: "100%",
                        minWidth: "0",
                        paddingRight: "2.5em",
                        position: "relative",
                        zIndex: "1",
                    }}
                >
                    {!!title && (
                        <p
                            style={{
                                color: titleColor,
                                fontWeight: "600",
                                fontSize: "0.88em",
                                margin: "0",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                width: "100%",
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
                            fontWeight: !!title ? "400" : "600",
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

export const defaultToastTheme = new DefaultToastTheme();