import { logger } from "../logging";
import { ShardContext, Shard } from "../shards";
import { autosetFontSize, setFontSize } from "../ui";

interface TextShardContext extends ShardContext {
    text: string;
    fontSize?: number | "auto";
}

class TextShard extends Shard<TextShardContext> {
    protected render(): Record<"base", HTMLElement | SVGElement> {
        return {
            base: (
                <p
                    style={{
                        color: "rgb(141, 247, 116)",
                        padding: "0",
                        margin: "0"
                    }}
                >
                    {this.context.text}
                </p>
            )
        };
    }

    protected update(): void {
        super.update();
        if ((this.context.fontSize ?? "auto") === "auto") {
            autosetFontSize(this.body!.base as HTMLElement);
        } else if (typeof this.context.fontSize === "number") {
            setFontSize(this.body!.base as HTMLElement, this.context.fontSize);
        }
    }
}

export function createText(context: TextShardContext) {
    const shard = new TextShard(context);
    shard.mount();
}

interface ButtonShardContext extends ShardContext {
    text?: string;
    fontSize?: number | "auto";
    onClick?: () => void;
    isDisabled?: () => boolean;
    icon?: string | SVGElement;
}

class ButtonShard extends Shard<ButtonShardContext> {
    protected render(): Record<"base", HTMLElement | SVGElement> {
        const content: Array<HTMLElement | SVGElement | string> = [];

        if (this.context.icon) {
            if (typeof this.context.icon === "string") {
                content.push(
                    <img
                        src={this.context.icon}
                        alt=""
                        style={{
                            display: "block",
                            width: "1.25em",
                            height: "1.25em",
                            filter: "drop-shadow(0 0 6px rgba(141, 247, 116, 0.4))"
                        }}
                    />
                );
            } else {
                const iconNode = this.context.icon.cloneNode(true) as SVGElement;
                iconNode.style.width = "1.25em";
                iconNode.style.height = "1.25em";
                iconNode.style.filter = "drop-shadow(0 0 6px rgba(141, 247, 116, 0.4))";
                content.push(iconNode);
            }
        }

        if (this.context.text) {
            content.push(
                <span style={{ whiteSpace: "nowrap" }}>
                    {this.context.text}
                </span>
            );
        }

        const button = (
            <button
                type="button"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5em",
                    margin: "0",
                    border: "1px solid rgba(141, 247, 116, 0.45)",
                    borderRadius: "8px",
                    background: "linear-gradient(180deg, rgba(28, 110, 36, 0.75), rgba(12, 55, 18, 0.9))",
                    color: "rgb(141, 247, 116)",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(180, 255, 190, 0.15)",
                    textShadow: "0 0 10px rgba(141, 247, 116, 0.35)",
                    boxSizing: "border-box"
                }}
                onClick={() => {
                    if (typeof this.context.isDisabled === "function" && this.context.isDisabled()) {
                        return;
                    }
                    this.context.onClick?.();
                }}
                onMouseEnter={(event) => {
                    if (typeof this.context.isDisabled === "function" && this.context.isDisabled()) {
                        return;
                    }
                    const el = event.currentTarget as HTMLButtonElement;
                    el.style.borderColor = "rgba(180, 255, 160, 0.7)";
                    el.style.color = "#e8ffe8";
                    el.style.background = "linear-gradient(180deg, rgba(38, 140, 48, 0.85), rgba(18, 75, 25, 0.95))";
                    el.style.boxShadow = "0 6px 20px rgba(80, 255, 100, 0.22), inset 0 1px 0 rgba(200, 255, 210, 0.25)";
                    el.style.textShadow = "0 0 14px rgba(180, 255, 160, 0.6)";
                    el.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(event) => {
                    const el = event.currentTarget as HTMLButtonElement;
                    el.style.borderColor = "rgba(141, 247, 116, 0.45)";
                    el.style.color = "rgb(141, 247, 116)";
                    el.style.background = "linear-gradient(180deg, rgba(28, 110, 36, 0.75), rgba(12, 55, 18, 0.9))";
                    el.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(180, 255, 190, 0.15)";
                    el.style.textShadow = "0 0 10px rgba(141, 247, 116, 0.35)";
                    el.style.transform = "translateY(0)";
                }}
                onMouseDown={(event) => {
                    const el = event.currentTarget as HTMLButtonElement;
                    el.style.transform = "translateY(1px)";
                    el.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(180, 255, 190, 0.1)";
                }}
                onMouseUp={(event) => {
                    const el = event.currentTarget as HTMLButtonElement;
                    el.style.transform = "translateY(-1px)";
                    el.style.boxShadow = "0 6px 20px rgba(80, 255, 100, 0.22), inset 0 1px 0 rgba(200, 255, 210, 0.25)";
                }}
            >
                {content}
            </button>
        ) as HTMLButtonElement;

