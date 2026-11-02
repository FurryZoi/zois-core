import { isVersionNewer, version, waitFor } from "../index";
import { activateCore } from "./activate";


interface CoreQueueEntry {
    version: string;
    activate: () => void;
}

declare global {
    interface Window {
        __ZOIS_CORE_QUEUE__?: CoreQueueEntry[];
        __ZOIS_CORE_FLUSH_STARTED__?: boolean;
        __ZOIS_CORE_ACTIVATED__?: boolean;
    }
}

function flushCoreQueue(): void {
    if (window.__ZOIS_CORE_ACTIVATED__) return;
    const queue = window.__ZOIS_CORE_QUEUE__ ?? [];
    if (queue.length === 0) return;

    let best = queue[0];
    for (let i = 1; i < queue.length; i++) {
        const entry = queue[i];
        if (isVersionNewer(entry.version, best.version)) {
            best = entry;
        }
    }

    best.activate();
}

export function registerCore(): void {
    if (!window.__ZOIS_CORE_QUEUE__) {
        window.__ZOIS_CORE_QUEUE__ = [];
    }

    window.__ZOIS_CORE_QUEUE__.push({
        version,
        activate: activateCore,
    });

    if (window.__ZOIS_CORE_FLUSH_STARTED__) return;
    window.__ZOIS_CORE_FLUSH_STARTED__ = true;

    waitFor(() => typeof Player?.MemberNumber === "number").then(() => {
        setTimeout(flushCoreQueue, 100);
    });
}
