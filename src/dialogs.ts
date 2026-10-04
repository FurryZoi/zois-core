import { addDynamicClass } from "./ui"

const DIALOG_BG = "rgb(57, 64, 77)"
const TEXT_WHITE = "white !important"
const INPUT_BG = "rgb(82, 89, 104) !important"
const ACCENT = "#00eeff"
const ACCENT_HOVER = "rgb(4, 203, 217)"
const CANCEL_BG = "rgba(73, 82, 99, 1)"
const CANCEL_HOVER = "rgb(86, 94, 108)"
const ROW_BG = "rgb(82, 89, 104)"
const ROW_SELECTED_BG = "rgba(77, 164, 107, 0.24)"
const ROW_SELECTED_COLOR = "#aee8c2"
const FILTER_BTN_BG = "rgba(223, 233, 255, 0.1)"
const FILTER_BTN_ACTIVE_BG = "rgba(16, 215, 56, 0.19)"
const FILTER_BTN_ACTIVE_BORDER = "rgb(85, 138, 96)"
const OVERLAY_BG = "black"

function applyDialogBase(el: HTMLElement) {
    addDynamicClass(el, {
        base: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: DIALOG_BG,
            margin: "auto",
            position: "absolute",
            top: "0",
            left: "0",
            bottom: "0",
            right: "0",
            border: "none",
            borderRadius: "4px",
            minWidth: "200px",
            maxWidth: "450px",
            width: "90%",
            height: "fit-content",
            zIndex: "100",
            pointerEvents: "all",
            boxShadow: "0px 0px 6px 1px #0000006e",
        },
    })
}

function applyDialogMessage(el: HTMLElement) {
    addDynamicClass(el, {
        base: {
            padding: "0.85em 0px",
            margin: "0",
            userSelect: "none",
            width: "90%",
            color: TEXT_WHITE,
        },
    })
}

function applyDialogButtonsContainer(el: HTMLElement) {
    addDynamicClass(el, {
        base: {
            display: "flex",
            justifyContent: "end",
            columnGap: "0.75em",
            width: "90%",
            padding: "0.9em 0",
        },
    })
}

function applyCancelButton(el: HTMLElement) {
    addDynamicClass(el, {
        base: {
            cursor: "pointer",
            padding: "6px 14px",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            background: CANCEL_BG,
            color: TEXT_WHITE,
        },
        hover: {
            background: CANCEL_HOVER,
        },
    })
}

function applyOkButton(el: HTMLElement) {
    addDynamicClass(el, {
        base: {
            cursor: "pointer",
            padding: "6px 14px",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            background: ACCENT,
            color: "black",
        },
        hover: {
            background: ACCENT_HOVER,
        },
    })
}

function applyDialogInput(el: HTMLElement) {
    addDynamicClass(el, {
        base: {
            color: TEXT_WHITE,
            marginTop: "1px",
            width: "90%",
            background: INPUT_BG,
            border: "none !important",
            outline: "none !important",
            borderRadius: "4px",
            padding: "0.45em",
        },
        focus: {
            outline: `2px solid ${ACCENT} !important`,
        },
    })
}

function applyDialogSelect(el: HTMLElement) {
    addDynamicClass(el, {
        base: {
            cursor: "pointer",
            width: "90%",
            background: INPUT_BG,
            border: "none !important",
            padding: "0.4em",
            color: TEXT_WHITE,
            borderRadius: "4px",
        },
    })
}

