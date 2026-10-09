import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const ServerSend = vi.fn();
(globalThis as any).ServerSend = ServerSend;

const ServerPlayerIsInChatRoom = vi.fn(() => true);
(globalThis as any).ServerPlayerIsInChatRoom = ServerPlayerIsInChatRoom;

const CharacterPronounDescription = vi.fn(() => "She/Her");
(globalThis as any).CharacterPronounDescription = CharacterPronounDescription;

const ChatRoomCurrentTime = vi.fn(() => "12:00");
(globalThis as any).ChatRoomCurrentTime = ChatRoomCurrentTime;

const ElementScrollToEnd = vi.fn();
(globalThis as any).ElementScrollToEnd = ElementScrollToEnd;

(globalThis as any).Player = {
    MemberNumber: 1,
    Name: "Player",
    IsPlayer: () => true,
};

const otherCharacter = {
    MemberNumber: 42,
    Name: "Other",
    IsPlayer: () => false,
};

type HookCb = (args: any[], next: (...a: any[]) => any) => any;

// vi.mock is hoisted — variables used inside factory must come from vi.hoisted
const { hooks, hookFunction } = vi.hoisted(() => {
    const hooks: Record<string, HookCb[]> = {};
    const hookFunction = vi.fn(
        (name: string, _prio: number, cb: HookCb) => {
            if (!hooks[name]) hooks[name] = [];
            hooks[name].push(cb);
            return () => {
                const list = hooks[name];
                if (!list) return;
                const i = list.indexOf(cb);
                if (i >= 0) list.splice(i, 1);
            };
        },
    );
    return { hooks, hookFunction };
});

vi.mock("../src/index", () => ({
    MOD_DATA: {
        key: "ZOIS_TEST",
        fontFamily: "Arial",
        chatMessageBackground: undefined,
        chatMessageColor: undefined,
    },
    getPlayer: vi.fn((n: number) => {
        if (n === 1) return (globalThis as any).Player;
        if (n === 42) {
            return {
                MemberNumber: 42,
                Name: "Other",
                IsPlayer: () => false,
            };
        }
        return null;
    }),
}));

vi.mock("../src/modSdk", () => ({
    HookPriority: { ADD_BEHAVIOR: 1, OBSERVE: 0 },
    hookFunction,
}));

vi.mock("../src/validation", () => ({
    validateData: vi.fn(async () => ({ isValid: true })),
}));

