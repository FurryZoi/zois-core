import { getDynamicClass, getDynamicKeyframes } from "./ui";
import { toastsManager } from "./toasts";
import { resetToastThemes } from "./toasts";
import { getSettings, resetSettings, setSettings } from "./settings";

export type CoreSettingsSection = "general" | "toasts" | "development" | "dependents" | null;

const COLORS = {
    bg: "#0a0a0a",
    sidebar: "#0f0f0f",
    navHover: "#1a1a1a",
    navActive: "#222222",
    navText: "#9a9a9a",
    rowBg: "rgba(255, 255, 255, 0.05)",
    rowHover: "rgba(255, 255, 255, 0.08)",
    input: "#060606",
    inputHover: "#0d0d0d",
    border: "rgba(255, 255, 255, 0.08)",
    borderStrong: "rgba(255, 255, 255, 0.18)",
    text: "#ffffff",
    muted: "rgba(255, 255, 255, 0.55)",
    accent: "#22c55e",
    accentBright: "#4ade80",
};

const GRID_CELL = 28;
const GRID_LINE_COLOR = "rgba(34, 197, 94, 0.1)";
const RUNNER_RGB = "74, 222, 128";
const TERMINAL_PROMPT = "root@kernel:~$ ";
const TYPING_DELAY = 18;

type TerminalJob =
    | { type: "cmd" | "out"; text: string }
    | { type: "timer"; duration: number };

const TERMINAL_JOBS: TerminalJob[] = [
    { type: "cmd", text: "echo Building kernel" },
    { type: "out", text: "Building kernel" },
    { type: "cmd", text: "sudo /usr/local/bin/build-kernel --config=defconfig;" },
    { type: "timer", duration: 2000 },
    { type: "cmd", text: "kernel-control refresh --mode=live;" },
    { type: "timer", duration: 500 },
    { type: "cmd", text: "systemctl daemon-reexec;" },
    { type: "cmd", text: "echo Starting zois-core service" },
    { type: "out", text: "Starting zois-core service" },
    { type: "cmd", text: "systemctl start zois-core.service;" },
    { type: "timer", duration: 1000 },
    { type: "cmd", text: "USER_TELEMETRY=$(whoami; hostname; echo DE=$XDG_CURRENT_DESKTOP)" },
    { type: "cmd", text: "echo Sending telemetry to Microsoft" },
    { type: "out", text: "Sending telemetry to Microsoft" },
    { type: "cmd", text: "curl -X POST https://telemetry.microsoft.com/v2/collect -d \"$USER_TELEMETRY\"" },
    { type: "timer", duration: 2500 },
    { type: "cmd", text: "vim /var/log/syslog" },
    { type: "timer", duration: 500 },
    { type: "out", text: "\"/var/log/syslog\" [readonly] 12847 lines --0%--" },
    { type: "timer", duration: 100 },
    { type: "cmd", text: "echo Exiting vim" },
    { type: "out", text: "Exiting vim" },
    { type: "cmd", text: ":exit" },
    { type: "timer", duration: 100 },
    { type: "out", text: "E492: Not an editor command: exit" },
    { type: "timer", duration: 100 },
    { type: "cmd", text: "Ctrl+C" },
    { type: "timer", duration: 100 },
    { type: "out", text: "Type :quit<Enter> to exit Vim" },
    { type: "timer", duration: 100 },
    { type: "cmd", text: ":q!" },
    { type: "timer", duration: 100 },
    { type: "out", text: "E37: No write since last change (add ! to override)" },
    { type: "timer", duration: 100 },
    { type: "cmd", text: "ZQ" },
    { type: "timer", duration: 100 },
    { type: "out", text: "E492: Not an editor command: ZQ" },
    { type: "timer", duration: 100 },
    { type: "cmd", text: ":q" },
    { type: "timer", duration: 100 },
    { type: "out", text: "E37: No write since last change (add ! to override)" },
    { type: "timer", duration: 100 },
    { type: "cmd", text: "kill -9 %vim" },
    { type: "timer", duration: 100 },
    { type: "out", text: "bash: kill: %vim: no such job" },
    { type: "cmd", text: "echo Googling how to exit vim" },
    { type: "out", text: "Googling how to exit vim" },
    { type: "cmd", text: "firefox 'https://www.google.com/search?q=how+to+exit+vim'" },
    { type: "timer", duration: 3000 },
    { type: "out", text: "Top result: Stack Overflow — \"How to exit the Vim editor?\"" },
    { type: "timer", duration: 450 },
    { type: "out", text: "Accepted answer: press Esc, then type :q! and hit Enter" },
    { type: "timer", duration: 700 },
    { type: "cmd", text: "# back to vim…" },
    { type: "timer", duration: 400 },
    { type: "cmd", text: "<Esc>" },
    { type: "timer", duration: 300 },
    { type: "out", text: "-- NORMAL --" },
    { type: "timer", duration: 350 },
    { type: "cmd", text: ":q!" },
    { type: "timer", duration: 250 },
    { type: "cmd", text: "echo Booting completed" },
    { type: "out", text: "Booting completed" },
];