        return {
            base: button
        };
    }

    protected update(): void {
        super.update();
        if ((this.context.fontSize ?? "auto") === "auto") {
            autosetFontSize(this.body!.base as HTMLElement);
        } else if (typeof this.context.fontSize === "number") {
            setFontSize(this.body!.base as HTMLElement, this.context.fontSize);
        }
    }
}

export function createButton(context: ButtonShardContext) {
    const shard = new ButtonShard(context);
    shard.mount();
}

interface MenuItemData {
    text: string;
    onClick?: () => void;
}

interface MenuShardContext extends ShardContext {
    items: MenuItemData[];
    fontSize?: number | "auto";
}

class MenuShard extends Shard<MenuShardContext> {
    private keyHandler: ((event: KeyboardEvent) => void) | null = null;

    protected render(): Record<"base", HTMLElement | SVGElement> {
        const items = this.context.items ?? [];
        const itemElements: HTMLElement[] = [];
        const state = { selectedIndex: 0 };

        const refreshHighlight = () => {
            itemElements.forEach((el, index) => {
                const label = el.querySelector("span:not(.menu-item-bar)") as HTMLElement | null;
                const bar = el.querySelector(".menu-item-bar") as HTMLElement | null;
                if (!label || !bar) {
                    return;
                }

                const selected = index === state.selectedIndex;
                label.style.color = selected ? "rgb(10, 91, 3)" : "rgb(141, 247, 116)";
                bar.style.opacity = selected ? "1" : "0";
                bar.style.transform = selected ? "scaleX(1)" : "scaleX(0.96)";
            });
        };

        const container = (
            <div
                role="menu"
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    margin: "0",
                    padding: "0",
                    background: "transparent",
                    border: "none",
                    boxSizing: "border-box"
                }}
            />
        ) as HTMLDivElement;

        items.forEach((item, index) => {
            const label = (
                <span
                    style={{
                        position: "relative",
                        zIndex: "1",
                        color: index === state.selectedIndex ? "rgb(10, 91, 3)" : "rgb(141, 247, 116)",
                        fontWeight: "500",
                        letterSpacing: "0.04em",
                        transition: "color 0.12s ease"
                    }}
                >
                    {item.text}
                </span>
            ) as HTMLSpanElement;

            const bar = (
                <span
                    class="menu-item-bar"
                    style={{
                        position: "absolute",
                        left: "-0.75em",
                        top: "0",
                        bottom: "0",
                        width: "16em",
                        background: "rgba(141, 247, 116, 0.5)",
                        boxShadow: "0 0 12px rgba(141, 247, 116, 0.25)",
                        opacity: index === state.selectedIndex ? "1" : "0",
                        transform: index === state.selectedIndex ? "scaleX(1)" : "scaleX(0.96)",
                        transformOrigin: "left center",
                        transition: "opacity 0.12s ease, transform 0.12s ease",
                        pointerEvents: "none",
                        borderRadius: "2px"
                    }}
                />
            ) as HTMLSpanElement;

            const row = (
                <div
                    role="menuitem"
                    data-menu-index={String(index)}
                    style={{
                        position: "relative",
                        display: "inline-flex",
                        alignItems: "center",
                        width: "16em",
                        margin: "0",
                        padding: "0.25em 0.15em",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        cursor: "pointer",
                        userSelect: "none",
                        boxSizing: "border-box"
                    }}
                    onClick={() => {
                        state.selectedIndex = index;
                        refreshHighlight();
                        item.onClick?.();
                    }}
                    onMouseEnter={() => {
                        state.selectedIndex = index;
                        refreshHighlight();
                    }}
                >
                    {bar}
                    {label}
                </div>
            ) as HTMLDivElement;

            itemElements.push(row);
            container.appendChild(row);
        });

        this.keyHandler = (event: KeyboardEvent) => {
            if (!itemElements.length) {
                return;
            }

            if (event.key === "ArrowDown") {
                event.preventDefault();
                state.selectedIndex = (state.selectedIndex + 1) % itemElements.length;
                refreshHighlight();
            } else if (event.key === "ArrowUp") {
                event.preventDefault();
                state.selectedIndex =
                    (state.selectedIndex - 1 + itemElements.length) % itemElements.length;
                refreshHighlight();
            } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                items[state.selectedIndex]?.onClick?.();
            }
        };

        window.addEventListener("keydown", this.keyHandler);

        return {
            base: container
        };
    }

    protected update(): void {
        super.update();
        if ((this.context.fontSize ?? "auto") === "auto") {
            autosetFontSize(this.body!.base as HTMLElement);
        } else if (typeof this.context.fontSize === "number") {
            setFontSize(this.body!.base as HTMLElement, this.context.fontSize);
        }
    }

    public override unmount(): void {
        if (this.keyHandler) {
            window.removeEventListener("keydown", this.keyHandler);
            this.keyHandler = null;
        }
        super.unmount();
    }
}