function createConfirmDialog({ message }: { message: string }): Promise<boolean> {
    return new Promise((resolve) => {
        const clear = () => {
            _dialog.remove()
            background.remove()
            document.removeEventListener("keydown", handleKeyDown, { capture: true })
        }

        const submit = () => {
            clear()
            resolve(true)
        }

        const cancel = () => {
            clear()
            resolve(false)
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault()
                e.stopPropagation()
            }
            if (e.key === "Enter") submit()
            if (e.key === "Escape") cancel()
        }

        document.addEventListener("keydown", handleKeyDown, { capture: true })

        const background = document.createElement("div")
        background.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 20;
            opacity: 0.5;
            background: ${OVERLAY_BG};
        `

        const _dialog = document.createElement("div")
        _dialog.setAttribute("data-zc-dialog-type", "confirm")
        _dialog.style.fontFamily = CommonGetFontName()
        applyDialogBase(_dialog)

        const messageEl = document.createElement("p")
        messageEl.textContent = message
        applyDialogMessage(messageEl)
        _dialog.append(messageEl)

        const buttons = document.createElement("div")
        applyDialogButtonsContainer(buttons)

        const cancelBtn = document.createElement("button")
        cancelBtn.textContent = "Cancel"
        applyCancelButton(cancelBtn)
        cancelBtn.addEventListener("click", cancel)

        const submitBtn = document.createElement("button")
        submitBtn.textContent = "Ok"
        applyOkButton(submitBtn)
        submitBtn.addEventListener("click", submit)

        buttons.append(cancelBtn, submitBtn)
        _dialog.append(buttons)
        document.body.append(_dialog, background)
    })
}

function createPromptDialog({ message }: { message: string }): Promise<string | false> {
    return new Promise((resolve) => {
        let inputElement: HTMLInputElement | null = null

        const clear = () => {
            _dialog.remove()
            background.remove()
            document.removeEventListener("keydown", handleKeyDown, { capture: true })
        }

        const submit = () => {
            clear()
            resolve(inputElement!.value)
        }

        const cancel = () => {
            clear()
            resolve(false)
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault()
                e.stopPropagation()
            }
            if (e.key === "Enter") submit()
            if (e.key === "Escape") cancel()
        }

        document.addEventListener("keydown", handleKeyDown, { capture: true })

        const background = document.createElement("div")
        background.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 20;
            opacity: 0.5;
            background: ${OVERLAY_BG};
        `

        const _dialog = document.createElement("div")
        _dialog.setAttribute("data-zc-dialog-type", "prompt")
        _dialog.style.fontFamily = CommonGetFontName()
        applyDialogBase(_dialog)

        const messageEl = document.createElement("p")
        messageEl.textContent = message
        applyDialogMessage(messageEl)
        _dialog.append(messageEl)

        const input = document.createElement("input")
        applyDialogInput(input)
        inputElement = input
        _dialog.append(input)

        const buttons = document.createElement("div")
        applyDialogButtonsContainer(buttons)

        const cancelBtn = document.createElement("button")
        cancelBtn.textContent = "Cancel"
        applyCancelButton(cancelBtn)
        cancelBtn.addEventListener("click", cancel)

        const submitBtn = document.createElement("button")
        submitBtn.textContent = "Ok"
        applyOkButton(submitBtn)
        submitBtn.addEventListener("click", submit)

        buttons.append(cancelBtn, submitBtn)
        _dialog.append(buttons)
        document.body.append(_dialog, background)
        inputElement.focus()
    })
}

