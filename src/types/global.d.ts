interface Window {
    ZOIS_CORE: {
        version: string
        getEventBus: typeof import("../events").getEventBus
        getDependents: typeof import("../shared").getDependents
        addDependent: typeof import("../shared").addDependent
    }
}