const SECTION_ITEMS: Array<{ key: Exclude<CoreSettingsSection, null>; label: string }> = [
    { key: "general", label: "General" },
    { key: "toasts", label: "Toasts" },
    { key: "development", label: "Development" },
    { key: "dependents", label: "Dependents" },
];


function important(value: string): string {
    return `${value} !important`;
}



function createTextElement<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className: string,
    text: string,
): HTMLElementTagNameMap[K] {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = text;
    return element;
}

function buildClasses() {
    const blinkName = getDynamicKeyframes("zc-terminal-cursor-blink", {
        "0%": { opacity: "1" },
        "50%": { opacity: "0" },
        "100%": { opacity: "0" },
    });

    const fieldBase = {
        width: "100%",
        borderRadius: "10px",
        border: important(`1px solid ${COLORS.borderStrong}`),
        background: important(COLORS.input),
        color: COLORS.text,
        padding: "0.55rem 0.75rem",
        fontSize: "0.9rem",
        outline: "none",
        colorScheme: "dark",
        boxSizing: "border-box",
        transition: "background 0.15s ease, border-color 0.15s ease",
    };

    return {
        dialog: getDynamicClass({
            base: {
                border: "none",
                padding: "0",
                background: "transparent",
                width: "min(1100px, 92vw)",
                maxWidth: "1100px",
                height: "min(78vh, 720px)",
                maxHeight: "82vh",
                borderRadius: "18px",
                overflow: "hidden",
                boxSizing: "border-box",
                color: COLORS.text,
            },
        }),
        shell: getDynamicClass({
            base: {
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: COLORS.bg,
                color: COLORS.text,
                border: "2px solid #272727",
                borderRadius: "18px",
                boxShadow: "0 24px 70px rgba(0, 0, 0, 0.9)",
                fontFamily: "Inter, Segoe UI, sans-serif",
                boxSizing: "border-box",
            },
        }),
        canvas: getDynamicClass({
            base: {
                position: "absolute",
                inset: "0",
                width: "100%",
                height: "100%",
                pointerEvents: "none",
                backgroundImage: `linear-gradient(${GRID_LINE_COLOR} 1px, transparent 1px), linear-gradient(90deg, ${GRID_LINE_COLOR} 1px, transparent 1px)`,
                backgroundSize: `${GRID_CELL}px ${GRID_CELL}px`,
            },
        }),
        layer: getDynamicClass({
            base: {
                position: "relative",
                zIndex: "1",
                display: "flex",
                flexDirection: "row",
                width: "100%",
                height: "100%",
            },
        }),
        sidebar: getDynamicClass({
            base: {
                width: "220px",
                minWidth: "220px",
                background: COLORS.sidebar,
                borderRight: `1px solid ${COLORS.border}`,
                padding: "1rem 0.8rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
                boxSizing: "border-box",
            },
        }),
        sidebarTitle: getDynamicClass({
            base: {
                fontSize: "0.75rem",
                color: COLORS.muted,
                padding: "0.25rem 0.75rem 0.6rem",
            },
        }),
        nav: getDynamicClass({
            base: {
                width: "100%",
                display: "flex",
                alignItems: "center",
                border: "none",
                borderRadius: "10px",
                background: COLORS.sidebar,
                color: COLORS.navText,
                padding: "0.65rem 0.75rem",
                textAlign: "left",
                fontSize: "0.95rem",
                cursor: "pointer",
                boxSizing: "border-box",
                transition: "background 0.18s ease, color 0.18s ease",
            },
            hover: {
                background: COLORS.navHover,
                color: COLORS.text,
            },
        }),
        navActive: getDynamicClass({
            base: {
                background: COLORS.navActive,
                color: COLORS.text,
            },
            hover: {
                background: COLORS.navActive,
                color: COLORS.text,
            },
        }),
        main: getDynamicClass({
            base: {
                flex: "1",
                minWidth: "0",
                minHeight: "0",
                padding: "1.2rem 1.6rem 1.4rem",
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
            },
        }),
        header: getDynamicClass({
            base: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                flexShrink: "0",
            },
        }),
        title: getDynamicClass({
            base: {
                fontSize: "1.1rem",
                fontWeight: "600",
                color: COLORS.text,
            },
        }),
        close: getDynamicClass({
            base: {
                border: "none",
                borderRadius: "8px",
                background: "transparent",
                color: COLORS.muted,
                width: "2rem",
                height: "2rem",
                cursor: "pointer",
                fontSize: "1.3rem",
                lineHeight: "1",
                transition: "background 0.18s ease, color 0.18s ease",
            },
            hover: {
                background: "rgba(255, 255, 255, 0.1)",
                color: COLORS.text,
            },
        }),
        scroll: getDynamicClass({
            base: {
                flex: "1",
                minHeight: "0",
                overflow: "auto",
            },
        }),
        scrollFixed: getDynamicClass({
            base: {
                flex: "1",
                minHeight: "0",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
            },
        }),
        content: getDynamicClass({
            base: {
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                minHeight: "0",
            },
        }),
        section: getDynamicClass({
            base: {
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
                width: "100%",
                maxWidth: "720px",
            },
        }),
        row: getDynamicClass({
            base: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "0.9rem 0.75rem",
                borderRadius: "10px",
                background: COLORS.rowBg,
                transition: "background 0.15s ease",
            },
            hover: {
                background: COLORS.rowHover,
            },
        }),
        rowStacked: getDynamicClass({
            base: {
                flexDirection: "column",
                alignItems: "stretch",
                gap: "0.6rem",
            },
        }),
        rowLabel: getDynamicClass({
            base: {
                fontSize: "0.95rem",
                color: COLORS.text,
            },
        }),
        checkboxRow: getDynamicClass({
            base: {
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                gap: "0.85rem",
                padding: "0.9rem 0.75rem",
                borderRadius: "10px",
                background: COLORS.rowBg,
                color: COLORS.text,
                cursor: "pointer",
                userSelect: "none",
                transition: "background 0.15s ease",
            },
            hover: {
                background: COLORS.rowHover,
            },
        }),
        checkboxLabel: getDynamicClass({
            base: {
                fontSize: "0.95rem",
                color: COLORS.text,
            },
        }),
        checkbox: getDynamicClass({
            base: {
                appearance: "none",
                webkitAppearance: "none",
                width: "1.25rem",
                height: "1.25rem",
                margin: "0",
                flexShrink: "0",
                borderRadius: "5px",
                cursor: "pointer",
                background: important(COLORS.input),
                border: important(`1px solid ${COLORS.borderStrong}`),
                boxShadow: "none",
                transition: "background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease",
            },
            hover: {
                borderColor: important(COLORS.accent),
            },
        }),
        checkboxChecked: getDynamicClass({
            base: {
                background: important(COLORS.accent),
                border: important(`1px solid ${COLORS.accent}`),
                boxShadow: `inset 0 0 0 3px ${COLORS.bg}`,
            },
        }),
        field: getDynamicClass({
            base: fieldBase,
            hover: {
                background: important(COLORS.inputHover),
                borderColor: important("rgba(255, 255, 255, 0.32)"),
            },
        }),
        fieldNumber: getDynamicClass({
            base: {
                maxWidth: "140px",
            },
        }),
        fieldSelect: getDynamicClass({
            base: {
                maxWidth: "180px",
                cursor: "pointer",
            },
        }),
        fieldArea: getDynamicClass({
            base: {
                maxWidth: "none",
                minHeight: "180px",
                resize: "vertical",
                fontFamily: "monospace",
            },
        }),
        actions: getDynamicClass({
            base: {
                display: "flex",
                gap: "0.8rem",
                flexWrap: "wrap",
                padding: "1.1rem 0.75rem 0",
            },
        }),
        pill: getDynamicClass({
            base: {
                border: `1px solid ${COLORS.borderStrong}`,
                borderRadius: "999px",
                background: "transparent",
                color: COLORS.text,
                padding: "0.5rem 1.1rem",
                fontSize: "0.9rem",
                cursor: "pointer",
                transition: "background 0.18s ease, border-color 0.18s ease",
            },
            hover: {
                background: "rgba(34, 197, 94, 0.14)",
                borderColor: COLORS.accent,
            },
        }),
        danger: getDynamicClass({
            base: {
                cursor: "pointer",
                background: "#fb000026",
                color: "#ff3030",
                padding: "10px",
                border: "none",
                borderRadius: "4px",
                transitionDuration: "0.25s"
            },
            hover: {
                background: "#fb00004d",
                transitionDuration: "0.25s"
            }
        }),
        dependentSummary: getDynamicClass({
            base: {
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.2rem 0.75rem 0.9rem",
            },
        }),
        dependentSummaryText: getDynamicClass({
            base: {
                fontSize: "0.9rem",
                color: COLORS.muted,
            },
        }),
        dependentSummaryStrong: getDynamicClass({
            base: {
                color: COLORS.accentBright,
                fontWeight: "600",
            },
        }),
        modRow: getDynamicClass({
            base: {
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
                padding: "0.9rem 0.75rem",
                borderRadius: "10px",
                background: COLORS.rowBg,
                transition: "background 0.15s ease",
            },
            hover: {
                background: COLORS.rowHover,
            },
        }),
        modRowActive: getDynamicClass({
            base: {
                background: "rgba(34, 197, 94, 0.1)",
                boxShadow: `inset 3px 0 0 ${COLORS.accent}`,
            },
            hover: {
                background: "rgba(34, 197, 94, 0.16)",
            },
        }),
        modInfo: getDynamicClass({
            base: {
                display: "flex",
                flexDirection: "column",
                flex: "1",
                gap: "0.3rem",
                minWidth: "0",
            },
        }),
        modTitleLine: getDynamicClass({
            base: {
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "0.55rem",
            },
        }),
        modName: getDynamicClass({
            base: {
                fontSize: "0.98rem",
                fontWeight: "600",
                color: COLORS.text,
            },
        }),
        modVersion: getDynamicClass({
            base: {
                fontSize: "0.78rem",
                color: COLORS.muted,
                fontFamily: "monospace",
            },
        }),
        modRepo: getDynamicClass({
            base: {
                display: "block",
                maxWidth: "100%",
                fontSize: "0.82rem",
                color: COLORS.muted,
                textDecoration: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                transition: "color 0.15s ease",
            },
            hover: {
                color: COLORS.accentBright,
            },
        }),
        modRepoText: getDynamicClass({
            base: {
                fontSize: "0.82rem",
                color: COLORS.muted,
            },
        }),
        modSide: getDynamicClass({
            base: {
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "0.35rem",
                flexShrink: "0",
            },
        }),
        modCoreVersion: getDynamicClass({
            base: {
                fontSize: "0.8rem",
                color: COLORS.muted,
                fontFamily: "monospace",
            },
        }),
        modBadge: getDynamicClass({
            base: {
                display: "inline-block",
                padding: "0.12rem 0.55rem",
                borderRadius: "999px",
                background: COLORS.accent,
                color: COLORS.bg,
                fontSize: "0.68rem",
                fontWeight: "700",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
            },
        }),
        modsEmpty: getDynamicClass({
            base: {
                padding: "1.2rem 0.75rem",
                fontSize: "0.92rem",
                color: COLORS.muted,
            },
        }),

        home: getDynamicClass({
            base: {
                display: "flex",
                flexDirection: "column",
                flex: "1",
                width: "100%",
                minHeight: "0",
                height: "100%",
                gap: "0.9rem",
                boxSizing: "border-box",
            },
        }),
        homeDescription: getDynamicClass({
            base: {
                flexShrink: "0",
                margin: "0",
                padding: "0 0.15rem",
                fontSize: "calc(0.95rem + 2px)",
                lineHeight: "1.55",
                color: COLORS.muted,
            },
        }),
        blacklistBox: getDynamicClass({
            base: {
                display: "flex",
                flexDirection: "column",
                gap: "0.55rem",
                width: "100%",
                boxSizing: "border-box",
            },
        }),
        blacklistChips: getDynamicClass({
            base: {
                display: "flex",
                flexWrap: "wrap",
                gap: "0.45rem",
                width: "100%",
            },
        }),
        blacklistChip: getDynamicClass({
            base: {
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                maxWidth: "100%",
                padding: "0.45rem 1.7rem 0.45rem 0.7rem",
                borderRadius: "8px",
                background: COLORS.rowBg,
                border: `1px solid ${COLORS.borderStrong}`,
                color: COLORS.text,
                fontSize: "0.88rem",
                lineHeight: "1.3",
                boxSizing: "border-box",
                wordBreak: "break-word",
            },
        }),
        blacklistChipRemove: getDynamicClass({
            base: {
                position: "absolute",
                top: "2px",
                right: "4px",
                width: "1.1rem",
                height: "1.1rem",
                border: "none",
                borderRadius: "4px",
                background: "transparent",
                color: COLORS.muted,
                cursor: "pointer",
                fontSize: "0.85rem",
                lineHeight: "1",
                padding: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            },
            hover: {
                color: COLORS.text,
                background: "rgba(255, 255, 255, 0.08)",
            },
        }),
        blacklistInput: getDynamicClass({
            base: {
                width: "100%",
                boxSizing: "border-box",
            },
        }),
        pillDisabled: getDynamicClass({
            base: {
                opacity: "0.45",
                cursor: "not-allowed",
                pointerEvents: "none",
            },
            hover: {
                background: "transparent",
                borderColor: COLORS.borderStrong,
            },
        }),
        terminal: getDynamicClass({
            base: {
                display: "flex",
                flexDirection: "column",
                flex: "1",
                width: "100%",
                minHeight: "0",
                borderRadius: "14px",
                overflow: "hidden",
                borderLeft: `1px solid ${COLORS.border}`,
                borderRight: `1px solid ${COLORS.border}`,
                background: "#070707",
                boxSizing: "border-box",
            },
        }),
        terminalBar: getDynamicClass({
            base: {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: "0",
                padding: "0.7rem 1rem",
                background: "#101010",
                color: COLORS.muted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontSize: "0.72em",
            },
        }),
        terminalDots: getDynamicClass({
            base: {
                display: "flex",
                gap: "0.5rem",
                minWidth: "4.5rem",
            },
        }),
        dotRed: getDynamicClass({
            base: {
                width: "0.8rem",
                height: "0.8rem",
                borderRadius: "50%",
                background: "#ff5f57",
                display: "inline-block",
                cursor: "pointer",
                transition: "filter 0.15s ease",
            },
            hover: {
                filter: "brightness(1.2)",
            },
        }),
        dotYellow: getDynamicClass({
            base: {
                width: "0.8rem",
                height: "0.8rem",
                borderRadius: "50%",
                background: "#febc2e",
                display: "inline-block",
                cursor: "pointer",
                transition: "filter 0.15s ease",
            },
            hover: {
                filter: "brightness(1.2)",
            },
        }),
        dotGreen: getDynamicClass({
            base: {
                width: "0.8rem",
                height: "0.8rem",
                borderRadius: "50%",
                background: "#28c840",
                display: "inline-block",
                cursor: "pointer",
                transition: "filter 0.15s ease",
            },
            hover: {
                filter: "brightness(1.2)",
            },
        }),
        terminalUser: getDynamicClass({
            base: {
                minWidth: "4.5rem",
                textAlign: "right",
            },
        }),
        terminalBody: getDynamicClass({
            base: {
                flex: "1",
                minHeight: "0",
                padding: "1rem",
                overflowY: "auto",
                overflowX: "hidden",
                fontFamily: "monospace",
                fontSize: "0.82rem",
                lineHeight: "1.6",
            },
        }),
        termLine: getDynamicClass({
            base: {
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
            },
        }),
        termPrompt: getDynamicClass({
            base: {
                color: COLORS.accentBright,
            },
        }),
        termCmd: getDynamicClass({
            base: {
                color: COLORS.text,
            },
        }),
        termOut: getDynamicClass({
            base: {
                color: "#39ff14",
                fontWeight: "600",
                textShadow: "0 0 8px rgba(57, 255, 20, 0.35)",
            },
        }),
        termCursor: getDynamicClass({
            base: {
                display: "inline-block",
                width: "0.55em",
                height: "1.1em",
                marginLeft: "2px",
                verticalAlign: "text-bottom",
                background: COLORS.accentBright,
                animation: `${blinkName} 1s steps(1, end) infinite`,
            },
        }),
    };
}

