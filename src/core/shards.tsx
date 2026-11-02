import { Check, ChevronDown, X, createElement } from "lucide";
import { ShardContext, Shard } from "../shards";
import { autosetFontSize, getDynamicClass, setFontSize } from "../ui";

const CORE_BASE = "#20a214";
const CORE_BORDER = "#33c633";
const CORE_HOVER = "#39bd2d";
const CORE_HOVER_TEXT = "#76ff76";
const CORE_TEXT = "rgb(162, 255, 19)";
const CORE_TITLE = "rgb(155, 255, 0)";
const CORE_DARK = "#004800";
const CORE_ITEM = "rgb(112, 234, 68)";
const CORE_ITEM_HOVER = "rgb(77, 221, 65)";
const CORE_INSET = "#136f0b";
const CORE_INSET_HOVER = "#1a8512";
const CORE_MUTED = "rgb(120, 214, 80)";

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
                        color: CORE_TEXT,
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
                        }}
                    />
                );
            } else {
                const iconNode = this.context.icon.cloneNode(true) as SVGElement;
                iconNode.style.width = "1.25em";
                iconNode.style.height = "1.25em";
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
                    border: `2px solid ${CORE_BORDER}`,
                    borderRadius: "0.1em",
                    background: CORE_BASE,
                    color: CORE_DARK,
                    fontWeight: "600",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease"
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
                    el.style.borderColor = CORE_HOVER_TEXT;
                    el.style.color = CORE_HOVER_TEXT;
                    el.style.background = CORE_HOVER;
                }}
                onMouseLeave={(event) => {
                    const el = event.currentTarget as HTMLButtonElement;
                    el.style.borderColor = CORE_BORDER;
                    el.style.color = CORE_DARK;
                    el.style.background = CORE_BASE;
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

        const state = {
            checked: this.context.isChecked ?? false,
            hovered: false
        };

        const checkIcon = createElement(Check);
        checkIcon.setAttribute("stroke-width", "4");
        checkIcon.style.width = "60%"
        checkIcon.style.height = "60%";
        checkIcon.style.pointerEvents = "none";

        const box = (
            <span
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: u(5),
                    height: u(5),
                    minWidth: u(5),
                    minHeight: u(5),
                    border: `2px solid ${CORE_BORDER}`,
                    borderRadius: u(0.5),
                    background: CORE_BASE,
                    boxSizing: "border-box",
                    flexShrink: "0",
                    transition: "background 0.12s ease, border-color 0.12s ease"
                }}
            />
        ) as HTMLSpanElement;

        box.append(checkIcon);

        const label = (
            <span
                style={{
                    color: CORE_TEXT,
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
                role="checkbox"
                tabIndex={0}
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: u(1.2),
                    width: "fit-content",
                    maxWidth: "100%",
                    margin: "0",
                    cursor: "pointer",
                    userSelect: "none",
                    outline: "none",
                    boxSizing: "border-box"
                }}
            >
                {box}
                {label}
            </div>
        ) as HTMLDivElement;

        const paint = () => {
            const { checked, hovered } = state;
            box.style.background = hovered ? CORE_HOVER : checked ? CORE_DARK : CORE_BASE;
            box.style.borderColor = hovered || checked ? CORE_HOVER_TEXT : CORE_BORDER;
            checkIcon.style.display = checked ? "block" : "none";
            checkIcon.style.color = hovered ? CORE_DARK : CORE_TEXT;
            label.style.color = hovered ? CORE_HOVER_TEXT : CORE_TEXT;
            container.setAttribute("aria-checked", String(checked));
        };

        const toggle = () => {
            state.checked = !state.checked;
            paint();
            this.context.onChange?.(state.checked);
        };

        container.addEventListener("click", toggle);

        container.addEventListener("keydown", (event) => {
            if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                toggle();
            }
        });

        container.addEventListener("mouseenter", () => {
            state.hovered = true;
            paint();
        });

        container.addEventListener("mouseleave", () => {
            state.hovered = false;
            paint();
        });

        container.addEventListener("focus", () => {
            state.hovered = true;
            paint();
        });

        container.addEventListener("blur", () => {
            state.hovered = false;
            paint();
        });

        paint();

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

        const chevron = createElement(ChevronDown) as unknown as SVGElement;
        chevron.style.width = u(2);
        chevron.style.height = u(2);
        chevron.style.flexShrink = "0";
        chevron.style.transition = "transform 0.15s ease";

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
                    background: CORE_BASE,
                    border: `2px solid ${CORE_BORDER}`,
                    borderRadius: u(1),
                    overflow: "hidden",
                    zIndex: "30",
                    boxShadow: "0 0 0.1em 0 black",
                    boxSizing: "border-box"
                }}
            />
        ) as HTMLDivElement;

        const setMenuOpen = (open: boolean) => {
            menu.style.display = open ? "block" : "none";
            chevron.style.transform = open ? "rotate(180deg)" : "rotate(0deg)";
        };

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
                    border: `2px solid ${CORE_BORDER}`,
                    background: CORE_BASE,
                    color: CORE_TEXT,
                    fontWeight: "600",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease, background 0.15s ease"
                }}
                onClick={() => {
                    setMenuOpen(menu.style.display === "none");
                }}
                onMouseEnter={() => {
                    button.style.borderColor = CORE_HOVER_TEXT;
                    button.style.background = CORE_HOVER;
                }}
                onMouseLeave={() => {
                    button.style.borderColor = CORE_BORDER;
                    button.style.background = CORE_BASE;
                }}
            >
                {labelSpan}
                {chevron}
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
                            background: option.name === state.current ? CORE_HOVER : CORE_BASE,
                            border: "0",
                            color: CORE_TEXT,
                            fontWeight: "600",
                            textAlign: "left",
                            cursor: "pointer",
                            boxSizing: "border-box",
                            transition: "background 0.12s ease"
                        }}
                        onClick={() => {
                            state.current = option.name;
                            labelSpan.textContent = option.text;
                            setMenuOpen(false);
                            this.context.onChange?.(option.name);
                            rebuildMenu();
                        }}
                        onMouseEnter={() => {
                            if (option.name !== state.current) {
                                optionButton.style.background = CORE_HOVER;
                            }
                        }}
                        onMouseLeave={() => {
                            optionButton.style.background =
                                option.name === state.current ? CORE_HOVER : CORE_BASE;
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
                setMenuOpen(false);
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

interface InputElementOptions {
    value?: string;
    placeholder?: string;
    onInput?: (value: string) => void;
    onEnter?: (value: string) => void;
}

function createInputElement(options: InputElementOptions): HTMLInputElement {
    const u = (n: number) => `calc(${n} * var(--size-unit) * 1px)`;

    const placeholderClass = getDynamicClass({
        base: {},
        "::placeholder": {
            color: CORE_MUTED
        }
    });

    const input = (
        <input
            type="text"
            class={placeholderClass}
            placeholder={options.placeholder ?? "Enter value"}
            style={{
                flex: "1",
                width: "100%",
                minWidth: "0",
                margin: "0",
                padding: `${u(0.65)} ${u(1)}`,
                height: u(6.25),
                borderRadius: u(0.8),
                border: `2px solid ${CORE_BORDER}`,
                background: CORE_INSET,
                color: CORE_TEXT,
                caretColor: CORE_TEXT,
                fontWeight: "500",
                letterSpacing: "0.02em",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s ease, background 0.15s ease"
            }}
            onMouseEnter={() => {
                if (document.activeElement !== input) {
                    input.style.borderColor = CORE_HOVER_TEXT;
                }
            }}
            onMouseLeave={() => {
                if (document.activeElement !== input) {
                    input.style.borderColor = CORE_BORDER;
                }
            }}
            onFocus={() => {
                input.style.borderColor = CORE_TEXT;
                input.style.background = CORE_INSET_HOVER;
            }}
            onBlur={() => {
                input.style.borderColor = CORE_BORDER;
                input.style.background = CORE_INSET;
            }}
            onKeyDown={(event: KeyboardEvent) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    options.onEnter?.(input.value);
                }
            }}
        />
    ) as HTMLInputElement;

    input.value = options.value ?? "";

    input.addEventListener("input", () => {
        options.onInput?.(input.value);
    });

    return input;
}