export function createMenu(context: MenuShardContext) {
    const shard = new MenuShard(context);
    shard.mount();
}

interface TerminalShardContext extends ShardContext {
    title?: string;
    jobs: TerminalJob[];
    onComplete?: () => void;
}

interface TerminalCmdJob {
    type: "cmd";
    text: string;
}

interface TerminalOutJob {
    type: "out";
    text: string;
}

interface TerminalTimerJob {
    type: "timer";
    duration: number;
}

type TerminalJob = TerminalCmdJob | TerminalOutJob | TerminalTimerJob;

class TerminalShard extends Shard<TerminalShardContext> {
    private animationTimer: number | null = null;

    protected render(): Record<"base", HTMLElement | SVGElement> {
        const title = this.context.title ?? "kernel-boot";
        const jobs = this.context.jobs;

        const u = (n: number) => `calc(${n} * var(--size-unit) * 1px)`;

        const terminal = (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    background: "rgba(8, 70, 18, 0.92)",
                    border: `1px solid rgba(141, 247, 116, 0.45)`,
                    borderRadius: u(1.2),
                    overflow: "hidden",
                    boxShadow:
                        "0 12px 28px rgba(0, 0, 0, 0.22), 0 0 18px rgba(80, 255, 110, 0.12)",
                    color: "rgb(180, 255, 170)",
                    fontFamily: "monospace",
                    display: "flex",
                    flexDirection: "column",
                    boxSizing: "border-box",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: u(0.75),
                        background: "rgba(12, 90, 24, 0.95)",
                        padding: `${u(0.55)} ${u(0.9)}`,
                        borderBottom: "1px solid rgba(141, 247, 116, 0.3)",
                        color: "rgb(200, 255, 190)",
                        fontSize: u(1.4),
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        flexShrink: "0",
                        minHeight: u(3.2),
                        boxSizing: "border-box",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            gap: u(0.45),
                            alignItems: "center",
                            flexShrink: "0",
                        }}
                    >
                        <span
                            style={{
                                display: "inline-block",
                                width: u(1.1),
                                height: u(1.1),
                                borderRadius: "50%",
                                background: "#ff5f57",
                                flexShrink: "0",
                            }}
                        />
                        <span
                            style={{
                                display: "inline-block",
                                width: u(1.1),
                                height: u(1.1),
                                borderRadius: "50%",
                                background: "#febc2e",
                                flexShrink: "0",
                            }}
                        />
                        <span
                            style={{
                                display: "inline-block",
                                width: u(1.1),
                                height: u(1.1),
                                borderRadius: "50%",
                                background: "#28c840",
                                flexShrink: "0",
                            }}
                        />
                    </div>
                    <span
                        style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            minWidth: "0",
                        }}
                    >
                        {title}
                    </span>
                    <span
                        style={{
                            opacity: "0.55",
                            fontSize: u(1.2),
                            flexShrink: "0",
                        }}
                    >
                        root@kernel
                    </span>
                </div>
                <div
                    class="terminal-screen"
                    style={{
                        flex: "1",
                        minHeight: "0",
                        padding: `${u(0.75)} ${u(1)}`,
                        background: "rgba(6, 55, 14, 0.88)",
                        whiteSpace: "pre-wrap",
                        overflowX: "hidden",
                        overflowY: "auto",
                        fontSize: u(1.5),
                        lineHeight: "1.4",
                        boxSizing: "border-box",
                    }}
                />
            </div>
        ) as HTMLDivElement;

        const screen = terminal.querySelector(
            ".terminal-screen",
        ) as HTMLDivElement;

        const visibleLines: Array<{ type: "cmd" | "out"; text: string }> = [];
        let jobIndex = 0;
        let showCursor = true;

        const createCmdRow = (text: string, withCursor: boolean) =>
            (
                <div
                    style={{
                        color: "rgb(170, 245, 160)",
                        marginBottom: u(0.25),
                        wordBreak: "break-word",
                    }}
                >
                    <span style={{ color: "rgb(120, 230, 130)" }}>
                        root@kernel:~$
                    </span>{" "}
                    {text}
                    {withCursor ? (
                        <span
                            style={{
                                display: "inline-block",
                                width: "0.5ch",
                                marginLeft: "2px",
                                color: "rgb(230, 255, 180)",
                            }}
                        >
                            █
                        </span>
                    ) : null}
                </div>
            ) as HTMLDivElement;

        const createOutRow = (text: string, withCursor: boolean) =>
            (
                <div
                    style={{
                        color: "rgb(220, 255, 140)",
                        marginBottom: u(0.25),
                        textShadow: "0 0 8px rgba(220, 255, 140, 0.35)",
                        fontWeight: "600",
                        wordBreak: "break-word",
                    }}
                >
                    {text}
                    {withCursor ? (
                        <span
                            style={{
                                display: "inline-block",
                                width: "0.5ch",
                                marginLeft: "2px",
                                color: "rgb(230, 255, 180)",
                            }}
                        >
                            █
                        </span>
                    ) : null}
                </div>
            ) as HTMLDivElement;

        const paint = () => {
            const rows: HTMLDivElement[] = [];

            for (let i = 0; i < visibleLines.length; i++) {
                const line = visibleLines[i];
                const isLast = i === visibleLines.length - 1 && showCursor;
                if (line.type === "cmd") {
                    rows.push(createCmdRow(line.text, isLast));
                } else {
                    rows.push(createOutRow(line.text, isLast));
                }
            }

            if (visibleLines.length === 0 && showCursor) {
                rows.push(createCmdRow("", true));
            }

            screen.replaceChildren(...rows);
            screen.scrollTop = screen.scrollHeight;
        };

        const clearTimer = () => {
            if (this.animationTimer !== null) {
                window.clearTimeout(this.animationTimer);
                this.animationTimer = null;
            }
        };

        const schedule = (ms: number, fn: () => void) => {
            clearTimer();
            this.animationTimer = window.setTimeout(fn, ms);
        };

        const finish = () => {
            clearTimer();
            showCursor = false;
            paint();
            this.context.onComplete?.();
        };

        const runNext = () => {
            if (jobIndex >= jobs.length) {
                finish();
                return;
            }

            const job = jobs[jobIndex];
            jobIndex += 1;

            if (job.type === "timer") {
                showCursor = true;
                paint();
                schedule(Math.max(0, job.duration), runNext);
                return;
            }

            visibleLines.push({ type: job.type, text: job.text });
            showCursor = true;
            paint();

            const defaultGapMs = 80;
            schedule(defaultGapMs, runNext);
        };

        paint();
        schedule(0, runNext);

        return {
            base: terminal,
        };
    }

    public override unmount(): void {
        if (this.animationTimer !== null) {
            window.clearTimeout(this.animationTimer);
            this.animationTimer = null;
        }
        super.unmount();
    }
}