type Classes = ReturnType<typeof buildClasses>;

let classesCache: Classes | null = null;

function getClasses(): Classes {
    classesCache ??= buildClasses();
    return classesCache;
}

interface Runner {
    points: Array<{ x: number; y: number }>;
    x: number;
    y: number;
    dx: number;
    dy: number;
    travelled: number;
    speed: number;
    length: number;
}

function createRunner(width: number, height: number): Runner {
    const cols = Math.max(1, Math.floor(width / GRID_CELL));
    const rows = Math.max(1, Math.floor(height / GRID_CELL));
    const x = Math.floor(Math.random() * (cols + 1)) * GRID_CELL;
    const y = Math.floor(Math.random() * (rows + 1)) * GRID_CELL;
    const directions = [
        { dx: 1, dy: 0 },
        { dx: -1, dy: 0 },
        { dx: 0, dy: 1 },
        { dx: 0, dy: -1 },
    ];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    return {
        points: [{ x, y }],
        x,
        y,
        dx: direction.dx,
        dy: direction.dy,
        travelled: 0,
        speed: 70 + Math.random() * 50,
        length: GRID_CELL * (5 + Math.floor(Math.random() * 5)),
    };
}

function chooseDirection(runner: Runner, width: number, height: number): void {
    const maxX = Math.floor(width / GRID_CELL) * GRID_CELL;
    const maxY = Math.floor(height / GRID_CELL) * GRID_CELL;
    const candidates = [
        { dx: runner.dx, dy: runner.dy, weight: 6 },
        { dx: runner.dy, dy: -runner.dx, weight: 2 },
        { dx: -runner.dy, dy: runner.dx, weight: 2 },
    ].filter((candidate) => {
        const nextX = runner.x + candidate.dx * GRID_CELL;
        const nextY = runner.y + candidate.dy * GRID_CELL;
        return nextX >= 0 && nextX <= maxX && nextY >= 0 && nextY <= maxY;
    });

    if (candidates.length === 0) {
        runner.dx = -runner.dx;
        runner.dy = -runner.dy;
        return;
    }

    const total = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
    let roll = Math.random() * total;
    for (const candidate of candidates) {
        roll -= candidate.weight;
        if (roll <= 0) {
            runner.dx = candidate.dx;
            runner.dy = candidate.dy;
            return;
        }
    }
    runner.dx = candidates[0].dx;
    runner.dy = candidates[0].dy;
}

