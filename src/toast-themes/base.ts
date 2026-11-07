import { getOrCreateToastsContainer } from "../toasts";
import { getSettings } from "../settings";
import { isToastThemeUnlocked, setActiveToastTheme, unlockToastTheme } from "../toasts";

export type ToastType = "info" | "warning" | "error" | "success" | "spinner";

export enum ToastTier {
    R = "R",
    SR = "SR",
    SSR = "SSR"
}

export interface ToastRenderData {
    id: string
    title?: string
    message: string
    type: ToastType
    duration: number
    isInteractable?: boolean
    size: {
        scaleWithCanvas: boolean
        scaleFactor: number
    }
    buttons?: {
        name: string
        action: () => void
    }[];
}

export abstract class ToastTheme {
    public abstract name: string;
    public abstract details: string;
    public abstract tier: ToastTier;

    protected get isUnlocked(): boolean {
        return isToastThemeUnlocked(this);
    }

    protected unlock(): void {
        unlockToastTheme(this);
        const toast = this.render({
            message: `Toast theme "${this.name}" unlocked`,
            type: "info",
            size: {
                scaleWithCanvas: true,
                scaleFactor: getSettings().toasts?.scaleFactor ?? 1
            },
            id: `${this.name}-unlocking-notification`,
            duration: 10000,
            buttons: [
                {
                    name: "Apply theme",
                    action: () => {
                        setActiveToastTheme(this);
                    }
                }
            ]
        });
        getOrCreateToastsContainer().append(toast);
    }

    public abstract init(): void;

    public abstract render(data: ToastRenderData): HTMLDivElement;
}
