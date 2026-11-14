import { getOrCreateToastsContainer } from "../toasts";
import { getSettings } from "../settings";
import { isToastThemeUnlocked, setActiveToastTheme, unlockToastTheme } from "../toasts";

export type ToastType = "info" | "warning" | "error" | "success" | "spinner";

export enum ToastThemeTier {
    R = "R",
    SR = "SR",
    SSR = "SSR"
}

interface BaseToastRenderData {
    type: ToastType
    id: string
    title?: string
    message: string
    isInteractable?: boolean
    size: {
        scaleWithCanvas: boolean
        scaleFactor: number
    }
    buttons?: {
        name: string
        action: () => void
    }[]
}

export interface PermanentToastRenderData extends BaseToastRenderData {
    type: "spinner"
}

export interface TimedToastRenderData extends BaseToastRenderData {
    type: "info" | "warning" | "error" | "success"
    duration: number
}

export type ToastRenderData = PermanentToastRenderData | TimedToastRenderData;

export abstract class ToastTheme {
    public abstract name: string;
    public abstract details: string;
    public abstract tier: ToastThemeTier;

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