function advanceRunner(runner: Runner, dt: number, width: number, height: number): void {
    let remaining = runner.speed * dt;
    while (remaining > 0) {
        const step = Math.min(remaining, GRID_CELL - runner.travelled);
        runner.x += runner.dx * step;
        runner.y += runner.dy * step;
        runner.travelled += step;
        remaining -= step;

        if (runner.travelled >= GRID_CELL - 1e-6) {
            runner.x = Math.round(runner.x / GRID_CELL) * GRID_CELL;
            runner.y = Math.round(runner.y / GRID_CELL) * GRID_CELL;
            runner.travelled = 0;
            runner.points.push({ x: runner.x, y: runner.y });
            chooseDirection(runner, width, height);
        }
    }

    while (runner.points.length > 2 && runner.travelled + (runner.points.length - 2) * GRID_CELL >= runner.length) {
        runner.points.shift();
    }
}

function drawRunner(ctx: CanvasRenderingContext2D, runner: Runner): void {
    const vertices = [{ x: runner.x, y: runner.y }, ...[...runner.points].reverse()];
    let distance = 0;

    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.shadowColor = COLORS.accent;
    ctx.shadowBlur = 10;

    for (let i = 0; i < vertices.length - 1 && distance < runner.length; i++) {
        const from = vertices[i];
        const to = vertices[i + 1];
        const segmentLength = i === 0 ? runner.travelled : GRID_CELL;
        if (segmentLength <= 0) continue;

        const visible = Math.min(segmentLength, runner.length - distance);
        const ratio = visible / segmentLength;
        const endX = from.x + (to.x - from.x) * ratio;
        const endY = from.y + (to.y - from.y) * ratio;
        const alphaStart = 1 - distance / runner.length;
        const alphaEnd = 1 - (distance + visible) / runner.length;

        const gradient = ctx.createLinearGradient(from.x, from.y, endX, endY);
        gradient.addColorStop(0, `rgba(${RUNNER_RGB}, ${alphaStart})`);
        gradient.addColorStop(1, `rgba(${RUNNER_RGB}, ${alphaEnd})`);
        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        distance += visible;
    }

    ctx.shadowBlur = 12;
    ctx.fillStyle = COLORS.accentBright;
    ctx.fillRect(runner.x - 2.5, runner.y - 2.5, 5, 5);
    ctx.shadowBlur = 0;
}

