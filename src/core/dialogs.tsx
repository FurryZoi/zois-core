import clsx from "clsx";
import { BaseProps } from "tsx-dom";
import { getDynamicClass } from "../ui";

interface DialogProps extends BaseProps {
    wide?: boolean
}

export function Dialog(props: DialogProps) {
    const dialogClassName = getDynamicClass({
        base: {
            border: "1px solid var(--tmd-accent, black)",
            borderRadius: "4px",
            background: "var(--tmd-main, white)",
            fontFamily: CommonGetFontName(),
            fontSize: "clamp(14px, min(1vw, 1.8vh), 30px)",
            margin: "auto",
            position: "absolute",
            top: "0",
            left: "0",
            bottom: "0",
            right: "0",
            padding: "0",
            minWidth: "200px",
            maxWidth: props.wide ? "clamp(360px, 42vw, 1200px)" : "clamp(320px, 32vw, 900px)",
            width: "90%",
            height: props.wide ? "90%" : "fit-content",
            maxHeight: props.wide ? "85vh" : "none",
            boxSizing: "border-box",
            zIndex: "100",
            pointerEvents: "all",
            overflow: "hidden"
        },
        "::backdrop": {
            background: "rgba(0, 0, 0, 0.5)"
        }
    });

    const contentClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: "0.8em",
            padding: "1em 1.2em",
            boxSizing: "border-box",
            height: props.wide ? "100%" : "auto",
            minHeight: "0",
            overflow: "hidden",
            position: "relative"
        }
    });

    return (
        <dialog class={dialogClassName}>
            <div class={contentClassName}>
                {props.children && props.children}
            </div>
        </dialog>
    );
}

type DialogButtonProps = BaseProps & JSX.IntrinsicElements["button"];

export function DialogButton(props: DialogButtonProps) {
    const { children, class: _class, ...attrs } = props;
    const buttonClassName = getDynamicClass({
        base: {
            cursor: "pointer",
            border: "1px solid var(--tmd-accent, black)",
            borderRadius: "4px",
            background: "var(--tmd-element, white)",
            color: "var(--tmd-text, black)",
            fontFamily: "inherit",
            fontSize: "1.45em",
            padding: "0.25em 0.4em"
        },
        hover: {
            borderColor: "var(--tmd-accent, black)",
            background: "var(--tmd-element-hover, #eee)",
        }
    });

    return (
        <button {...attrs} class={clsx(buttonClassName, _class)}>
            {props.children && props.children}
        </button>
    );
}

export function DialogButtons(props: BaseProps) {
    const { children } = props;
    const buttonsClassName = getDynamicClass({
        base: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5em",
            flexShrink: "0"
        }
    });

    return (
        <div class={buttonsClassName}>
            {children && children}
        </div>
    );
}

type DialogTextProps = BaseProps & JSX.IntrinsicElements["p"];

export function DialogText(props: DialogTextProps) {
    const { children, class: _class, ...attrs } = props;
    const textClassName = getDynamicClass({
        base: {
            color: "var(--tmd-text, black)",
            fontSize: "1.25em",
            margin: "0",
            flexShrink: "0"
        }
    });
    return (
        <p {...attrs} class={clsx(textClassName, _class)}>
            {props.children && props.children}
        </p>
    );
}

interface DialogInputProps extends BaseProps {
    placeholder?: string
}

export function DialogInput(props: DialogInputProps) {
    const inputClassName = getDynamicClass({
        base: {
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid var(--tmd-accent, black)",
            borderRadius: "4px",
            outline: "none",
            background: "var(--tmd-element, white)",
            color: "var(--tmd-text, black)",
            fontFamily: "inherit",
            fontSize: "1.1em",
            padding: "0.4em 0.5em",
            flexShrink: "0"
        },
        focus: {
            outline: "2px solid var(--tmd-accent, black)",
        }
    });

    return (
        <input class={inputClassName} placeholder={props.placeholder} />
    );
}