vi.mock("../src/logging", () => ({
    logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

vi.mock("../src/ui", () => ({
    setFontFamily: vi.fn(),
}));

import { messagesManager } from "../src/messaging";
import { validateData } from "../src/validation";
import { setFontFamily } from "../src/ui";
import { getPlayer } from "../src/index";

/** Run all registered hooks for a BC function name (simulates the real call). */
async function fireHook(name: string, args: any[]) {
    const list = hooks[name] ?? [];
    const next = vi.fn();
    for (const cb of list) {
        await cb(args, next);
    }
    return next;
}

/**
 * isClassConstructor in messaging.ts treats any function with
 * `fn.prototype.constructor === fn` as a DTO class (includes vi.fn()).
 * Arrow functions have no prototype, so they are correctly treated as listeners.
 */
function asListener<T extends (...args: any[]) => any>(fn: T): T {
    return ((...args: any[]) => fn(...args)) as T;
}

beforeEach(() => {
    ServerSend.mockClear();
    ServerPlayerIsInChatRoom.mockClear().mockReturnValue(true);
    CharacterPronounDescription.mockClear().mockReturnValue("She/Her");
    ChatRoomCurrentTime.mockClear().mockReturnValue("12:00");
    ElementScrollToEnd.mockClear();
    hookFunction.mockClear();
    (validateData as ReturnType<typeof vi.fn>).mockClear().mockResolvedValue({ isValid: true });
    (setFontFamily as ReturnType<typeof vi.fn>).mockClear();
    (getPlayer as ReturnType<typeof vi.fn>).mockClear().mockImplementation((n: number) => {
        if (n === 1) return (globalThis as any).Player;
        if (n === 42) return otherCharacter;
        return null;
    });
    for (const k of Object.keys(hooks)) delete hooks[k];
    document.body.innerHTML = "";
});

afterEach(() => {
    vi.useRealTimers();
    document.body.innerHTML = "";
});

describe("messagesManager.sendPacket", () => {
    it("sends ChatRoomChat with mod key, msg and Type Hidden", () => {
        messagesManager.sendPacket("ping");

        expect(ServerSend).toHaveBeenCalledTimes(1);
        expect(ServerSend).toHaveBeenCalledWith(
            "ChatRoomChat",
            expect.objectContaining({
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Dictionary: { msg: "ping" },
            }),
        );
    });

    it("includes data when provided", () => {
        messagesManager.sendPacket("ping", { x: 1 });

        expect(ServerSend).toHaveBeenCalledWith(
            "ChatRoomChat",
            expect.objectContaining({
                Dictionary: { msg: "ping", data: { x: 1 } },
            }),
        );
    });

    it("sets Target when targetNumber is provided", () => {
        messagesManager.sendPacket("ping", { x: 1 }, 42);

        expect(ServerSend).toHaveBeenCalledWith(
            "ChatRoomChat",
            expect.objectContaining({
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Target: 42,
                Dictionary: { msg: "ping", data: { x: 1 } },
            }),
        );
    });
});

describe("messagesManager.sendBeep", () => {
    it("sends AccountBeep with JSON message", () => {
        messagesManager.sendBeep({ hello: true }, 99);

        expect(ServerSend).toHaveBeenCalledTimes(1);
        expect(ServerSend).toHaveBeenCalledWith(
            "AccountBeep",
            expect.objectContaining({
                MemberNumber: 99,
                BeepType: "Leash",
                IsSecret: true,
                Message: JSON.stringify({ hello: true }),
            }),
        );
    });
});

describe("messagesManager.sendAction", () => {
    it("does nothing when msg is empty", () => {
        messagesManager.sendAction("");
        expect(ServerSend).not.toHaveBeenCalled();
    });

    it("does nothing when not in chat room", () => {
        ServerPlayerIsInChatRoom.mockReturnValue(false);
        messagesManager.sendAction("waves");
        expect(ServerSend).not.toHaveBeenCalled();
    });

    it("replaces female pronouns and sends Action", () => {
        CharacterPronounDescription.mockReturnValue("She/Her");
        messagesManager.sendAction("<Pronoun> adjusts <possessive> collar");

        expect(ServerSend).toHaveBeenCalledWith(
            "ChatRoomChat",
            expect.objectContaining({
                Content: "Beep",
                Type: "Action",
                Dictionary: expect.arrayContaining([
                    { Tag: "msg", Text: "She adjusts her collar" },
                ]),
            }),
        );
    });

    it("replaces male pronouns", () => {
        CharacterPronounDescription.mockReturnValue("He/Him");
        messagesManager.sendAction("<Pronoun> adjusts <SelfIntensive>");

        expect(ServerSend).toHaveBeenCalledWith(
            "ChatRoomChat",
            expect.objectContaining({
                Dictionary: expect.arrayContaining([
                    { Tag: "msg", Text: "He adjusts Himself" },
                ]),
            }),
        );
    });

    it("passes target and extra dictionary entries", () => {
        messagesManager.sendAction("nods", 42, [{ Tag: "Extra", Text: "x" }]);

        expect(ServerSend).toHaveBeenCalledWith(
            "ChatRoomChat",
            expect.objectContaining({
                Target: 42,
                Dictionary: expect.arrayContaining([
                    { Tag: "msg", Text: "nods" },
                    { Tag: "Extra", Text: "x" },
                ]),
            }),
        );
    });
});

describe("messagesManager.sendChat", () => {
    it("sends ChatRoomChat with Type Chat", () => {
        messagesManager.sendChat("hello room");

        expect(ServerSend).toHaveBeenCalledWith("ChatRoomChat", {
            Type: "Chat",
            Content: "hello room",
        });
    });
});

describe("messagesManager.sendLocal", () => {
    it("does nothing when not in chat room", () => {
        ServerPlayerIsInChatRoom.mockReturnValue(false);
        messagesManager.sendLocal("hi");
        expect(document.querySelector(".ChatMessageLocalMessage")).toBeNull();
        expect(ElementScrollToEnd).not.toHaveBeenCalled();
    });

    it("appends a local message div and scrolls", () => {
        const log = document.createElement("div");
        log.id = "TextAreaChatLog";
        document.body.appendChild(log);

        messagesManager.sendLocal("local text");

        const div = log.querySelector(".ChatMessageLocalMessage") as HTMLDivElement;
        expect(div).toBeTruthy();
        expect(div.innerHTML).toBe("local text");
        expect(div.getAttribute("data-time")).toBe("12:00");
        expect(div.getAttribute("data-sender")).toBe("1");
        expect(setFontFamily).toHaveBeenCalledWith(div, "Arial");
        expect(ElementScrollToEnd).toHaveBeenCalledWith("TextAreaChatLog");
    });

    it("appends a Node when message is not a string", () => {
        const log = document.createElement("div");
        log.id = "TextAreaChatLog";
        document.body.appendChild(log);

        const node = document.createElement("span");
        node.textContent = "node-msg";
        messagesManager.sendLocal(node);

        const div = log.querySelector(".ChatMessageLocalMessage");
        expect(div?.querySelector("span")?.textContent).toBe("node-msg");
    });
});

describe("messagesManager.onPacket", () => {
    it("registers hookFunction on ChatRoomMessage with ADD_BEHAVIOR", () => {
        const listener = vi.fn();
        messagesManager.onPacket("ping", asListener(listener));

        expect(hookFunction).toHaveBeenCalledWith(
            "ChatRoomMessage",
            1,
            expect.any(Function),
        );
    });

    it("calls listener when matching Hidden packet arrives", async () => {
        const listener = vi.fn();
        messagesManager.onPacket("ping", asListener(listener));

        const next = await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 42,
                Dictionary: { msg: "ping", data: { a: 1 } },
            },
        ]);

        expect(getPlayer).toHaveBeenCalledWith(42);
        expect(listener).toHaveBeenCalledWith({ a: 1 }, otherCharacter);
        expect(next).toHaveBeenCalled();
    });

    it("does not call listener for non-matching msg", async () => {
        const listener = vi.fn();
        messagesManager.onPacket("ping", asListener(listener));

        await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 42,
                Dictionary: { msg: "other", data: {} },
            },
        ]);

        expect(listener).not.toHaveBeenCalled();
    });

    it("does not call listener when sender is player", async () => {
        const listener = vi.fn();
        messagesManager.onPacket("ping", asListener(listener));

        await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 1,
                Dictionary: { msg: "ping", data: {} },
            },
        ]);

        expect(listener).not.toHaveBeenCalled();
    });

    it("does not call listener when getPlayer returns null", async () => {
        const listener = vi.fn();
        messagesManager.onPacket("ping", asListener(listener));

        await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 999,
                Dictionary: { msg: "ping", data: {} },
            },
        ]);

        expect(listener).not.toHaveBeenCalled();
    });

    it("runs DTO validation when dto is provided", async () => {
        class Dto {}
        const listener = vi.fn();
        messagesManager.onPacket("ping", Dto, asListener(listener));

        await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 42,
                Dictionary: { msg: "ping", data: { v: 1 } },
            },
        ]);

        expect(validateData).toHaveBeenCalledWith({ v: 1 }, Dto);
        expect(listener).toHaveBeenCalled();
    });

    it("skips listener when DTO validation fails", async () => {
        (validateData as ReturnType<typeof vi.fn>).mockResolvedValue({ isValid: false });
        class Dto {}
        const listener = vi.fn();
        messagesManager.onPacket("ping", Dto, asListener(listener));

        await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 42,
                Dictionary: { msg: "ping", data: {} },
            },
        ]);

        expect(listener).not.toHaveBeenCalled();
    });

    it("cleanup function removes the hook", async () => {
        const listener = vi.fn();
        const remove = messagesManager.onPacket("ping", asListener(listener));
        remove();

        await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 42,
                Dictionary: { msg: "ping", data: {} },
            },
        ]);

        expect(listener).not.toHaveBeenCalled();
    });
});