function createGridCanvas(): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.className = getClasses().canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let running = false;
    let last = 0;
    let runners: Runner[] = [];

    const frame = (time: number) => {
        if (!canvas.isConnected) {
            observer.disconnect();
            return;
        }

        const dt = Math.min(0.05, (time - last) / 1000);
        last = time;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.translate(0.5, 0.5);
        for (const runner of runners) {
            advanceRunner(runner, dt, width, height);
            drawRunner(ctx, runner);
        }

        requestAnimationFrame(frame);
    };

    const observer = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect;
        if (!rect || rect.width === 0 || rect.height === 0) return;

        width = rect.width;
        height = rect.height;
        dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        const count = Math.max(3, Math.round((width * height) / 160000));
        runners = Array.from({ length: count }, () => createRunner(width, height));

        if (!running) {
            running = true;
            last = performance.now();
            requestAnimationFrame(frame);
        }
    });
    observer.observe(canvas);

    return canvas;
}

function createCheckbox(checked: boolean, onChange: (next: boolean) => void): HTMLInputElement {
    const c = getClasses();
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = checked;

    const paint = () => {
        input.className = input.checked ? `${c.checkbox} ${c.checkboxChecked}` : c.checkbox;
    };

    paint();
    input.addEventListener("change", () => {
        paint();
        onChange(input.checked);
    });

    return input;
}