function createPickDialog<T>({
    message,
    options,
}: {
    message: string
    options: { name: string; value: T }[]
}): Promise<T | false> {
    return new Promise((resolve) => {
        let selectElement: HTMLSelectElement | null = null

        const clear = () => {
            _dialog.remove()
            background.remove()
            document.removeEventListener("keydown", handleKeyDown, { capture: true })
        }

        const submit = () => {
            clear()
            resolve(selectElement!.value as T)
        }

        const cancel = () => {
            clear()
            resolve(false)
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault()
                e.stopPropagation()
            }
            if (e.key === "Enter") submit()
            if (e.key === "Escape") cancel()
        }

        document.addEventListener("keydown", handleKeyDown, { capture: true })

        const background = document.createElement("div")
        background.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 20;
            opacity: 0.5;
            background: ${OVERLAY_BG};
        `

        const _dialog = document.createElement("div")
        _dialog.setAttribute("data-zc-dialog-type", "pick")
        _dialog.style.fontFamily = CommonGetFontName()
        applyDialogBase(_dialog)

        const messageEl = document.createElement("p")
        messageEl.textContent = message
        applyDialogMessage(messageEl)
        _dialog.append(messageEl)

        const select = document.createElement("select")
        applyDialogSelect(select)
        options.forEach((o) => {
            const option = document.createElement("option")
            option.setAttribute("key", o.name)
            option.text = o.name
            select.append(option)
        })
        selectElement = select
        _dialog.append(select)

        const buttons = document.createElement("div")
        applyDialogButtonsContainer(buttons)

        const cancelBtn = document.createElement("button")
        cancelBtn.textContent = "Cancel"
        applyCancelButton(cancelBtn)
        cancelBtn.addEventListener("click", cancel)

        const submitBtn = document.createElement("button")
        submitBtn.textContent = "Ok"
        applyOkButton(submitBtn)
        submitBtn.addEventListener("click", submit)

        buttons.append(cancelBtn, submitBtn)
        _dialog.append(buttons)
        document.body.append(_dialog, background)
        selectElement.focus()
    })
}

function createPickPlayerDialog({ message = "Select players" }: { message?: string } = {}): Promise<number[] | false> {
    return new Promise((resolve) => {
        const clear = () => {
            dialog.remove()
            background.remove()
            document.removeEventListener("keydown", handleKeyDown, { capture: true })
        }

        const cancel = () => {
            clear()
            resolve(false)
        }

        const submit = () => {
            clear()
            resolve([...selected])
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault()
                e.stopPropagation()
                cancel()
            }
            if (e.key === "Enter") {
                e.preventDefault()
                e.stopPropagation()
                submit()
            }
        }
        document.addEventListener("keydown", handleKeyDown, { capture: true })

        type Entry = { memberNumber: number; name: string; tags: string[] }

        const entries: Entry[] = []
        const seen = new Set<number>()
        const selected = new Set<number>()

        const add = (memberNumber: number, name: string, tag: string) => {
            if (memberNumber == null || seen.has(memberNumber)) return
            seen.add(memberNumber)
            entries.push({ memberNumber, name, tags: [tag] })
        }

        if (Player.Ownership !== null) {
            add(Player.Ownership.MemberNumber, Player.Ownership.Name, "Owner")
        }

        if (Array.isArray(Player.Lovership)) {
            for (const l of Player.Lovership) {
                if (l.MemberNumber != null) {
                    add(l.MemberNumber, l.Name, "Lovers")
                }
            }
        }

        if (Array.isArray(Player.WhiteList)) {
            for (const num of Player.WhiteList) {
                const knownName =
                    Player.FriendNames?.get?.(num) ??
                    ChatRoomCharacter?.find((c) => c.MemberNumber === num)?.Name ??
                    String(num)
                add(num, knownName, "Whitelist")
            }
        }

        if (Array.isArray(Player.FriendList)) {
            for (const num of Player.FriendList) {
                const knownName = Player.FriendNames?.get?.(num) ?? "Unknown"
                add(num, knownName, "Friends")
            }
        }

        if (Array.isArray(ChatRoomCharacter)) {
            for (const c of ChatRoomCharacter) {
                if (c.MemberNumber != null && c.MemberNumber !== Player.MemberNumber) {
                    add(c.MemberNumber, c.Name, "Room Members")
                }
            }
        }

        const background = document.createElement("div")
        background.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 20;
            opacity: 0.5;
            background: ${OVERLAY_BG};
        `

        const dialog = document.createElement("div")
        dialog.setAttribute("data-zc-dialog-type", "pick-player")
        dialog.style.fontFamily = CommonGetFontName()
        addDynamicClass(dialog, {
            base: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: DIALOG_BG,
                margin: "auto",
                position: "absolute",
                top: "0",
                left: "0",
                bottom: "0",
                right: "0",
                border: "none",
                borderRadius: "4px",
                minWidth: "200px",
                maxWidth: "600px",
                width: "90%",
                height: "90%",
                maxHeight: "85vh",
                zIndex: "100",
                pointerEvents: "all",
                boxShadow: "0px 0px 6px 1px #0000006e",
                gap: "0.6em",
                boxSizing: "border-box",
                overflow: "hidden",
            },
        })

        const msg = document.createElement("p")
        msg.textContent = message
        applyDialogMessage(msg)
        dialog.append(msg)

        const filters = ["All", "Owner", "Lovers", "Whitelist", "Friends", "Room Members"] as const
        let activeFilter: (typeof filters)[number] = "All"
        const filterBar = document.createElement("div")
        filterBar.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 0.35em;
            flex-shrink: 0;
            width: 90%;
        `

        const search = document.createElement("input")
        search.placeholder = "Search name or number…"
        addDynamicClass(search, {
            base: {
                color: TEXT_WHITE,
                width: "90%",
                background: INPUT_BG,
                border: "none !important",
                outline: "none !important",
                borderRadius: "4px",
                padding: "0.45em",
                boxSizing: "border-box",
                flexShrink: "0",
            },
            focus: {
                outline: `2px solid ${ACCENT} !important`,
            },
        })

        const list = document.createElement("div")
        list.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25em;
            width: 100%;
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            box-sizing: border-box;
        `

        const footer = document.createElement("div")
        footer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 90%;
            padding: 0.9em 0;
            flex-shrink: 0;
            box-sizing: border-box;
        `

        const selectedInfo = document.createElement("div")
        selectedInfo.style.cssText = `
            color: ${TEXT_WHITE};
            font-size: 1.15em;
            font-weight: 600;
        `
        const updateSelectedInfo = () => {
            selectedInfo.textContent = `Selected: ${selected.size}`
        }
        updateSelectedInfo()

        const footerButtons = document.createElement("div")
        footerButtons.style.cssText = `
            display: flex;
            column-gap: 0.75em;
        `

        const render = () => {
            list.innerHTML = ""
            const q = search.value.trim().toLowerCase()
            let visibleCount = 0

            for (const e of entries) {
                if (activeFilter !== "All" && !e.tags.includes(activeFilter)) continue
                if (
                    q &&
                    !e.name.toLowerCase().includes(q) &&
                    !String(e.memberNumber).includes(q)
                ) {
                    continue
                }

                visibleCount++
                const isSelected = selected.has(e.memberNumber)

                const row = document.createElement("button")
                row.type = "button"
                addDynamicClass(row, {
                    base: {
                        cursor: "pointer",
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5em",
                        background: isSelected ? ROW_SELECTED_BG : ROW_BG,
                        color: isSelected ? ROW_SELECTED_COLOR : TEXT_WHITE,
                        border: "none",
                        borderRadius: "4px",
                        padding: "0.45em 0.6em",
                        width: "90%",
                        boxSizing: "border-box",
                    },
                })

                const check = document.createElement("span")
                check.textContent = isSelected ? "✓" : ""
                check.style.cssText = `
                    width: 1.5em;
                    text-align: center;
                    flex-shrink: 0;
                `

                const label = document.createElement("span")
                label.textContent = `${e.name} (${e.memberNumber})`

                row.append(check, label)
                row.addEventListener("click", () => {
                    if (selected.has(e.memberNumber)) {
                        selected.delete(e.memberNumber)
                    } else {
                        selected.add(e.memberNumber)
                    }
                    updateSelectedInfo()
                    render()
                })
                list.append(row)
            }

            if (visibleCount === 0) {
                const empty = document.createElement("div")
                empty.style.cssText = `
                    opacity: 0.7;
                    padding: 0.5em;
                    color: ${TEXT_WHITE};
                `
                empty.textContent = "No players found"
                list.append(empty)
            }
        }

        for (const f of filters) {
            const btn = document.createElement("button")
            btn.type = "button"
            btn.textContent = f
            addDynamicClass(btn, {
                base: {
                    cursor: "pointer",
                    padding: "0.25em 0.5em",
                    borderRadius: "4px",
                    border: "1px solid #666",
                    background: FILTER_BTN_BG,
                    color: TEXT_WHITE,
                },
            })
            btn.addEventListener("click", () => {
                activeFilter = f
                for (const b of filterBar.children) {
                    if (b instanceof HTMLElement) {
                        b.style.background = FILTER_BTN_BG
                        b.style.borderColor = "#666"
                    }
                }
                btn.style.background = FILTER_BTN_ACTIVE_BG
                btn.style.borderColor = FILTER_BTN_ACTIVE_BORDER
                render()
            })
            filterBar.append(btn)
        }

        search.addEventListener("input", render)

        const cancelBtn = document.createElement("button")
        cancelBtn.textContent = "Cancel"
        applyCancelButton(cancelBtn)
        cancelBtn.addEventListener("click", cancel)

        const okBtn = document.createElement("button")
        okBtn.textContent = "Ok"
        applyOkButton(okBtn)
        okBtn.addEventListener("click", submit)

        footerButtons.append(cancelBtn, okBtn)
        footer.append(selectedInfo, footerButtons)

        dialog.append(filterBar, search, list, footer)
        document.body.append(dialog, background)
        search.focus()
        render()
    })
}

export class DialogsManager {
    public prompt({ message }: { message: string }): Promise<string | false> {
        return createPromptDialog({ message })
    }

    public confirm({ message }: { message: string }): Promise<boolean> {
        return createConfirmDialog({ message })
    }

    public pick<T>({
        message,
        options,
    }: {
        message: string
        options: { name: string; value: T }[]
    }): Promise<T | false> {
        return createPickDialog({ message, options })
    }

    public pickPlayers({ message = "Select players" }: { message?: string } = {}): Promise<number[] | false> {
        return createPickPlayerDialog({ message })
    }
}

export const dialogsManager = new DialogsManager();