describe("messagesManager.onRequest", () => {
    it("registers hooks on ChatRoomMessage and ServerAccountBeep", () => {
        const listener = vi.fn();
        messagesManager.onRequest("needInfo", asListener(listener));

        expect(hookFunction).toHaveBeenCalledWith(
            "ChatRoomMessage",
            1,
            expect.any(Function),
        );
        expect(hookFunction).toHaveBeenCalledWith(
            "ServerAccountBeep",
            1,
            expect.any(Function),
        );
    });

    it("handles packet request and sends requestResponse", async () => {
        const listener = vi.fn(() => ({ result: "ok" }));
        messagesManager.onRequest("needInfo", asListener(listener));

        await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 42,
                Dictionary: {
                    msg: "request",
                    data: {
                        requestId: "rid-1",
                        message: "needInfo",
                        data: { q: 1 },
                    },
                },
            },
        ]);

        expect(listener).toHaveBeenCalledWith({ q: 1 }, otherCharacter);
        expect(ServerSend).toHaveBeenCalledWith(
            "ChatRoomChat",
            expect.objectContaining({
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Target: 42,
                Dictionary: {
                    msg: "requestResponse",
                    data: {
                        requestId: "rid-1",
                        message: "needInfo",
                        data: { result: "ok" },
                    },
                },
            }),
        );
    });

    it("does not send response when listener returns undefined", async () => {
        const listener = vi.fn(() => undefined);
        messagesManager.onRequest("needInfo", asListener(listener));

        await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 42,
                Dictionary: {
                    msg: "request",
                    data: {
                        requestId: "rid-1",
                        message: "needInfo",
                        data: {},
                    },
                },
            },
        ]);

        expect(listener).toHaveBeenCalled();
        expect(ServerSend).not.toHaveBeenCalled();
    });

    it("handles beep request and sends beep response", async () => {
        const listener = vi.fn(() => ({ result: "beep-ok" }));
        messagesManager.onRequest("needInfo", asListener(listener));

        await fireHook("ServerAccountBeep", [
            {
                BeepType: "Leash",
                MemberNumber: 42,
                MemberName: "Other",
                Message: JSON.stringify({
                    type: "ZOIS_TEST_request",
                    requestId: "rid-2",
                    message: "needInfo",
                    data: { q: 2 },
                }),
            },
        ]);

        expect(listener).toHaveBeenCalledWith({ q: 2 }, 42, "Other");
        expect(ServerSend).toHaveBeenCalledWith(
            "AccountBeep",
            expect.objectContaining({
                MemberNumber: 42,
                BeepType: "Leash",
                IsSecret: true,
                Message: JSON.stringify({
                    type: "ZOIS_TEST_requestResponse",
                    requestId: "rid-2",
                    message: "needInfo",
                    data: { result: "beep-ok" },
                }),
            }),
        );
    });

    it("ignores non-Leash beeps", async () => {
        const listener = vi.fn();
        messagesManager.onRequest("needInfo", asListener(listener));

        await fireHook("ServerAccountBeep", [
            {
                BeepType: "Other",
                MemberNumber: 42,
                Message: JSON.stringify({
                    type: "ZOIS_TEST_request",
                    requestId: "rid",
                    message: "needInfo",
                    data: {},
                }),
            },
        ]);

        expect(listener).not.toHaveBeenCalled();
    });

    it("cleanup removes both hooks", async () => {
        const listener = vi.fn();
        const remove = messagesManager.onRequest("needInfo", asListener(listener));
        remove();

        await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 42,
                Dictionary: {
                    msg: "request",
                    data: {
                        requestId: "rid",
                        message: "needInfo",
                        data: {},
                    },
                },
            },
        ]);
        await fireHook("ServerAccountBeep", [
            {
                BeepType: "Leash",
                MemberNumber: 42,
                Message: JSON.stringify({
                    type: "ZOIS_TEST_request",
                    requestId: "rid",
                    message: "needInfo",
                    data: {},
                }),
            },
        ]);

        expect(listener).not.toHaveBeenCalled();
    });
});