export function DialogSelect(props: BaseProps) {
    const selectClassName = getDynamicClass({
        base: {
            cursor: "pointer",
            width: "100%",
            boxSizing: "border-box",
            border: "1px solid var(--tmd-accent, black)",
            borderRadius: "4px",
            outline: "none",
            background: "var(--tmd-element, white)",
            color: "var(--tmd-text, black)",
            fontFamily: "inherit",
            fontSize: "1.1em",
            padding: "0.4em 0.5em",
            flexShrink: "0"
        },
        focus: {
            outline: "2px solid var(--tmd-accent, black)",
        }
    });

    return (
        <select class={selectClassName}>
            {props.children && props.children}
        </select>
    );
}

export function createConfirmDialog({ message }: { message: string }): Promise<boolean> {
    return new Promise((resolve) => {
        const clear = () => {
            _dialog.remove();
            document.removeEventListener("keydown", handleKeyDown, { capture: true });
        }

        const submit = () => {
            clear();
            resolve(true);
        }

        const cancel = () => {
            clear();
            resolve(false);
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.key === "Enter") submit();
            if (e.key === "Escape") cancel();
        }

        document.addEventListener("keydown", handleKeyDown, { capture: true });

        const _dialog = (
            <Dialog>
                <DialogText style={{ fontSize: "1.75em" }}>{message}</DialogText>
                <DialogButtons>
                    <DialogButton onClick={cancel}>Cancel</DialogButton>
                    <DialogButton onClick={submit}>Ok</DialogButton>
                </DialogButtons>
            </Dialog>
        ) as HTMLDialogElement;
        _dialog.setAttribute("data-zc-dialog-type", "confirm");

        document.body.append(_dialog);
        _dialog.showModal();
    })
}

export function createPromptDialog({ message }: { message: string }): Promise<string | false> {
    return new Promise((resolve) => {
        const clear = () => {
            _dialog.remove();
            document.removeEventListener("keydown", handleKeyDown, { capture: true });
        }

        const submit = () => {
            clear();
            resolve(input.value);
        }

        const cancel = () => {
            clear();
            resolve(false);
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.key === "Enter") submit();
            if (e.key === "Escape") cancel();
        }

        document.addEventListener("keydown", handleKeyDown, { capture: true });

        const input = (<DialogInput />) as HTMLInputElement;

        const _dialog = (
            <Dialog>
                <DialogText style={{ fontSize: "1.75em" }}>{message}</DialogText>
                {input}
                <DialogButtons>
                    <DialogButton onClick={cancel}>Cancel</DialogButton>
                    <DialogButton onClick={submit}>Ok</DialogButton>
                </DialogButtons>
            </Dialog>
        ) as HTMLDialogElement;
        _dialog.setAttribute("data-zc-dialog-type", "prompt");

        document.body.append(_dialog);
        _dialog.showModal();
        input.focus();
    });
}

export function createPickDialog<T>({
    message,
    options,
}: {
    message: string
    options: { name: string; value: T }[]
}): Promise<T | false> {
    return new Promise((resolve) => {
        const clear = () => {
            _dialog.remove();
            document.removeEventListener("keydown", handleKeyDown, { capture: true });
        }

        const submit = () => {
            const option = options[select.selectedIndex];
            clear();
            resolve(option ? option.value : false);
        }

        const cancel = () => {
            clear();
            resolve(false);
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
            }
            if (e.key === "Enter") submit();
            if (e.key === "Escape") cancel();
        }

        document.addEventListener("keydown", handleKeyDown, { capture: true });

        const select = (
            <DialogSelect>
                {options.map((o, i) => (
                    <option value={String(i)}>{o.name}</option>
                ))}
            </DialogSelect>
        ) as HTMLSelectElement;

        const _dialog = (
            <Dialog>
                <DialogText style={{ fontSize: "1.75em" }}>{message}</DialogText>
                {select}
                <DialogButtons>
                    <DialogButton onClick={cancel}>Cancel</DialogButton>
                    <DialogButton onClick={submit}>Ok</DialogButton>
                </DialogButtons>
            </Dialog>
        ) as HTMLDialogElement;
        _dialog.setAttribute("data-zc-dialog-type", "pick");

        document.body.append(_dialog);
        _dialog.showModal();
        select.focus();
    });
}

