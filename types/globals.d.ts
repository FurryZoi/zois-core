interface Window {
    ZOISCORE: {
        loaded: boolean
        enableDevMode: () => void
        getSettings: () => import("../src/core").CoreSettings
    }
}