export function createTerminal(context: TerminalShardContext) {
    const shard = new TerminalShard(context);
    return shard.mount();
}

interface CheckboxShardContext extends ShardContext {
    text: string;
    fontSize?: number | "auto";
    isChecked?: boolean;
    onChange?: (checked: boolean) => void;
}

class CheckboxShard extends Shard<CheckboxShardContext> {
    protected render(): Record<"base", HTMLElement | SVGElement> {
        const u = (n: number) => `calc(${n} * var(--size-unit) * 1px)`;

        const checkbox = (
            <input
                type="checkbox"
                checked={this.context.isChecked ?? false}
                style={{
                    width: u(3),
                    height: u(3),
                    minWidth: u(3),
                    minHeight: u(3),
                    accentColor: "rgb(141, 247, 116)",
                    cursor: "pointer",
                    flexShrink: "0",
                    margin: "0"
                }}
            />
        ) as HTMLInputElement;

        const label = (
            <span
                style={{
                    color: "rgb(141, 247, 116)",
                    fontWeight: "500",
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                    transition: "color 0.12s ease"
                }}
            >
                {this.context.text}
            </span>
        ) as HTMLSpanElement;

        const container = (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: u(2),
                    width: "fit-content",
                    maxWidth: "100%",
                    margin: "0",
                    padding: `${u(0.7)} ${u(1.1)}`,
                    borderRadius: u(1),
                    border: "1px solid rgba(141, 247, 116, 0.35)",
                    background: "rgba(16, 70, 22, 0.55)",
                    boxShadow: "inset 0 1px 0 rgba(180, 255, 190, 0.08)",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease"
                }}
            >
                {checkbox}
                {label}
            </div>
        ) as HTMLDivElement;

        const applyCheckedStyle = (checked: boolean) => {
            if (checked) {
                container.style.borderColor = "rgba(160, 255, 170, 0.55)";
                container.style.background = "rgba(22, 95, 30, 0.7)";
                container.style.boxShadow = "0 0 12px rgba(100, 255, 120, 0.12), inset 0 1px 0 rgba(180, 255, 190, 0.12)";
            } else {
                container.style.borderColor = "rgba(141, 247, 116, 0.35)";
                container.style.background = "rgba(16, 70, 22, 0.55)";
                container.style.boxShadow = "inset 0 1px 0 rgba(180, 255, 190, 0.08)";
            }
        };

        applyCheckedStyle(this.context.isChecked ?? false);

        checkbox.addEventListener("change", () => {
            applyCheckedStyle(checkbox.checked);
            this.context.onChange?.(checkbox.checked);
        });

        container.addEventListener("click", () => {
            checkbox.click();
        });

        container.addEventListener("mouseenter", () => {
            if (!checkbox.checked) {
                container.style.borderColor = "rgba(160, 255, 170, 0.5)";
                container.style.background = "rgba(20, 85, 28, 0.65)";
            }
        });

        container.addEventListener("mouseleave", () => {
            if (!checkbox.checked) {
                container.style.borderColor = "rgba(141, 247, 116, 0.35)";
                container.style.background = "rgba(16, 70, 22, 0.55)";
            }
        });

        return {
            base: container
        };
    }

    protected update(): void {
        super.update();
        if ((this.context.fontSize ?? "auto") === "auto") {
            autosetFontSize(this.body!.base as HTMLElement);
        } else if (typeof this.context.fontSize === "number") {
            setFontSize(this.body!.base as HTMLElement, this.context.fontSize);
        }
    }
}

