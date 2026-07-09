import { CircleAlert, CircleCheck, CircleX, createElement, Info } from "lucide";
import { ModData } from "./index";
import { MOD_DATA } from "./index";
import { setPosition } from "./ui";
import { logger } from "./logging";

interface Toast {
    id: string
    title?: string
    message: string
    type: "info" | "warning" | "error" | "success" | "spinner"
    duration: number
    theme?: ModData["singleToastsTheme"]
}

function createToastsContainer() {
    const container = document.createElement("div");
    container.classList.add("zcToastsContainer");
    container.addEventListener("click", () => {
        const pos = window.ZOISCORE.getSettings().toasts?.position ?? "bottom-left";
        for (const toast of container.children) {
            if (toast instanceof HTMLElement) {
                toast.style.animation = `${pos.includes("left") ? "zcSlideOutToLeft" : "zcSlideOutToRight"} 0.3s ease-out forwards`;
            }
        }
        setTimeout(() => container.innerHTML = "", 300);
    });
    const update = () => {
        container.style.cssText = `font-family: ${CommonGetFontName()};`;
        setPosition(container, 5, 5, window.ZOISCORE.getSettings().toasts?.position ?? "bottom-left");
    };
    window.addEventListener("resize", update);
    document.body.append(container);
    update();
    document.addEventListener("zois-core:coresettingschanged", update);
    return container;
}

function getToastIcon(type: Toast["type"], theme: Toast["theme"]): SVGElement {
    let icon: SVGElement;
    switch (type) {
        case "info":
            icon = createElement(Info);
            icon.style.fill = theme ? theme.iconFillColor : "rgb(68, 70, 202)";
            icon.style.stroke = theme ? theme.iconStrokeColor : "rgb(148, 178, 217)";
            break;
        case "warning":
            icon = createElement(CircleAlert);
            icon.style.fill = theme ? theme.iconFillColor : "rgb(198, 146, 25)";
            icon.style.stroke = theme ? theme.iconStrokeColor : "rgb(244, 220, 147)";
            break;
        case "error":
            icon = createElement(CircleX);
            icon.style.fill = theme ? theme.iconFillColor : "rgb(174, 1, 1)";
            icon.style.stroke = theme ? theme.iconStrokeColor : "rgb(255, 163, 163)";
            break;
        case "success":
            icon = createElement(CircleCheck);
            icon.style.fill = theme ? theme.iconFillColor : "rgb(49, 142, 68)";
            icon.style.stroke = theme ? theme.iconStrokeColor : "rgb(122, 213, 162)";
            break;
        case "spinner":
            icon = createElement(Info);
            icon.style.fill = theme ? theme.iconFillColor : "#addbff";
            icon.style.stroke = theme ? theme.iconStrokeColor : "#385073";
            break;
    }
    icon.style.cssText += `flex-shink: 0; width: 1.65em; height: 1.65em;`;
    return icon;

}

