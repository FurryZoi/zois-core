import { MOD_DATA } from "../index";
import { getDynamicClass, DynamicClassStyles, setFontFamily } from "../ui";
import { Shard, ShardContext } from "./shard";

export const EXTENSION_SETTINGS_LIMIT_BYTES = 180 * 1024;

export interface ExtensionStorageEntry {
    key: string;
    bytes: number;
    isFocus: boolean;
}

export interface ExtensionsStorageBarShardContext
    extends ShardContext<"bar" | "tooltip" | "summary" | "legend"> {
    modKey: string;
    tooltipPosition?: "left" | "right";
}

const OTHER_PALETTE = [
    "rgba(100, 149, 237, 0.85)",
    "rgba(72, 201, 176, 0.85)",
    "rgba(244, 162, 97, 0.85)",
    "rgba(231, 111, 81, 0.75)",
    "rgba(156, 136, 255, 0.85)",
    "rgba(86, 207, 225, 0.85)",
];

const FOCUS_COLOR = "var(--tmd-accent, #3b82f6)";
const FREE_COLOR = "rgba(128, 128, 128, 0.22)";

function measureEntryBytes(value: unknown): number {
    if (value == null) return 0;
    const str = typeof value === "string" ? value : JSON.stringify(value);
    return new TextEncoder().encode(str).byteLength;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb < 10 ? kb.toFixed(2) : kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function collectEntries(focusKey: string): ExtensionStorageEntry[] {
    const settings = (globalThis as any).Player?.ExtensionSettings as
        | Record<string, unknown>
        | undefined;

    if (!settings || typeof settings !== "object") {
        return [{ key: focusKey, bytes: 0, isFocus: true }];
    }

    const entries: ExtensionStorageEntry[] = [];
    let focusFound = false;

    for (const key of Object.keys(settings)) {
        const bytes = measureEntryBytes(settings[key]);
        if (bytes <= 0 && key !== focusKey) continue;
        const isFocus = key === focusKey;
        if (isFocus) focusFound = true;
        entries.push({ key, bytes, isFocus });
    }

    if (!focusFound) {
        entries.push({ key: focusKey, bytes: 0, isFocus: true });
    }

    entries.sort((a, b) => {
        if (a.isFocus !== b.isFocus) return a.isFocus ? -1 : 1;
        return b.bytes - a.bytes;
    });

    return entries;
}

type SegInfo = {
    key: string;
    label: string;
    bytes: number;
    color: string;
    isFocus: boolean;
    isFree?: boolean;
};

export class ExtensionsStorageBarShard extends Shard<ExtensionsStorageBarShardContext> {
    protected get dynamicClassRoot(): DynamicClassStyles {
        return {
            base: {
                position: "relative",
                display: "flex",
                flexDirection: "row",
                alignItems: "stretch",
                gap: "0.75em",
                boxSizing: "border-box",
                color: "var(--tmd-text, #111)",
                userSelect: "none",
                height: "100%",
                minHeight: "calc(28 * var(--size-unit) * 1px)",
                width: "100%",
            },
        };
    }

    protected get dynamicClassColumn(): DynamicClassStyles {
        return {
            base: {
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                flex: "0 0 auto",
                alignSelf: "stretch",
                height: "100%",
                minHeight: "calc(28 * var(--size-unit) * 1px)",
                position: "relative",
                boxSizing: "border-box",
            },
            ":hover > div:last-child": {
                visibility: "visible",
                opacity: "1",
            },
        };
    }

    protected get dynamicClassBar(): DynamicClassStyles {
        return {
            base: {
                position: "relative",
                flex: "1 1 auto",
                width: "calc(8 * var(--size-unit) * 1px)",
                minWidth: "14px",
                minHeight: "calc(28 * var(--size-unit) * 1px)",
                height: "100%",
                alignSelf: "stretch",
                display: "flex",
                flexDirection: "column-reverse",
                borderRadius: "8px",
                overflow: "hidden",
                border: "1px solid var(--tmd-accent, rgba(0,0,0,0.35))",
                background: "var(--tmd-element, #f3f4f6)",
                boxSizing: "border-box",
            },
            "> div": {
                width: "100%",
                minHeight: "0",
                flexBasis: "0",
                boxSizing: "border-box",
                transition: "filter 0.15s ease",
                cursor: "default",
            },
            "> div:hover": {
                filter: "brightness(1.15)",
            },
            "> div[data-focus=true]": {
                boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.55)",
                filter: "brightness(1.08)",
            },
        };
    }

    protected get dynamicClassLegend(): DynamicClassStyles {
        return {
            base: {
                flex: "1 1 auto",
                minWidth: "0",
                minHeight: "0",
                display: "flex",
                flexDirection: "column",
                gap: "0.35em",
                overflowY: "auto",
                overflowX: "hidden",
                fontSize: "calc(1.45 * var(--size-unit) * 1px)",
                lineHeight: "1.3",
                boxSizing: "border-box",
            },
            "> div": {
                display: "flex",
                alignItems: "center",
                gap: "0.45em",
                padding: "0.2em 0.15em",
                borderRadius: "4px",
            },
            "> div:hover": {
                background: "var(--tmd-element-hover, rgba(0,0,0,0.04))",
            },
            "> div > span:first-child": {
                flex: "0 0 auto",
                width: "0.75em",
                height: "0.75em",
                borderRadius: "2px",
                border: "1px solid rgba(0,0,0,0.12)",
                boxSizing: "border-box",
            },
            "> div > p": {
                margin: "0",
                flex: "1 1 auto",
                minWidth: "0",
                display: "flex",
                flexDirection: "column",
                gap: "0.1em",
            },
            "> div > p > strong": {
                fontWeight: "600",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            },
            "> div > p > span": {
                opacity: "0.75",
                fontSize: "0.9em",
            },
        };
    }

    protected get dynamicClassSummary(): DynamicClassStyles {
        return {
            base: {
                marginTop: "0.35em",
                flex: "0 0 auto",
                fontSize: "calc(1.5 * var(--size-unit) * 1px)",
                textAlign: "left",
                lineHeight: "1.25",
                width: "100%",
                wordBreak: "break-word",
                boxSizing: "border-box",
            },
            "> p": {
                margin: "0",
            },
            "> p:last-child": {
                opacity: "0.75",
                fontSize: "0.85em",
            },
        };
    }

    protected get dynamicClassTooltip(): DynamicClassStyles {
        const tipSide = this.context.tooltipPosition ?? "left";
        return {
            base: {
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                ...(tipSide === "left"
                    ? { right: "calc(100% + 0.5em)" }
                    : { left: "calc(100% + 0.5em)" }),
                background: "var(--tmd-element-hint, #1f2937)",
                color: "var(--tmd-text, #f9fafb)",
                padding: "0.45em 0.65em",
                borderRadius: "6px",
                fontSize: "calc(1.35 * var(--size-unit) * 1px)",
                lineHeight: "1.35",
                width: "max-content",
                maxWidth: "14em",
                visibility: "hidden",
                opacity: "0",
                pointerEvents: "none",
                zIndex: "20",
                boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                transition: "opacity 0.12s ease",
            },
        };
    }

    protected get dynamicClassSide(): DynamicClassStyles {
        return {
            base: {
                display: "flex",
                flexDirection: "column",
                flex: "1 1 auto",
                minWidth: "0",
                minHeight: "0",
                height: "100%",
                boxSizing: "border-box",
            },
        };
    }

    protected render() {
        const focusKey = this.context.modKey;
        const limit = EXTENSION_SETTINGS_LIMIT_BYTES;
        const entries = collectEntries(focusKey);
        const usedTotal = entries.reduce((s, e) => s + e.bytes, 0);
        const free = Math.max(0, limit - usedTotal);
        const focusBytes = entries.find((e) => e.isFocus)?.bytes ?? 0;

        const rootClass = getDynamicClass(this.dynamicClassRoot);
        const columnClass = getDynamicClass(this.dynamicClassColumn);
        const barClass = getDynamicClass(this.dynamicClassBar);
        const legendClass = getDynamicClass(this.dynamicClassLegend);
        const summaryClass = getDynamicClass(this.dynamicClassSummary);
        const tooltipClass = getDynamicClass(this.dynamicClassTooltip);
        const sideClass = getDynamicClass(this.dynamicClassSide);

        const tooltip = (<div class={tooltipClass} />) as HTMLDivElement;

        const defaultTooltipHtml = () =>
            [
                `<strong>${escapeHtml(focusKey)}</strong>: ${formatBytes(focusBytes)}`,
                `All mods: ${formatBytes(usedTotal)} / ${formatBytes(limit)}`,
                `Free: ${formatBytes(free)}`,
            ].join("<br>");

        const showTooltip = (html: string) => {
            tooltip.innerHTML = html;
        };
        showTooltip(defaultTooltipHtml());

        const segInfos: SegInfo[] = [];
        let otherColorIndex = 0;

        for (const entry of entries) {
            if (entry.bytes <= 0 && !entry.isFocus) continue;
            const color = entry.isFocus
                ? FOCUS_COLOR
                : OTHER_PALETTE[otherColorIndex++ % OTHER_PALETTE.length];
            segInfos.push({
                key: entry.key,
                label: entry.key,
                bytes: entry.bytes,
                color,
                isFocus: entry.isFocus,
            });
        }

        if (free > 0) {
            segInfos.push({
                key: "__free",
                label: "Free",
                bytes: free,
                color: FREE_COLOR,
                isFocus: false,
                isFree: true,
            });
        }

        const barSegments = segInfos.map((info) => {
            const pct = limit > 0 ? (info.bytes / limit) * 100 : 0;
            const flexGrow = Math.max(info.bytes, 1);

            return (
                <div
                    data-focus={info.isFocus ? "true" : "false"}
                    data-key={info.key}
                    title={`${info.label}: ${formatBytes(info.bytes)}`}
                    style={{
                        flex: `${flexGrow} 0 0`,
                        background: info.color,
                    }}
                    onMouseEnter={() => {
                        showTooltip(
                            [
                                `<strong>${escapeHtml(info.label)}</strong>`,
                                formatBytes(info.bytes),
                                `${pct.toFixed(1)}% of limit`,
                            ].join("<br>"),
                        );
                    }}
                    onMouseLeave={() => showTooltip(defaultTooltipHtml())}
                />
            );
        });

        const legendItems = segInfos.map((info) => {
            const pct = limit > 0 ? (info.bytes / limit) * 100 : 0;
            return (
                <div
                    onMouseEnter={() => {
                        showTooltip(
                            [
                                `<strong>${escapeHtml(info.label)}</strong>`,
                                formatBytes(info.bytes),
                                `${pct.toFixed(1)}% of limit`,
                            ].join("<br>"),
                        );
                    }}
                    onMouseLeave={() => showTooltip(defaultTooltipHtml())}
                >
                    <span style={{ background: info.color }} />
                    <p>
                        <strong>{info.label}</strong>
                        <span>
                            {formatBytes(info.bytes)} · {pct.toFixed(1)}%
                        </span>
                    </p>
                </div>
            );
        });

        const bar = (
            <div class={barClass}>{barSegments}</div>
        ) as HTMLDivElement;

        const legend = (
            <div class={legendClass}>{legendItems}</div>
        ) as HTMLDivElement;

        const summary = (
            <div class={summaryClass}>
                <p>
                    <strong>{focusKey}</strong>
                    {" · "}
                    {formatBytes(focusBytes)}
                </p>
                <p>
                    {formatBytes(usedTotal)} / {formatBytes(limit)}
                </p>
            </div>
        ) as HTMLDivElement;

        const root = (
            <div class={rootClass}>
                <div class={columnClass}>
                    {bar}
                    {tooltip}
                </div>
                <div class={sideClass}>
                    {legend}
                    {summary}
                </div>
            </div>
        ) as HTMLDivElement;

        setFontFamily(root, MOD_DATA.fontFamily);

        return {
            base: root,
            bar,
            tooltip,
            summary,
            legend,
        };
    }
}