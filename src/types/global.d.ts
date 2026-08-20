interface Window {
    ZOIS_CORE: {
        version: string
        enableDevMode: () => void
        getSettings: () => import("../core").CoreSettings
        getEventBus: typeof import("../events").getEventBus
    }
}