function createToast({ title, message, type, duration, theme, id }: Toast) {
    const pos = window.ZOISCORE.getSettings().toasts?.position ?? "bottom-left";
    const backgroundColor = theme ? theme.backgroundColor : type === "success" ? "rgb(122, 213, 162)" : type === "warning" ? "rgb(244, 220, 147)" : type === "error" ? "rgb(255, 163, 163)" : "rgb(148, 178, 217)";
    const textColor = theme ? theme.titleColor : (type === "info" || type === "spinner") ? "rgb(0, 2, 125)" : type === "success" ? "#244428" : type === "error" ? "rgb(128, 22, 22)" : "rgb(100, 74, 16)";
    const progressBarColor = theme ? theme.progressBarColor : "#00000014";
    const toastContainer = document.querySelector(".zcToastsContainer") ?? createToastsContainer();
    const toast = document.createElement("div");
    toast.classList.add("zcToast");
    toast.setAttribute("data-zc-toast-type", type);
    toast.setAttribute("data-zc-toast-id", id);

    const update = () => {
        const canvasWidth = MainCanvas.canvas.clientWidth;
        const canvasHeight = MainCanvas.canvas.clientHeight;
        const scaleFactor = Math.min(canvasWidth, canvasHeight) / 100;
        toast.style.cssText = `width: 100%; font-size: ${2.85 * scaleFactor}px; padding: ${1 * scaleFactor}px; background: ${backgroundColor}; border: 1px solid #555;`;
        toast.style.animation = `${pos.includes("left") ? "zcSlideInFromLeft" : "zcSlideInFromRight"} 0.3s ease-out forwards`;
    };

    if (type !== "spinner") {
        const progressBar = document.createElement("div");
        progressBar.classList.add("zcToast-ProgressBar");
        progressBar.style.cssText = `animation: zcToast-progress ${duration}ms linear 0s 1 alternate none; position: absolute; top: 0; left: 0; height: 100%; border-radius: 4px; background: ${progressBarColor};`;
        toast.append(progressBar);
    }

    const textContainer = document.createElement("div");

    if (title) {
        const _title = document.createElement("p");
        _title.style.color = textColor;
        _title.style.fontWeight = "bold";
        _title.style.fontSize = "0.9em";
        _title.textContent = title;
        textContainer.append(_title);
    }

    const _message = document.createElement("p");
    _message.style.color = textColor;
    _message.style.fontSize = !!title ? "0.7em" : "0.9em";
    _message.style.overflowWrap = "anywhere";
    if (!title) {
        _message.style.fontWeight = "bold";
    } else {
        _message.style.marginTop = "0.15em";
    }
    _message.textContent = message;

    textContainer.append(_message);
    toast.append(getToastIcon(type, theme), textContainer);
    update();
    window.addEventListener("resize", update);
    toastContainer.append(toast);
    setTimeout(() => {
        // const pos = window.ZOISCORE.getSettings().toasts?.position ?? "bottom-left";
        toast.style.animation = `${pos.includes("left") ? "zcSlideOutToLeft" : "zcSlideOutToRight"} 0.3s ease-out forwards`;
    }, duration);
    setTimeout(() => toast.remove(), duration + 300);
}


export class ToastsManager {
    private generateToastId(): string {
        return crypto.randomUUID();
    }

    private process({ title, message, duration, type, id, theme }: Toast): void {
        const coreSettings = window.ZOISCORE.getSettings();
        if (coreSettings.toasts?.blacklist?.enabled && coreSettings.toasts.blacklist.content?.length !== 0) {
            if (
                coreSettings.toasts.blacklist.content?.some((v) => {
                    const regexp = new RegExp(v);
                    return regexp.test(title ?? "") || regexp.test(message);
                })
            ) {
                logger.log("Toast message blocked due to blacklist settings");
                return;
            }
        }
        if (coreSettings.toasts?.preventUsingSingleTheme) {
            createToast({
                id,
                title,
                message,
                duration,
                type
            });
        } else {
            createToast({
                id,
                title,
                message,
                duration,
                type,
                theme
            });
        }
    }

    public info({ title, message, duration }: Omit<Toast, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "info", id, theme });
    }

    public success({ title, message, duration }: Omit<Toast, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "success", id, theme });
    }

    public warn({ title, message, duration }: Omit<Toast, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "warning", id, theme });
    }

    public error({ title, message, duration }: Omit<Toast, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "error", id, theme });
    }

    public spinner({ title, message }: Omit<Toast, "type" | "id" | "duration" | "theme">): string {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration: 1000000, type: "spinner", id, theme });
        return id;
    }

    public removeSpinner(id: string): void {
        const toast = document.querySelector(`div[data-zc-toast-id="${id}"]`);
        toast?.classList.add("exiting");
        setTimeout(() => toast?.remove(), 300);
    }
}

export const toastsManager = new ToastsManager();