export function createCheckbox(context: CheckboxShardContext) {
    const shard = new CheckboxShard(context);
    return shard.mount();
}

interface SelectOption {
    name: string;
    text: string;
}

interface SelectShardContext extends ShardContext {
    options: SelectOption[];
    currentOption?: string;
    fontSize?: number | "auto";
    onChange?: (value: string) => void;
}

class SelectShard extends Shard<SelectShardContext> {
    protected render(): Record<"base", HTMLElement | SVGElement> {
        const u = (n: number) => `calc(${n} * var(--size-unit) * 1px)`;

        const options = this.context.options ?? [];
        const state = {
            current: this.context.currentOption ?? options[0]?.name ?? ""
        };

        const selected = options.find((option) => option.name === state.current) ?? options[0] ?? { name: "", text: "" };

        const labelSpan = (
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selected.text}
            </span>
        ) as HTMLSpanElement;

        const menu = (
            <div
                style={{
                    display: "none",
                    position: "absolute",
                    left: "0",
                    right: "0",
                    top: `calc(100% + ${u(0.4)})`,
                    background: "rgba(10, 48, 14, 0.97)",
                    border: "1px solid rgba(141, 247, 116, 0.4)",
                    borderRadius: u(1),
                    overflow: "hidden",
                    zIndex: "30",
                    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.3), 0 0 14px rgba(80, 255, 100, 0.1)",
                    boxSizing: "border-box"
                }}
            />
        ) as HTMLDivElement;

        const button = (
            <button
                type="button"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: u(0.8),
                    width: "100%",
                    minHeight: u(4),
                    margin: "0",
                    padding: `${u(0.7)} ${u(1)}`,
                    borderRadius: u(1),
                    border: "1px solid rgba(141, 247, 116, 0.4)",
                    background: "linear-gradient(180deg, rgba(24, 95, 28, 0.92), rgba(12, 55, 18, 0.96))",
                    color: "rgb(200, 255, 190)",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "inset 0 1px 0 rgba(180, 255, 190, 0.12)",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease, background 0.15s ease"
                }}
                onClick={() => {
                    menu.style.display = menu.style.display === "none" ? "block" : "none";
                }}
                onMouseEnter={() => {
                    button.style.borderColor = "rgba(170, 255, 180, 0.6)";
                    button.style.background = "linear-gradient(180deg, rgba(32, 115, 36, 0.95), rgba(16, 65, 22, 0.98))";
                }}
                onMouseLeave={() => {
                    button.style.borderColor = "rgba(141, 247, 116, 0.4)";
                    button.style.background = "linear-gradient(180deg, rgba(24, 95, 28, 0.92), rgba(12, 55, 18, 0.96))";
                }}
            >
                {labelSpan}
                <span style={{ opacity: "0.75", flexShrink: "0" }}>▾</span>
            </button>
        ) as HTMLButtonElement;

        const rebuildMenu = () => {
            menu.replaceChildren();
            options.forEach((option) => {
                const optionButton = (
                    <button
                        type="button"
                        style={{
                            width: "100%",
                            margin: "0",
                            padding: `${u(0.7)} ${u(1)}`,
                            background: option.name === state.current ? "rgba(120, 255, 130, 0.18)" : "transparent",
                            border: "0",
                            color: "rgb(200, 255, 190)",
                            fontWeight: "600",
                            textAlign: "left",
                            cursor: "pointer",
                            boxSizing: "border-box",
                            transition: "background 0.12s ease"
                        }}
                        onClick={() => {
                            state.current = option.name;
                            labelSpan.textContent = option.text;
                            menu.style.display = "none";
                            this.context.onChange?.(option.name);
                            rebuildMenu();
                        }}
                        onMouseEnter={() => {
                            if (option.name !== state.current) {
                                optionButton.style.background = "rgba(100, 220, 120, 0.12)";
                            }
                        }}
                        onMouseLeave={() => {
                            optionButton.style.background =
                                option.name === state.current ? "rgba(120, 255, 130, 0.18)" : "transparent";
                        }}
                    >
                        {option.text}
                    </button>
                ) as HTMLButtonElement;

                menu.appendChild(optionButton);
            });
        };

        rebuildMenu();

        const wrapper = (
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    boxSizing: "border-box"
                }}
            >
                {button}
                {menu}
            </div>
        ) as HTMLDivElement;

        const onDocumentClick = (event: MouseEvent) => {
            if (!wrapper.contains(event.target as Node)) {
                menu.style.display = "none";
            }
        };
        document.addEventListener("click", onDocumentClick);

        const originalUnmount = this.unmount.bind(this);
        this.unmount = () => {
            document.removeEventListener("click", onDocumentClick);
            originalUnmount();
        };

        return {
            base: wrapper
        };
    }

    protected update(): void {
        super.update();
        if ((this.context.fontSize ?? "auto") === "auto") {
            autosetFontSize(this.body!.base as HTMLElement);
        } else if (typeof this.context.fontSize === "number") {
            setFontSize(this.body!.base as HTMLElement, this.context.fontSize);
        }
    }
}

