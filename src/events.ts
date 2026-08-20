import { MOD_DATA } from ".";
import { CoreSettings } from "./core";
import { logger } from "./logging";
import { Shard } from "./shards";
import { BaseSubscreen } from "./ui";

export type EventCallback<T = any> = (data: T) => void;

export type KnownEventMap = {
    subscreenLoaded: {
        subscreen: BaseSubscreen
        sender: string
    }
    subscreenUnloaded: {
        subscreen: BaseSubscreen
        sender: string
    }
    setSubscreen: {
        target: string
        isTrusted: boolean
        sender: string
    }
    coreSettingsChanged: {
        settings: CoreSettings
        sender: string
    }
    shardMounted: {
        shard: Shard
        sender: string
    }
    shardUnmounted: {
        shard: Shard
        sender: string
    }
};

type UnknownEventData = {
    sender: string;
    [key: string]: unknown;
};

export type EventMap = KnownEventMap & {
    [event: string]: UnknownEventData;
};

interface EventListener {
    callback: EventCallback<any>
    senderFilter: string | null
}

const listeners = new Map<string, Set<EventListener>>();
const onceListeners = new Map<string, Set<EventListener>>();

function parseEventSpec(spec: string): { event: string; senderFilter: string | null } {
    const idx = spec.indexOf(":");
    if (idx === -1) {
        return { event: spec, senderFilter: null };
    }
    return {
        senderFilter: spec.slice(0, idx),
        event: spec.slice(idx + 1),
    };
}

export class EventBus {
    readonly #id: string;

    public get id(): string {
        return this.#id;
    }

    constructor(id: string) {
        this.#id = id;
    }

    public emit<T extends string>(
        event: T,
        data: T extends keyof KnownEventMap
            ? Omit<KnownEventMap[T], "sender">
            : Record<string, unknown>
    ): void {
        const fullData = { ...data, sender: this.id };

        const commonEventListeners = listeners.get(event);
        if (commonEventListeners) {
            for (const listener of commonEventListeners) {
                try {
                    if (listener.senderFilter) {
                        if (listener.senderFilter === this.id) listener.callback(fullData);
                    } else {
                        listener.callback(fullData);
                    }
                } catch (e) { }
            }
        }

        const onceEventListeners = onceListeners.get(event);
        if (onceEventListeners) {
            for (const listener of onceEventListeners) {
                try {
                    if (listener.senderFilter) {
                        if (listener.senderFilter === this.id) {
                            listener.callback(fullData);
                            onceEventListeners.delete(listener);
                        }
                    } else {
                        listener.callback(fullData);
                        onceEventListeners.delete(listener);
                    }
                } catch (e) { }
            }
        }
    }

    public on<T extends string>(
        eventSpec: T,
        callback: EventCallback<
            T extends `${string}:${infer E}`
            ? E extends keyof KnownEventMap
            ? KnownEventMap[E]
            : UnknownEventData
            : T extends keyof KnownEventMap
            ? KnownEventMap[T]
            : UnknownEventData
        >
    ): () => void {
        const { event, senderFilter } = parseEventSpec(eventSpec);
        let eventListeners = listeners.get(event);
        if (!eventListeners) {
            eventListeners = new Set();
            listeners.set(event, eventListeners);
        }

        const listener = {
            callback,
            senderFilter
        };
        eventListeners.add(listener);

        return () => {
            eventListeners.delete(listener);
        };
    }

    public once<T extends string>(
        eventSpec: T,
        callback: EventCallback<
            T extends `${string}:${infer E}`
            ? E extends keyof KnownEventMap
            ? KnownEventMap[E]
            : UnknownEventData
            : T extends keyof KnownEventMap
            ? KnownEventMap[T]
            : UnknownEventData
        >
    ): () => void {
        const { event, senderFilter } = parseEventSpec(eventSpec);
        let eventListeners = onceListeners.get(event);
        if (!eventListeners) {
            eventListeners = new Set();
            onceListeners.set(event, eventListeners);
        }

        const listener = {
            callback,
            senderFilter
        };
        eventListeners.add(listener);

        return () => {
            eventListeners.delete(listener);
        };
    }
}

const createdBuses = new Map<string, EventBus>();

export function getEventBus(id: string): EventBus {
    if (typeof id !== "string" || id.trim() === "") {
        throw new Error("id must be a non-empty string");
    }

    if (createdBuses.has(id)) {
        throw new Error(
            `EventBus with id "${id}" already exists`
        );
    }

    const bus = new EventBus(id);
    createdBuses.set(id, bus);
    return bus;
}

export let eventBus: EventBus | null = null;

export function createEventBus() {
    try {
        eventBus = window.ZOIS_CORE.getEventBus(MOD_DATA.name);
    } catch (e) {
        logger.error("Failed to create EventBus:", e);
    }
}