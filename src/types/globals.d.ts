interface Window {
    ZOIS_CORE: {
        enableDevMode: () => void
        getSettings: () => import("../core").CoreSettings
    }
}