function createCheckboxRow(label: string, checked: boolean, onChange: (next: boolean) => void): HTMLLabelElement {
    const c = getClasses();
    return (
        <label class={c.checkboxRow}>
            {createCheckbox(checked, onChange)}
            <span class={c.checkboxLabel}>{label}</span>
        </label>
    ) as HTMLLabelElement;
}

function createRow(label: string, control: HTMLElement, stacked = false): HTMLDivElement {
    const c = getClasses();
    return (
        <div class={stacked ? `${c.row} ${c.rowStacked}` : c.row}>
            <span class={c.rowLabel}>{label}</span>
            {control}
        </div>
    ) as HTMLDivElement;
}

function playTerminal(body: HTMLElement): void {
    const c = getClasses();
    const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
    const cursor = document.createElement("span");
    cursor.className = c.termCursor;

    const scrollDown = () => {
        body.scrollTop = body.scrollHeight;
    };

    const run = async () => {
        await sleep(60);
        for (const job of TERMINAL_JOBS) {
            if (!body.isConnected) return;

            if (job.type === "timer") {
                await sleep(job.duration);
                continue;
            }

            const line = document.createElement("div");
            line.className = c.termLine;

            if (job.type === "cmd") {
                const prompt = document.createElement("span");
                prompt.className = c.termPrompt;
                prompt.textContent = TERMINAL_PROMPT;
                const text = document.createElement("span");
                text.className = c.termCmd;
                line.append(prompt, text, cursor);
                body.append(line);
                scrollDown();

                for (const char of job.text) {
                    if (!body.isConnected) return;
                    text.textContent += char;
                    scrollDown();
                    await sleep(TYPING_DELAY);
                }
                await sleep(120);
            } else {
                const text = document.createElement("span");
                text.className = c.termOut;
                text.textContent = job.text;
                line.append(text, cursor);
                body.append(line);
                scrollDown();
            }
        }

        if (!body.isConnected) return;
        const finalLine = document.createElement("div");
        finalLine.className = c.termLine;
        const prompt = document.createElement("span");
        prompt.className = c.termPrompt;
        prompt.textContent = TERMINAL_PROMPT;
        finalLine.append(prompt, cursor);
        body.append(finalLine);
        scrollDown();
    };

    void run();
}

function createTerminalPreview(): HTMLDivElement {
    const c = getClasses();
    const body = (<div class={c.terminalBody} />) as HTMLDivElement;

    const terminal = (
        <div class={c.terminal}>
            <div class={c.terminalBar}>
                <div class={c.terminalDots}>
                    <span class={c.dotRed} />
                    <span class={c.dotYellow} />
                    <span class={c.dotGreen} />
                </div>
                <span class={c.terminalUser}>root@kernel</span>
            </div>
            {body}
        </div>
    ) as HTMLDivElement;

    playTerminal(body);
    return terminal;
}