describe("messagesManager.sendRequest", () => {
    it("sends packet request and registers ChatRoomMessage hook", () => {
        messagesManager.sendRequest({
            message: "needInfo",
            data: { q: 1 },
            target: 42,
            type: "packet",
        });

        expect(ServerSend).toHaveBeenCalledWith(
            "ChatRoomChat",
            expect.objectContaining({
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Target: 42,
                Dictionary: expect.objectContaining({
                    msg: "request",
                    data: expect.objectContaining({
                        message: "needInfo",
                        data: { q: 1 },
                        requestId: expect.any(String),
                    }),
                }),
            }),
        );
        expect(hookFunction).toHaveBeenCalledWith(
            "ChatRoomMessage",
            1,
            expect.any(Function),
        );
    });

    it("resolves with data when packet requestResponse arrives", async () => {
        const promise = messagesManager.sendRequest<{ answer: number }>({
            message: "needInfo",
            target: 42,
            type: "packet",
        });

        const sentCall = ServerSend.mock.calls[0];
        const requestId = sentCall[1].Dictionary.data.requestId;

        await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 42,
                Dictionary: {
                    msg: "requestResponse",
                    data: {
                        requestId,
                        message: "needInfo",
                        data: { answer: 7 },
                    },
                },
            },
        ]);

        await expect(promise).resolves.toEqual({
            data: { answer: 7 },
            isError: false,
        });
    });

    it("sends beep request and registers ServerAccountBeep hook", () => {
        messagesManager.sendRequest({
            message: "needInfo",
            data: { q: 1 },
            target: 42,
            type: "beep",
        });

        expect(ServerSend).toHaveBeenCalledWith(
            "AccountBeep",
            expect.objectContaining({
                MemberNumber: 42,
                BeepType: "Leash",
                IsSecret: true,
                Message: expect.stringContaining("ZOIS_TEST_request"),
            }),
        );
        expect(hookFunction).toHaveBeenCalledWith(
            "ServerAccountBeep",
            1,
            expect.any(Function),
        );
    });

    it("resolves with data when beep requestResponse arrives", async () => {
        const promise = messagesManager.sendRequest<{ answer: number }>({
            message: "needInfo",
            target: 42,
            type: "beep",
        });

        const sentCall = ServerSend.mock.calls[0];
        const payload = JSON.parse(sentCall[1].Message);
        const requestId = payload.requestId;

        await fireHook("ServerAccountBeep", [
            {
                BeepType: "Leash",
                MemberNumber: 42,
                Message: JSON.stringify({
                    type: "ZOIS_TEST_requestResponse",
                    requestId,
                    message: "needInfo",
                    data: { answer: 9 },
                }),
            },
        ]);

        await expect(promise).resolves.toEqual({
            data: { answer: 9 },
            isError: false,
        });
    });

    it("resolves isError true on timeout", async () => {
        vi.useFakeTimers();

        const promise = messagesManager.sendRequest({
            message: "needInfo",
            target: 42,
            type: "packet",
        });

        vi.advanceTimersByTime(6000);

        await expect(promise).resolves.toEqual({ isError: true });
    });

    it("resolves isError true when response DTO validation fails", async () => {
        (validateData as ReturnType<typeof vi.fn>).mockResolvedValue({ isValid: false });
        class RespDto {}

        const promise = messagesManager.sendRequest({
            message: "needInfo",
            target: 42,
            type: "packet",
            responseDto: RespDto,
        });

        const requestId = ServerSend.mock.calls[0][1].Dictionary.data.requestId;

        await fireHook("ChatRoomMessage", [
            {
                Content: "ZOIS_TEST",
                Type: "Hidden",
                Sender: 42,
                Dictionary: {
                    msg: "requestResponse",
                    data: {
                        requestId,
                        message: "needInfo",
                        data: { bad: true },
                    },
                },
            },
        ]);

        await expect(promise).resolves.toEqual({ isError: true });
    });
});
