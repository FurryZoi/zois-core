export class DialogsManager {
    public prompt({ message }: { message: string }): Promise<string | false> {
        return window.ZOIS_CORE.dialogs.createPromptDialog({ message });
    }

    public confirm({ message }: { message: string }): Promise<boolean> {
        return window.ZOIS_CORE.dialogs.createConfirmDialog({ message });
    }

    public pick<T>({
        message,
        options,
    }: {
        message: string
        options: { name: string; value: T }[]
    }): Promise<T | false> {
        return window.ZOIS_CORE.dialogs.createPickDialog({ message, options });
    }

    public pickPlayers({ message = "Select players" }: { message?: string } = {}): Promise<number[] | false> {
        return window.ZOIS_CORE.dialogs.createPickPlayerDialog({ message });
    }
}

export const dialogsManager = new DialogsManager();