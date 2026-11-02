import { setPosition } from "./ui";
import { logger } from "./logging";
import { eventBus } from "./events";
import type { ToastRenderData } from "./core/toast-themes/base";


function createToastsContainer(): HTMLDivElement {
    const container = document.createElement("div");
    container.className = "zcToastsContainer";

    const update = () => {
        container.style.cssText = `font-family: ${CommonGetFontName()};`;
        setPosition(
            container,
            5,
            5,
            window.ZOIS_CORE.getSettings().toasts?.position ?? "bottom-left"
        );
    };

    window.addEventListener("resize", update);
    document.body.append(container);
    update();
    eventBus?.on("zois-core:coreSettingsChanged", update);
    return container;
}

export function getOrCreateToastsContainer(): HTMLElement {
    return (
        document.querySelector(".zcToastsContainer") ?? createToastsContainer()
    );
}

export function dismissToast(toastElement: HTMLDivElement): void {
    if (!toastElement || toastElement.dataset.dismissed === "true") return;
    toastElement.dataset.dismissed = "true";
    clearTimeout((toastElement as any)._dismissTimer);

    if (toastElement.hasAttribute("data-zc-cyber-toast")) {
        toastElement.classList.remove("visible", "paused");
        toastElement.classList.add("exiting");
        setTimeout(() => {
            if (toastElement.parentElement) toastElement.remove();
        }, 400);
        return;
    }

    const pos =
        window.ZOIS_CORE.getSettings().toasts?.position ?? "bottom-left";
    toastElement.style.animation = `${pos.includes("left") ? "zcSlideOutToLeft" : "zcSlideOutToRight"
        } 0.3s ease-out forwards`;
    setTimeout(() => toastElement.remove(), 300);
}

function createToast(data: ToastRenderData): void {
    const theme = window.ZOIS_CORE.resolveActiveToastTheme();
    const toast = theme.render(data);
    const container = getOrCreateToastsContainer();
    container.appendChild(toast);
}

type ToastProcessData = Omit<ToastRenderData, "size" | "id">;

export class ToastsManager {
    private generateToastId(): string {
        return crypto.randomUUID();
    }

    private process(toastProperties: ToastProcessData): string | false {
        const coreSettingsLocal = window.ZOIS_CORE.getSettings();
        if (
            coreSettingsLocal.toasts?.blacklist?.enabled &&
            coreSettingsLocal.toasts.blacklist.content?.length !== 0
        ) {
            if (
                coreSettingsLocal.toasts.blacklist.content?.some((v) => {
                    const regexp = new RegExp(v);
                    return regexp.test(toastProperties.title ?? "") || regexp.test(toastProperties.message);
                })
            ) {
                logger.log("Toast message blocked due to blacklist settings");
                return false;
            }
        }

        const id = this.generateToastId();

        createToast({
            ...toastProperties,
            id,
            size: {
                scaleWithCanvas: true,
                scaleFactor: coreSettingsLocal.toasts?.scaleFactor ?? 1
            }
        });

        return id;
    }

    /**
     * Displays informational toast.
     * @param options - Title, message and duration of toast.
     */
    public info(toastProperties: Omit<ToastProcessData, "type">): void {
        this.process({ ...toastProperties, type: "info" });
    }

    /**
     * Displays success toast.
     * @param options - Title, message and duration of toast.
     */
    public success(toastProperties: Omit<ToastProcessData, "type">): void {
        this.process({ ...toastProperties, type: "success" });
    }

    /**
     * Displays warning toast.
     * @param options - Title, message and duration of toast.
     */
    public warn(toastProperties: Omit<ToastProcessData, "type">): void {
        this.process({ ...toastProperties, type: "warning" });
    }

    /**
     * Displays error toast.
     * @param options - Title, message and duration of toast.
     */
    public error(toastProperties: Omit<ToastProcessData, "type">): void {
        this.process({ ...toastProperties, type: "error" });
    }

    /**
     * Displays a long-running spinner toast and returns its ID.
     * Toast can be deleted manually with `toastsManager.removeSpinner(ID)` or by the user by clicking.
     * @param options - Title and message of toast.
     * @returns The unique ID of the created spinner toast.
     */
    public spinner(toastProperties: Omit<ToastProcessData, "type">): string {
        const result = this.process({ ...toastProperties, type: "spinner" });
        if (result === false) return "";
        return result;
    }

    /**
     * Removes a spinner toast by its ID.
     * @param id - Unique ID of the spinner toast to remove.
     */
    public removeSpinner(id: string): void {
        const toast = document.querySelector<HTMLDivElement>(
            `div[data-zc-toast-id="${id}"]`
        );
        if (!toast) return;
        dismissToast(toast);
    }
}

/**
 * Toast notifications controller, alternative to BC's native `ToastManager`.
 */
export const toastsManager = new ToastsManager();
