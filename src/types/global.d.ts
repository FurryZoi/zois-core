interface Window {
    ZOIS_CORE: {
        version: string
        enableDevMode: () => void
        getSettings: () => import("../core/settings").CoreSettings
        getEventBus: typeof import("../events").getEventBus
        resolveActiveToastTheme: typeof import("../core/toastThemes").resolveActiveToastTheme
        dialogs: {
            createConfirmDialog: typeof import("../core/dialogs").createConfirmDialog
            createPromptDialog: typeof import("../core/dialogs").createPromptDialog
            createPickDialog: typeof import("../core/dialogs").createPickDialog
            createPickPlayerDialog: typeof import("../core/dialogs").createPickPlayerDialog
        }
    }
}