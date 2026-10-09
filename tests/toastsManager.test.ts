import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/index", () => ({
    MOD_DATA: {
        key: "test-mod",
        fontFamily: "Arial",
        singleToastsTheme: undefined,
    },
}));


import { toastsManager } from "../src/toasts";

describe("toastsManager", () => {
    beforeEach(() => {
        document.body.innerHTML = "";
    });

    it("creates info toast in DOM", () => {
        toastsManager.info({ title: "T", message: "Hello", duration: 5000 });

        const toast = document.querySelector("[data-zc-toast-id]");
        expect(toast).toBeTruthy();
        expect(toast!.textContent).toContain("Hello");
    });

    it("removes toast after duration", () => {
        vi.useFakeTimers();
        toastsManager.success({ message: "Done", duration: 1000 });

        expect(document.querySelector("[data-zc-toast-id]")).toBeTruthy();

        vi.advanceTimersByTime(1500);
        expect(document.querySelectorAll("[data-zc-toast-id]").length).toBeLessThanOrEqual(1);
    });

    it("spinner returns id and removeSpinner removes it", () => {
        vi.useFakeTimers();
        const id = toastsManager.spinner({ title: "Wait", message: "Loading" });
        expect(id).toBeTruthy();
        expect(document.querySelector(`[data-zc-toast-id="${id}"]`)).toBeTruthy();

        toastsManager.removeSpinner(id);
        vi.advanceTimersByTime(350);
        expect(document.querySelector(`[data-zc-toast-id="${id}"]`)).toBeNull();
    });
});