export function createSelect(context: SelectShardContext) {
    const shard = new SelectShard(context);
    return shard.mount();
}

interface InputListShardContext extends ShardContext {
    title?: string;
    value?: string[];
    placeholder?: string;
    fontSize?: number | "auto";
    onChange?: (value: string[]) => void;
}

class InputListShard extends Shard<InputListShardContext> {
    protected render(): Record<"base", HTMLElement | SVGElement> {
        const u = (n: number) => `calc(${n} * var(--size-unit) * 1px)`;
        const values: string[] = [...(this.context.value ?? [])];

        const listContainer = (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: u(0.5),
                    flex: "1",
                    minHeight: "0",
                    overflowY: "auto",
                    overflowX: "hidden"
                }}
            />
        ) as HTMLDivElement;

        const input = (
            <input
                type="text"
                placeholder={this.context.placeholder ?? "Enter value"}
                style={{
                    flex: "1",
                    minWidth: "0",
                    margin: "0",
                    padding: `${u(0.65)} ${u(0.85)}`,
                    height: u(6.25),
                    borderRadius: u(0.8),
                    border: "1px solid rgba(141, 247, 116, 0.4)",
                    background: "rgba(8, 40, 14, 0.75)",
                    color: "rgb(200, 255, 190)",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease"
                }}
                onFocus={() => {
                    input.style.borderColor = "rgba(170, 255, 180, 0.65)";
                }}
                onBlur={() => {
                    input.style.borderColor = "rgba(141, 247, 116, 0.4)";
                }}
                onKeyDown={(event: KeyboardEvent) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        addValue();
                    }
                }}
            />
        ) as HTMLInputElement;

        const addButton = (
            <button
                type="button"
                style={{
                    margin: "0",
                    padding: `${u(0.55)} ${u(1)}`,
                    height: u(6.25),
                    borderRadius: u(0.8),
                    border: "1px solid rgba(141, 247, 116, 0.45)",
                    background: "linear-gradient(180deg, rgba(28, 110, 36, 0.85), rgba(14, 60, 20, 0.95))",
                    color: "rgb(200, 255, 190)",
                    fontWeight: "600",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease, background 0.15s ease"
                }}
                onClick={() => {
                    addValue();
                }}
                onMouseEnter={() => {
                    addButton.style.borderColor = "rgba(170, 255, 180, 0.65)";
                    addButton.style.background = "linear-gradient(180deg, rgba(38, 130, 46, 0.9), rgba(18, 75, 25, 0.98))";
                }}
                onMouseLeave={() => {
                    addButton.style.borderColor = "rgba(141, 247, 116, 0.45)";
                    addButton.style.background = "linear-gradient(180deg, rgba(28, 110, 36, 0.85), rgba(14, 60, 20, 0.95))";
                }}
            >
                Add
            </button>
        ) as HTMLButtonElement;

        const emitChange = () => {
            this.context.onChange?.([...values]);
        };

        const renderList = () => {
            const rows = values.map((value, index) => {
                const removeButton = (
                    <button
                        type="button"
                        style={{
                            margin: "0",
                            padding: `${u(0.35)} ${u(0.7)}`,
                            borderRadius: u(0.6),
                            border: "1px solid rgba(92, 159, 99, 0.68)",
                            background: "rgba(54, 121, 61, 0.68)",
                            color: "rgb(255, 210, 205)",
                            fontWeight: "600",
                            cursor: "pointer",
                            flexShrink: "0",
                            boxSizing: "border-box",
                            transition: "background 0.12s ease"
                        }}
                        onClick={() => {
                            values.splice(index, 1);
                            emitChange();
                            renderList();
                        }}
                        onMouseEnter={() => {
                            removeButton.style.background = "rgba(62, 128, 69, 0.68)";
                        }}
                        onMouseLeave={() => {
                            removeButton.style.background = "rgba(54, 121, 61, 0.68)";
                        }}
                    >
                        Remove
                    </button>
                ) as HTMLButtonElement;

                return (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: u(0.75),
                            padding: `${u(0.55)} ${u(0.8)}`,
                            borderRadius: u(0.8),
                            border: "1px solid rgba(141, 247, 116, 0.25)",
                            background: "rgba(8, 36, 14, 0.8)",
                            boxSizing: "border-box"
                        }}
                    >
                        <span
                            style={{
                                color: "rgb(190, 255, 180)",
                                overflowWrap: "anywhere",
                                minWidth: "0"
                            }}
                        >
                            {value}
                        </span>
                        {removeButton}
                    </div>
                ) as HTMLDivElement;
            });

            listContainer.replaceChildren(...rows);
        };

        const addValue = () => {
            const next = input.value.trim();
            if (!next) {
                return;
            }
            values.push(next);
            input.value = "";
            emitChange();
            renderList();
        };

        const wrapper = (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: u(0.8),
                    width: "100%",
                    height: "100%",
                    margin: "0",
                    padding: u(1),
                    borderRadius: u(1.2),
                    border: "1px solid rgba(141, 247, 116, 0.4)",
                    background: "rgba(12, 55, 18, 0.55)",
                    boxShadow: "inset 0 1px 0 rgba(180, 255, 190, 0.08)",
                    color: "rgb(200, 255, 190)",
                    boxSizing: "border-box",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: u(0.75),
                        flexShrink: "0"
                    }}
                >
                    <strong
                        style={{
                            color: "rgb(200, 255, 190)",
                            letterSpacing: "0.04em",
                            fontWeight: "600"
                        }}
                    >
                        {this.context.title ?? "List"}
                    </strong>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: u(0.6),
                        flexShrink: "0"
                    }}
                >
                    {input}
                    {addButton}
                </div>
                {listContainer}
            </div>
        ) as HTMLDivElement;

        renderList();

        return {
            base: wrapper
        };
    }

    protected update(): void {
        super.update();
        if ((this.context.fontSize ?? "auto") === "auto") {
            autosetFontSize(this.body!.base as HTMLElement);
        } else if (typeof this.context.fontSize === "number") {
            setFontSize(this.body!.base as HTMLElement, this.context.fontSize);
        }
    }
}

export function createInputList(context: InputListShardContext) {
    const shard = new InputListShard(context);
    return shard.mount();
}