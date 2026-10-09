import { vi, beforeEach, afterEach } from "vitest";

(globalThis as any).CommonGetFontName = () => "Arial";

(globalThis as any).MainCanvas = {
    canvas: {
        clientWidth: 2000,
        clientHeight: 1000,
    },
};

(globalThis as any).window.ZOIS_CORE = {
    getSettings: () => ({
        toasts: {
            position: "bottom-left",
            blacklist: { enabled: false, content: [] },
            preventUsingSingleTheme: true,
        },
    }),
};

beforeEach(() => {
    document.body.innerHTML = "";
});

afterEach(() => {
    document.body.innerHTML = "";
    vi.clearAllMocks();
});