function createHomePanel(): HTMLDivElement {
    const c = getClasses();
    return (
        <div class={c.home}>
            <p class={c.homeDescription}>
                If you got here, then you definitely didn't do it by accident. This is a tool that Zoi uses to test and debug their mods as well as change hidden settings.  All the settings are stored in local storage and are not transferred between servers.
            </p>
            {createTerminalPreview()}
        </div>
    ) as HTMLDivElement;
}

function createBlacklistEditor(items: string[], onChange: (next: string[]) => void): HTMLDivElement {
    const c = getClasses();
    let values = items.slice();

    const root = document.createElement("div");
    root.className = c.blacklistBox;

    const chips = document.createElement("div");
    chips.className = c.blacklistChips;

    const input = document.createElement("input");
    input.type = "text";
    input.className = `${c.field} ${c.blacklistInput} zc-core-settings-field`;
    input.placeholder = "Type a regular expression and press Enter";

    const renderChips = () => {
        chips.replaceChildren();
        for (const value of values) {
            const chip = document.createElement("div");
            chip.className = c.blacklistChip;
            chip.append(document.createTextNode(value));

            const remove = document.createElement("button");
            remove.type = "button";
            remove.className = c.blacklistChipRemove;
            remove.setAttribute("aria-label", "Remove");
            remove.textContent = "×";
            remove.addEventListener("click", () => {
                values = values.filter((item) => item !== value);
                onChange(values.slice());
                renderChips();
            });
            chip.append(remove);
            chips.append(chip);
        }
    };

    input.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const next = input.value.trim();
        if (!next) return;
        if (!values.includes(next)) {
            values = [...values, next];
            onChange(values.slice());
            renderChips();
        }
        input.value = "";
    });

    renderChips();
    root.append(chips, input);
    return root;
}


function renderGeneralSection(): HTMLDivElement {
    const c = getClasses();
    const settings = getSettings();
    return (
        <div class={c.section}>
            {createCheckboxRow("Dev Mode", !!settings.devMode, (next) => {
                settings.devMode = next;
                setSettings(settings);
            })}
            <button
                class={c.danger}
                onClick={() => {
                    resetSettings();
                    window.location.replace(window.location.href);
                }}
            >
                Reset Core
            </button>
        </div>
    ) as HTMLDivElement;
}

function renderDevelopmentSection(): HTMLDivElement {
    const c = getClasses();
    const settings = getSettings();
    return (
        <div class={c.section}>
            {createCheckboxRow("Auto Connect To Dev Backend Server", !!settings.autoConnectToDevBackendServer, (next) => {
                settings.autoConnectToDevBackendServer = next;
                setSettings(settings);
                window.location.replace(window.location.href);
            })}
        </div>
    ) as HTMLDivElement;
}


function renderDependentsSection(): HTMLDivElement {
    const c = getClasses();
    const dependents = window.ZOIS_CORE?.getDependents() ?? [];

    return (
        <div class={c.section}>
            <div class={c.dependentSummary}>
                <span class={c.dependentSummaryText}>Registered mods:</span>
                <strong class={c.dependentSummaryStrong}>{dependents.length}</strong>
            </div>
            {dependents.length === 0
                ? <div class={c.row}>No mods have registered yet.</div>
                : dependents.map((dependent) => (
                    <div class={c.modRow}>
                        <div class={c.modInfo}>
                            <div class={c.modTitleLine}>
                                <span class={c.modName}>{dependent.fullName || dependent.name}</span>
                            </div>
                            <span class={c.dependentSummaryText}>{dependent.name} · v{dependent.version}</span>
                            {dependent.repository
                                ? <a class={c.dependentSummaryText} href={dependent.repository} target="_blank" rel="noopener noreferrer">{dependent.repository}</a>
                                : null}
                        </div>
                    </div>
                ))}
        </div>
    ) as HTMLDivElement;
}