export function createPickPlayerDialog({ message = "Select players" }: { message?: string } = {}): Promise<number[] | false> {
    return new Promise((resolve) => {
        const clear = () => {
            _dialog.remove();
            document.removeEventListener("keydown", handleKeyDown, { capture: true });
        }

        const cancel = () => {
            clear();
            resolve(false);
        }

        const submit = () => {
            clear();
            resolve([...selected]);
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                cancel();
            }
            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();
                submit();
            }
        }
        document.addEventListener("keydown", handleKeyDown, { capture: true });

        type Entry = { memberNumber: number; name: string; tags: string[] };

        const entries: Entry[] = [];
        const seen = new Set<number>();
        const selected = new Set<number>();

        const add = (memberNumber: number, name: string, tag: string) => {
            if (memberNumber == null || seen.has(memberNumber)) return;
            seen.add(memberNumber);
            entries.push({ memberNumber, name, tags: [tag] });
        }

        if (Player.Ownership !== null) {
            add(Player.Ownership.MemberNumber, Player.Ownership.Name, "Owner");
        }

        if (Array.isArray(Player.Lovership)) {
            for (const l of Player.Lovership) {
                if (l.MemberNumber != null) {
                    add(l.MemberNumber, l.Name, "Lovers");
                }
            }
        }

        if (Array.isArray(Player.WhiteList)) {
            for (const num of Player.WhiteList) {
                const knownName =
                    Player.FriendNames?.get?.(num) ??
                    ChatRoomCharacter?.find((c) => c.MemberNumber === num)?.Name ??
                    "Unknown";
                add(num, knownName, "Whitelist");
            }
        }

        if (Array.isArray(Player.FriendList)) {
            for (const num of Player.FriendList) {
                const knownName = Player.FriendNames?.get?.(num) ?? "Unknown";
                add(num, knownName, "Friends");
            }
        }

        if (Array.isArray(ChatRoomCharacter)) {
            for (const c of ChatRoomCharacter) {
                if (c.MemberNumber != null && c.MemberNumber !== Player.MemberNumber) {
                    add(c.MemberNumber, c.Name, "Room Members");
                }
            }
        }

        const filterBarClass = getDynamicClass({
            base: {
                display: "flex",
                flexWrap: "wrap",
                gap: "0.35em",
                flexShrink: "0"
            }
        });

        const filterBtnClass = getDynamicClass({
            base: {
                cursor: "pointer",
                padding: "0.25em 0.6em",
                borderRadius: "4px",
                border: "1px solid var(--tmd-element-hover, #ccc)",
                background: "var(--tmd-element, white)",
                color: "var(--tmd-text, black)",
                fontFamily: "inherit",
                fontSize: "1em"
            },
            hover: {
                background: "var(--tmd-element-hover, #eee)"
            }
        });

        const filterBtnActiveClass = getDynamicClass({
            base: {
                cursor: "pointer",
                padding: "0.25em 0.6em",
                borderRadius: "4px",
                border: "1px solid var(--tmd-accent, black)",
                background: "var(--tmd-element-hover, #eee)",
                color: "var(--tmd-text, black)",
                fontFamily: "inherit",
                fontSize: "1em",
                boxShadow: "inset 0 0 0 1px var(--tmd-accent, black)"
            }
        });

        const listClass = getDynamicClass({
            base: {
                display: "flex",
                flexDirection: "column",
                gap: "0.3em",
                width: "100%",
                flex: "1 1 auto",
                minHeight: "0",
                overflowY: "auto",
                boxSizing: "border-box"
            }
        });

        const rowClass = getDynamicClass({
            base: {
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "0.5em",
                width: "100%",
                boxSizing: "border-box",
                padding: "0.45em 0.6em",
                borderRadius: "4px",
                border: "1px solid var(--tmd-element-hover, #ccc)",
                background: "var(--tmd-element, white)",
                color: "var(--tmd-text, black)",
                fontFamily: "inherit",
                fontSize: "1.05em",
                flexShrink: "0"
            },
            hover: {
                background: "var(--tmd-element-hover, #eee)"
            }
        });

        const rowSelectedClass = getDynamicClass({
            base: {
                cursor: "pointer",
                textAlign: "left",
                display: "flex",
                alignItems: "center",
                gap: "0.5em",
                width: "100%",
                boxSizing: "border-box",
                padding: "0.45em 0.6em",
                borderRadius: "4px",
                border: "1px solid var(--tmd-accent, black)",
                boxShadow: "inset 0 0 0 1px var(--tmd-accent, black)",
                background: "var(--tmd-element-hover, #eee)",
                color: "var(--tmd-text, black)",
                fontFamily: "inherit",
                fontSize: "1.05em",
                flexShrink: "0"
            },
            hover: {
                background: "var(--tmd-element-hover, #eee)"
            }
        });

        const checkClass = getDynamicClass({
            base: {
                width: "1.5em",
                textAlign: "center",
                flexShrink: "0"
            }
        });

        const emptyClass = getDynamicClass({
            base: {
                opacity: "0.7",
                padding: "0.5em",
                color: "var(--tmd-text, black)"
            }
        });

        const footerClass = getDynamicClass({
            base: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "0.75em",
                flexShrink: "0"
            }
        });

        const filters = ["All", "Owner", "Lovers", "Whitelist", "Friends", "Room Members"] as const;
        let activeFilter: (typeof filters)[number] = "All";
        const filterBar = (<div class={filterBarClass}></div>) as HTMLDivElement;
        const filterButtons: { filter: (typeof filters)[number]; button: HTMLButtonElement }[] = [];

        const search = (<DialogInput placeholder="Search name or number…" />) as HTMLInputElement;

        const list = (<div class={listClass}></div>) as HTMLDivElement;

        const selectedInfo = (<DialogText>Selected: 0</DialogText>) as HTMLElement;
        const updateSelectedInfo = () => {
            selectedInfo.textContent = `Selected: ${selected.size}`;
        }
        updateSelectedInfo();

        const updateFilterButtons = () => {
            for (const { filter, button } of filterButtons) {
                button.className = filter === activeFilter ? filterBtnActiveClass : filterBtnClass;
            }
        }

        const render = () => {
            const scrollTop = list.scrollTop;
            list.innerHTML = "";
            const q = search.value.trim().toLowerCase();
            let visibleCount = 0;

            for (const e of entries) {
                if (activeFilter !== "All" && !e.tags.includes(activeFilter)) continue;
                if (
                    q &&
                    !e.name.toLowerCase().includes(q) &&
                    !String(e.memberNumber).includes(q)
                ) {
                    continue;
                }

                visibleCount++;
                const isSelected = selected.has(e.memberNumber);

                const row = document.createElement("button");
                row.type = "button";
                row.className = isSelected ? rowSelectedClass : rowClass;

                const check = document.createElement("span");
                check.className = checkClass;
                check.textContent = isSelected ? "✓" : "";

                const label = document.createElement("span");
                label.textContent = `${e.name} (${e.memberNumber})`;

                row.append(check, label);
                row.addEventListener("click", () => {
                    if (selected.has(e.memberNumber)) {
                        selected.delete(e.memberNumber);
                    } else {
                        selected.add(e.memberNumber);
                    }
                    updateSelectedInfo();
                    render();
                });
                list.append(row);
            }

            if (visibleCount === 0) {
                const empty = document.createElement("div");
                empty.className = emptyClass;
                empty.textContent = "No players found";
                list.append(empty);
            }

            list.scrollTop = scrollTop;
        }

        for (const f of filters) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = f;
            btn.addEventListener("click", () => {
                activeFilter = f;
                updateFilterButtons();
                render();
            });
            filterButtons.push({ filter: f, button: btn });
            filterBar.append(btn);
        }
        updateFilterButtons();

        search.addEventListener("input", render);

        const _dialog = (
            <Dialog wide>
                <DialogText style={{ fontSize: "1.75em" }}>{message}</DialogText>
                {filterBar}
                {search}
                {list}
                <div class={footerClass}>
                    {selectedInfo}
                    <DialogButtons>
                        <DialogButton onClick={cancel}>Cancel</DialogButton>
                        <DialogButton onClick={submit}>Ok</DialogButton>
                    </DialogButtons>
                </div>
            </Dialog>
        ) as HTMLDialogElement;
        _dialog.setAttribute("data-zc-dialog-type", "pick-player");

        document.body.append(_dialog);
        _dialog.showModal();
        search.focus();
        render();
    })
}