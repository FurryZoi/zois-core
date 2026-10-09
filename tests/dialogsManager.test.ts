import { describe, it, expect, vi } from "vitest";

vi.mock("../src/index", () => ({
    MOD_DATA: { key: "test-mod", fontFamily: "Arial" },
    getPlayer: vi.fn(),
}));

vi.mock("../src/ui", async () => {
    const actual = await vi.importActual<any>("../src/ui");
    return {
        ...actual,
        addDynamicClass: (el: HTMLElement) => el,
        setPosition: vi.fn(),
        setFontFamily: vi.fn(),
    };
});

import { dialogsManager } from "../src/dialogs";

function getDialog() {
    return document.querySelector("dialog, [role='dialog'], .zcDialog")
        ?? document.body.querySelector("div[style*='z-index']");
}

describe("dialogsManager.confirm", () => {
    it("resolves true on Ok", async () => {
        const p = dialogsManager.confirm({ message: "Sure?" });

        await Promise.resolve();
        const ok = [...document.querySelectorAll("button")]
            .find((b) => /ok/i.test(b.textContent ?? ""));
        expect(ok).toBeTruthy();
        ok!.click();

        await expect(p).resolves.toBe(true);
    });

    it("resolves false on Cancel", async () => {
        const p = dialogsManager.confirm({ message: "Sure?" });
        await Promise.resolve();

        const cancel = [...document.querySelectorAll("button")]
            .find((b) => /cancel/i.test(b.textContent ?? ""));
        cancel!.click();

        await expect(p).resolves.toBe(false);
    });
});

describe("dialogsManager.prompt", () => {
    it("returns entered string on Ok", async () => {
        const p = dialogsManager.prompt({ message: "Name?" });
        await Promise.resolve();

        const input = document.querySelector("input, textarea") as HTMLInputElement;
        input.value = "Zoi";
        input.dispatchEvent(new Event("input", { bubbles: true }));

        const ok = [...document.querySelectorAll("button")]
            .find((b) => /ok/i.test(b.textContent ?? ""));
        ok!.click();

        await expect(p).resolves.toBe("Zoi");
    });

    it("returns false on Cancel", async () => {
        const p = dialogsManager.prompt({ message: "Name?" });
        await Promise.resolve();

        const cancel = [...document.querySelectorAll("button")]
            .find((b) => /cancel/i.test(b.textContent ?? ""));
        cancel!.click();

        await expect(p).resolves.toBe(false);
    });
});

describe("dialogsManager.pick", () => {
    it("returns selected option value", async () => {
        const p = dialogsManager.pick({
            message: "Choose",
            options: [
                { name: "A", value: 1 },
                { name: "B", value: 2 },
            ],
        });

        await Promise.resolve();

        const select = document.querySelector("select");
        expect(select).toBeTruthy();

        select!.selectedIndex = 1;
        select!.dispatchEvent(new Event("change", { bubbles: true }));

        const ok = [...document.querySelectorAll("button")]
            .find((b) => /ok/i.test(b.textContent ?? ""));
        ok!.click();

        await expect(p).resolves.toBe(select!.options[1].value);
    });
});