interface InputShardContext extends ShardContext {
    value?: string;
    placeholder?: string;
    fontSize?: number | "auto";
    onChange?: (value: string) => void;
}

class InputShard extends Shard<InputShardContext> {
    protected render(): Record<"base", HTMLElement | SVGElement> {
        const input = createInputElement({
            value: this.context.value,
            placeholder: this.context.placeholder,
            onInput: (value) => {
                this.context.onChange?.(value);
            }
        });

        return {
            base: input
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

export function createInput(context: InputShardContext) {
    const shard = new InputShard(context);
    return shard.mount() as HTMLInputElement;
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
                    gap: u(0.6),
                    flex: "1",
                    minHeight: "0",
                    paddingRight: u(0.3),
                    overflowY: "auto",
                    overflowX: "hidden",
                    scrollbarWidth: "thin",
                    scrollbarColor: `${CORE_BORDER} ${CORE_BASE}`
                }}
            />
        ) as HTMLDivElement;

        const input = createInputElement({
            placeholder: this.context.placeholder,
            onInput: () => {
                syncAddState();
            },
            onEnter: () => {
                addValue();
            }
        });

        const addButton = (
            <button
                type="button"
                style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: u(0.5),
                    margin: "0",
                    padding: `${u(0.55)} ${u(1.4)}`,
                    height: u(6.25),
                    borderRadius: u(0.8),
                    border: `2px solid ${CORE_BORDER}`,
                    background: CORE_INSET,
                    color: CORE_MUTED,
                    fontWeight: "700",
                    cursor: "default",
                    whiteSpace: "nowrap",
                    boxSizing: "border-box",
                    transition: "border-color 0.15s ease, background 0.15s ease, color 0.15s ease"
                }}
                onClick={() => {
                    addValue();
                }}
                onMouseEnter={() => {
                    if (!input.value.trim()) {
                        return;
                    }
                    addButton.style.background = CORE_HOVER_TEXT;
                    addButton.style.borderColor = CORE_HOVER_TEXT;
                }}
                onMouseLeave={() => {
                    syncAddState();
                }}
            >
                <span>+</span>
                <span>Add</span>
            </button>
        ) as HTMLButtonElement;

        const emptyState = (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: "1",
                    minHeight: u(6),
                    padding: u(1),
                    borderRadius: u(0.8),
                    border: `2px dashed ${CORE_BORDER}`,
                    color: CORE_MUTED,
                    fontWeight: "500",
                    letterSpacing: "0.04em",
                    boxSizing: "border-box"
                }}
            >
                No items yet
            </div>
        ) as HTMLDivElement;

        const emitChange = () => {
            this.context.onChange?.([...values]);
        };

        const syncAddState = () => {
            const hasValue = input.value.trim().length > 0;
            addButton.style.background = hasValue ? CORE_ITEM : CORE_INSET;
            addButton.style.borderColor = hasValue ? CORE_ITEM : CORE_BORDER;
            addButton.style.color = hasValue ? CORE_DARK : CORE_MUTED;
            addButton.style.cursor = hasValue ? "pointer" : "default";
        };

        const renderList = () => {
            if (values.length === 0) {
                listContainer.replaceChildren(emptyState);
                return;
            }

            const rows = values.map((value, index) => {
                const removeIcon = createElement(X) as unknown as SVGElement;
                removeIcon.setAttribute("stroke-width", "3");
                removeIcon.style.width = u(2);
                removeIcon.style.height = u(2);
                removeIcon.style.pointerEvents = "none";

                const removeButton = (
                    <button
                        type="button"
                        title="Remove"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: u(3.6),
                            height: u(3.6),
                            margin: "0",
                            padding: "0",
                            borderRadius: u(0.6),
                            border: `2px solid ${CORE_BORDER}`,
                            background: CORE_BASE,
                            color: CORE_TEXT,
                            cursor: "pointer",
                            flexShrink: "0",
                            boxSizing: "border-box",
                            transition: "background 0.12s ease, border-color 0.12s ease, color 0.12s ease"
                        }}
                        onClick={() => {
                            values.splice(index, 1);
                            emitChange();
                            renderList();
                        }}
                        onMouseEnter={() => {
                            removeButton.style.background = CORE_ITEM;
                            removeButton.style.borderColor = CORE_ITEM;
                            removeButton.style.color = CORE_DARK;
                        }}
                        onMouseLeave={() => {
                            removeButton.style.background = CORE_BASE;
                            removeButton.style.borderColor = CORE_BORDER;
                            removeButton.style.color = CORE_TEXT;
                        }}
                    >
                        {removeIcon}
                    </button>
                ) as HTMLButtonElement;

                const row = (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: u(0.8),
                            padding: `${u(0.6)} ${u(0.8)} ${u(0.6)} ${u(1.1)}`,
                            borderRadius: u(0.8),
                            border: `2px solid ${CORE_BORDER}`,
                            background: CORE_INSET,
                            boxSizing: "border-box",
                            transition: "background 0.12s ease"
                        }}
                        onMouseEnter={() => {
                            row.style.background = CORE_INSET_HOVER;
                        }}
                        onMouseLeave={() => {
                            row.style.background = CORE_INSET;
                        }}
                    >
                        <span
                            style={{
                                flex: "1",
                                color: CORE_TEXT,
                                fontWeight: "500",
                                overflowWrap: "anywhere",
                                minWidth: "0"
                            }}
                        >
                            {value}
                        </span>
                        {removeButton}
                    </div>
                ) as HTMLDivElement;

                return row;
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
            syncAddState();
            emitChange();
            renderList();
            listContainer.scrollTop = listContainer.scrollHeight;
        };

        const wrapper = (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: u(1),
                    width: "100%",
                    height: "100%",
                    margin: "0",
                    padding: u(1.2),
                    borderRadius: u(1.2),
                    border: `2px solid ${CORE_BORDER}`,
                    background: CORE_BASE,
                    color: CORE_TEXT,
                    boxSizing: "border-box",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: u(0.75),
                        paddingBottom: u(0.8),
                        borderBottom: `2px solid ${CORE_BORDER}`,
                        flexShrink: "0"
                    }}
                >
                    <strong
                        style={{
                            color: CORE_TITLE,
                            letterSpacing: "0.04em",
                            fontWeight: "700",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap"
                        }}
                    >
                        {this.context.title ?? "List"}
                    </strong>
                </div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: u(0.7),
                        flexShrink: "0"
                    }}
                >
                    {input}
                    {addButton}
                </div>
                {listContainer}
            </div>
        ) as HTMLDivElement;

        syncAddState();
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
    return shard.mount() as HTMLDivElement;
}