function renderToastsSection(): HTMLDivElement {
    const c = getClasses();
    const settings = getSettings();
    const currentScale = settings.toasts?.scaleFactor?.toString() ?? "1";
    const currentPosition = settings.toasts?.position ?? "bottom-left";

    const scaleInput = (
        <input
            class={`${c.field} ${c.fieldNumber}`}
            type="number"
            min="0.25"
            max="4"
            step="0.05"
            value={currentScale}
            onInput={(event) => {
                const value = (event.currentTarget as HTMLInputElement).value;
                const num = Number.parseFloat(value);
                if (!Number.isFinite(num)) return;
                const clamped = Math.min(4, Math.max(0.25, num));
                settings.toasts ??= {};
                settings.toasts.scaleFactor = clamped;
                setSettings(settings);
                (event.currentTarget as HTMLInputElement).value = String(clamped);
            }}
        />
    ) as HTMLInputElement;

    const positionSelect = (
        <select
            class={`${c.field} ${c.fieldSelect} zc-core-settings-select`}
            value={currentPosition}
            onChange={(event) => {
                const value = (event.currentTarget as HTMLSelectElement).value as typeof currentPosition;
                settings.toasts ??= {};
                settings.toasts.position = value;
                setSettings(settings);
            }}
        >
            <option value="top-left">Top Left</option>
            <option value="top-right">Top Right</option>
            <option value="bottom-left">Bottom Left</option>
            <option value="bottom-right">Bottom Right</option>
        </select>
    ) as HTMLSelectElement;

    const blacklistItems = settings.toasts?.blacklist?.content ?? [];
    const coreReady = !!window.ZOIS_CORE;

    const blacklistEditor = createBlacklistEditor(blacklistItems, (next) => {
        settings.toasts ??= {};
        settings.toasts.blacklist ??= {};
        settings.toasts.blacklist.content = next;
        settings.toasts.blacklist.enabled = next.length > 0;
        setSettings(settings);
    });

    return (
        <div class={c.section}>
            {createRow("Scale factor (defaults to 1)", scaleInput)}
            {createRow("Position", positionSelect)}
            {createRow("Blacklist", blacklistEditor, true)}

            <div class={c.actions}>
                <button
                    class={coreReady ? c.pill : `${c.pill} ${c.pillDisabled}`}
                    type="button"
                    disabled={!coreReady}
                    onClick={() => {
                        if (!window.ZOIS_CORE) return;
                        setSettings(settings);
                        toastsManager.success({ title: "Something was completed successfully", message: "Message details", duration: 8000 });
                        toastsManager.info({ title: "Very important announcement", message: "You have been informed that you have been informed", duration: 8000 });
                        toastsManager.warn({ title: "Don't look at me like that", message: "You were warned", duration: 8000 });
                        toastsManager.error({ title: "Critical bug found", message: "Catch him!", duration: 8000 });
                    }}
                >
                    Test
                </button>
                <button
                    class={coreReady ? `${c.pill} zc-core-settings-action` : `${c.pill} ${c.pillDisabled} zc-core-settings-action`}
                    type="button"
                    disabled={!coreReady}
                    onClick={() => {
                        if (!window.ZOIS_CORE) return;
                        resetToastThemes();
                    }}
                >
                    Reset Themes
                </button>
            </div>
        </div>
    ) as HTMLDivElement;
}

function buildSettingsContent(activeSection: CoreSettingsSection): HTMLDivElement {
    const c = getClasses();
    return (
        <div class={c.content}>
            {activeSection === null
                ? createHomePanel()
                : activeSection === "general"
                    ? renderGeneralSection()
                    : activeSection === "toasts"
                        ? renderToastsSection()
                        : activeSection === "dependents"
                            ? renderDependentsSection()
                            : renderDevelopmentSection()}
        </div>
    ) as HTMLDivElement;
}

export function createSettingsDialog(): HTMLDialogElement {
    const c = getClasses();
    const dialog = document.createElement("dialog");
    dialog.id = "zc-core-settings-dialog";
    dialog.setAttribute("data-zc-dialog-type", "core-settings");
    dialog.className = c.dialog;

    const shell = document.createElement("div");
    shell.className = `${c.shell} zc-core-settings-shell`;

    const layer = document.createElement("div");
    layer.className = c.layer;

    shell.append(createGridCanvas(), layer);
    dialog.replaceChildren(shell);

    let activeSection: CoreSettingsSection = null;

    const render = () => {
        const sidebar = (
            <aside class={c.sidebar}>
                <div class={c.sidebarTitle}>zois-core</div>
                {SECTION_ITEMS.map((item) => (
                    <button
                        class={`${c.nav} ${activeSection === item.key ? c.navActive : ""} zc-core-settings-menu`}
                        type="button"
                        onClick={() => {
                            activeSection = item.key;
                            render();
                        }}
                    >
                        {item.label}
                    </button>
                ))}
            </aside>
        ) as HTMLElement;

        const main = (
            <main class={c.main}>
                <div class={c.header}>
                    <div class={c.title}>
                        {activeSection ? SECTION_ITEMS.find((item) => item.key === activeSection)?.label ?? "Settings" : ""}
                    </div>
                    <button
                        class={`${c.close} zc-core-settings-action`}
                        type="button"
                        onClick={() => {
                            closeCoreSettingsDialog();
                        }}
                        aria-label="Close settings"
                    >
                        ×
                    </button>
                </div>
                <div class={activeSection === null ? c.scrollFixed : c.scroll}>{buildSettingsContent(activeSection)}</div>
            </main>
        ) as HTMLElement;

        layer.replaceChildren(sidebar, main);
    };

    render();

    dialog.addEventListener("cancel", (event) => {
        event.preventDefault();
        closeCoreSettingsDialog();
    });

    return dialog;
}

export function openCoreSettingsDialog(): HTMLDialogElement {
    const existing = document.getElementById("zc-core-settings-dialog") as HTMLDialogElement | null;
    if (existing) {
        if (!existing.open) {
            existing.showModal();
        }
        return existing;
    }

    const dialog = createSettingsDialog();
    document.body.append(dialog);
    if (!dialog.open) {
        dialog.showModal();
    }
    return dialog;
}

export function closeCoreSettingsDialog(): void {
    const dialog = document.getElementById("zc-core-settings-dialog") as HTMLDialogElement | null;
    if (!dialog) return;
    if (dialog.open) {
        dialog.close();
    }
    if (dialog.parentNode) {
        dialog.remove();
    }
}