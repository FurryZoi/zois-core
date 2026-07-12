interface Window {
    ZOIS_CORE: {
        enableDevMode: () => void
        getSettings: () => import("../src/core").CoreSettings
    }
}