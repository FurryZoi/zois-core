import { getRelativeWidth, getRelativeX, getRelativeY } from "./ui";
import { MOD_DATA, ModData } from "./index";
import React, { JSX, ReactNode, useState, useEffect, CSSProperties, FC, useRef, PropsWithChildren, useCallback } from "react";
import ReactDOM from "react-dom/client";
import { create } from "zustand";
import WarningIcon from "./assets/warningIcon.svg";
import ErrorIcon from "./assets/errorIcon.svg";
import InfoIcon from "./assets/infoIcon.svg";
import SuccessIcon from "./assets/successIcon.svg";
import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react";


interface ToastProps {
    id: string
    title?: string
    message: string
    type: "info" | "warning" | "error" | "success" | "spinner"
    duration: number
    theme?: ModData["singleToastsTheme"]
}

interface BaseDialogProps<T> {
    type: "prompt" | "confirm" | "pick"
    message: string
    promise: {
        resolve: (data: T) => void
        reject: (data: T) => void
    }
}

interface ConfirmDialogProps extends BaseDialogProps<boolean> {
    type: "confirm"
}

interface PromptDialogProps extends BaseDialogProps<string | false> {
    type: "prompt"
}

interface PickDialogProps<T> extends BaseDialogProps<T | false> {
    type: "pick"
    options: {
        name: string
        value: T
    }[]
}

type DialogProps = ConfirmDialogProps | PromptDialogProps | PickDialogProps<unknown>;

function ToastsContainer({ children }: PropsWithChildren) {
    const [toastsContainerStyle, setToastsContainerStyle] = useState<React.CSSProperties>({});
    const clearToasts = window.ZOISCORE.useToastsStore((state) => state.clearToasts);

    useEffect(() => {
        const update = () => {
            setToastsContainerStyle({
                fontFamily: CommonGetFontName(),
                bottom: getRelativeY(5) + "px",
                left: getRelativeX(5) + "px"
            });
        };

        window.addEventListener("resize", update);
        update();

        return () => {
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <div
            className="zcToastsContainer"
            style={toastsContainerStyle}
            onClick={() => {
                document.querySelectorAll('.zcToast').forEach((toast) => {
                    toast.classList.add('exiting');
                });
                setTimeout(clearToasts, 300);
            }}
        >
            {children}
        </div>
    );
}

const ToastIcon: FC<{ type: ToastProps["type"], theme: ToastProps["theme"] }> = ({ type, theme }) => {
    switch (type) {
        case "info":
            return (
                <Info
                    style={{
                        flexShrink: 0,
                        width: "1.65em",
                        height: "1.65em",
                        fill: theme ? theme.iconFillColor : "#addbff",
                        stroke: theme ? theme.iconStrokeColor : "#385073"
                    }}
                />
            );
        case "success":
            return (
                <CircleCheck
                    style={{
                        flexShrink: 0,
                        width: "1.65em",
                        height: "1.65em",
                        fill: theme ? theme.iconFillColor : "#c3ffc3",
                        stroke: theme ? theme.iconStrokeColor : "#028f74"
                    }}
                />
            );
        case "warning":
            return (
                <CircleAlert
                    style={{
                        flexShrink: 0,
                        width: "1.65em",
                        height: "1.65em",
                        fill: theme ? theme.iconFillColor : "#ffdfaf",
                        stroke: theme ? theme.iconStrokeColor : "#9c7633"
                    }}
                />
            );
        case "error":
            return (
                <CircleX
                    style={{
                        flexShrink: 0,
                        width: "1.65em",
                        height: "1.65em",
                        fill: theme ? theme.iconFillColor : "#ffb2b2",
                        stroke: theme ? theme.iconStrokeColor : "#7f2828"
                    }}
                />
            );
        case "spinner":
            return (
                <div
                    style={{
                        flexShrink: 0,
                        width: "1.65em",
                        height: "1.65em",
                        boxSizing: "border-box",
                        border: "2px solid",
                        borderRadius: "100%",
                        borderColor: `transparent ${theme ? theme.iconFillColor : "rgb(154 154 255)"}`,
                        animation: "zcSpin 0.65s linear infinite"
                    }}
                />
            );
    }
}


const Toast: FC<ToastProps> = ({
    title, message, type, duration, theme
}) => {
    const [toastStyle, setToastStyle] = useState<React.CSSProperties>({});
    const [isExiting, setIsExiting] = useState(false);

    const backgroundColor = theme ? theme.backgroundColor : type === "success" ? "#3ece7e" : type === "warning" ? "#debf72" : type === "error" ? "rgb(212, 46, 107)" : "rgb(80, 80, 223)";
    const titleColor = theme ? theme.titleColor : (type === "info" || type === "spinner") ? "rgb(47, 46, 104)" : type === "success" ? "#244428" : type === "error" ? "rgb(113, 2, 2)" : "#5e4328";
    const messageColor = theme ? theme.messageColor : (type === "info" || type === "spinner") ? "#b8b8ff" : type === "success" ? "#c7f9c7" : type === "error" ? "rgb(255, 152, 152)" : "#ffeec5";

    useEffect(() => {
        const update = () => {
            const canvasWidth = MainCanvas.canvas.clientWidth;
            const canvasHeight = MainCanvas.canvas.clientHeight;
            const scaleFactor = Math.min(canvasWidth, canvasHeight) / 100;

            setToastStyle({
                position: "relative",
                width: "100%",
                fontSize: (3 * scaleFactor) + "px",
                padding: (1.5 * scaleFactor) + "px",
                background: backgroundColor
            });
        };

        window.addEventListener("resize", update);
        update();
        const exitingTimer = setTimeout(() => setIsExiting(true), duration);

        return () => {
            clearTimeout(exitingTimer);
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <div className={`zcToast ${isExiting && "exiting"}`} data-zc-toast-type={type} style={toastStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "1vw", position: "relative", zIndex: 5 }}>
                <ToastIcon type={type} theme={theme} />
                <div>
                    {
                        title && message &&
                        <>
                            <p
                                style={{
                                    color: titleColor,
                                    fontWeight: "bold"
                                }}
                            >
                                {title}
                            </p>
                            <p
                                style={{
                                    color: messageColor,
                                    fontSize: "70%",
                                    fontWeight: "bold",
                                    overflowWrap: "anywhere",
                                    marginTop: "0.25em"
                                }}
                            >
                                {message}
                            </p>
                        </>
                    }
                    {
                        ((!title && message) || (title && !message)) &&
                        <p
                            style={{
                                position: "relative",
                                zIndex: 5,
                                color: messageColor,
                                fontWeight: "bold",
                                overflowWrap: "anywhere"
                            }}
                        >
                            {title ? title : message}
                        </p>
                    }
                </div>
            </div>
            {
                type !== "spinner" &&
                <div
                    className="zcToast-ProgressBar"
                    style={{
                        animation: `zcToast-progress ${duration}ms linear 0s 1 alternate none`,
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: "100%",
                        borderRadius: "4px",
                        background: theme ? theme.progressBarColor : type === "info" ? "rgb(103, 103, 234)" : type === "success" ? "#34bc71" : type === "warning" ? "#d0af5e" : "rgb(183, 40, 92)"
                    }}
                />
            }
        </div>
    );
}

function Dialog({ dialog }: { dialog: DialogProps }): JSX.Element {
    const clearDialog = window.ZOISCORE.useDialogStore((state) => state.clearDialog);
    const [inputValue, setInputValue] = useState("");
    const [selectValue, setSelectValue] = useState(dialog.type === "pick" ? dialog.options?.[0]?.value : null);
    const inputRef = useRef<HTMLInputElement>(null);

    const submit = () => {
        clearDialog();
        if (dialog.type === "prompt") {
            dialog.promise.resolve(inputValue);
        }
        if (dialog.type === "confirm") {
            dialog.promise.resolve(true);
        }
        if (dialog.type === "pick") {
            dialog.promise.resolve(selectValue);
        }
    };

    const cancel = () => {
        clearDialog();
        dialog.promise.resolve(false);
    };

    useEffect(() => {
        document.body.style.pointerEvents = "none";
        if (dialog.type === "prompt" && inputRef.current instanceof HTMLInputElement) {
            console.log("Focus call")
            inputRef.current.focus();
        }
        return () => {
            document.body.style.pointerEvents = "";
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
            }

            if (e.key === "Enter") submit();
            if (e.key === "Escape") cancel();
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [submit, cancel]);

    return (
        <>
            <div
                className="zcDialog"
                data-zc-dialog-type={dialog.type}
                style={{
                    fontFamily: CommonGetFontName()
                }}
            >
                <p>{dialog.message}</p>
                {
                    dialog.type === "prompt" &&
                    <input ref={inputRef} type="text" value={inputValue} style={{ color: "white", marginTop: "1px", width: "90%", background: "rgb(82, 89, 104)", border: "none", borderRadius: "4px", padding: "0.45em" }} onChange={(e) => { console.log(e.currentTarget.value); setInputValue(e.currentTarget.value); }} />
                }
                {
                    dialog.type === "pick" &&
                    <select style={{ cursor: "pointer", width: "90%", background: "rgb(82, 89, 104)", border: "none", padding: "0.4em", color: "white", borderRadius: "4px" }}>
                        {
                            dialog.options.map((o) => {
                                return (
                                    <option
                                        key={o.name}
                                        onClick={() => {
                                            setSelectValue(o.value);
                                        }}
                                    >
                                        {o.name}
                                    </option>
                                );
                            })
                        }
                    </select>
                }
                <div style={{
                    display: "flex",
                    justifyContent: "end",
                    columnGap: "0.75em",
                    width: "100%",
                    padding: "1em"
                }}>
                    <button onClick={cancel}>
                        Cancel
                    </button>
                    <button onClick={submit}>
                        Ok
                    </button>
                </div>
            </div>
            <div style={{
                position: "fixed",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                zIndex: "20",
                opacity: "0.5",
                background: "black"
            }} />
        </>
    );
}

class ToastsManager {
    private generateToastId(): string {
        return crypto.randomUUID();
    }

    private process({ title, message, duration, type, id, theme }: ToastProps): void {
        const { addToast, removeToast } = window.ZOISCORE.useToastsStore.getState();
        addToast({
            id,
            title,
            message,
            duration,
            type,
            theme
        });
        setTimeout(() => removeToast(id), duration + 300);
    }

    info({ title, message, duration }: Omit<ToastProps, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "info", id, theme });
    }

    success({ title, message, duration }: Omit<ToastProps, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "success", id, theme });
    }

    warn({ title, message, duration }: Omit<ToastProps, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "warning", id, theme });
    }

    error({ title, message, duration }: Omit<ToastProps, "type" | "id" | "theme">): void {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration, type: "error", id, theme });
    }

    spinner({ title, message }: Omit<ToastProps, "type" | "id" | "duration" | "theme">): string {
        const id = this.generateToastId();
        const theme = MOD_DATA.singleToastsTheme;
        this.process({ title, message, duration: 1000000, type: "spinner", id, theme });
        return id;
    }

    removeSpinner(id: string): void {
        const { removeToast } = window.ZOISCORE.useToastsStore.getState();
        removeToast(id);
    }
}

class DialogsManager {
    prompt({ message }: Omit<PromptDialogProps, "type" | "promise">): Promise<string | false> {
        const { setDialog } = window.ZOISCORE.useDialogStore.getState();
        return new Promise((resolve, reject) => {
            setDialog({
                type: "prompt",
                message,
                promise: { resolve, reject }
            });
        });
    }

    confirm({ message }: Omit<ConfirmDialogProps, "type" | "promise">): Promise<boolean> {
        const { setDialog } = window.ZOISCORE.useDialogStore.getState();
        return new Promise((resolve, reject) => {
            setDialog({
                type: "confirm",
                message,
                promise: { resolve, reject }
            });
        });
    }

    pick<T>({ message, options }: Omit<PickDialogProps<T>, "type" | "promise">): Promise<T | false> {
        const { setDialog } = window.ZOISCORE.useDialogStore.getState();
        return new Promise((resolve, reject) => {
            setDialog({
                type: "pick",
                message,
                options,
                promise: {
                    resolve: resolve as (value: unknown) => void,
                    reject
                },
            });
        });
    }
}

function App(): JSX.Element {
    const toasts = window.ZOISCORE.useToastsStore((state) => state.toasts);
    const dialog = window.ZOISCORE.useDialogStore((state) => state.dialog);

    return (
        <>
            <ToastsContainer>
                {
                    toasts.map(({ title, message, type, duration, id, theme }) => {
                        return <Toast id={id} key={id} title={title} message={message} type={type} duration={duration} theme={theme} />;
                    })
                }
            </ToastsContainer>
            {
                dialog && <Dialog dialog={dialog} />
            }
        </>
    );
}

class VirtualDOM extends HTMLElement {
    disconnectedCallback() {
        ServerShowBeep("VirtualDOM was removed, chaos is coming...", 5000, {});
    }
}

export interface ToastsStore {
    toasts: ToastProps[]
    addToast: (toast: ToastProps) => void
    removeToast: (id: string) => void
    clearToasts: () => void
}

export interface DialogStore {
    dialog: DialogProps | null
    setDialog: (props: DialogProps) => void
    clearDialog: () => void
}

export const useToastsStore = create<ToastsStore>((set) => ({
    toasts: [],
    addToast: (toast) => set((state) => ({ toasts: [...state.toasts, toast] })),
    removeToast: (id) => {
        return set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
    },
    clearToasts: () => set({ toasts: [] })
}));

export const useDialogStore = create<DialogStore>((set) => ({
    dialog: null,
    setDialog: (props: DialogProps) => set({ dialog: props }),
    clearDialog: () => set({ dialog: null })
}));

export function initVirtualDOM(): void {
    customElements.define("zc-virtual-dom", VirtualDOM);
    const virtualDOM = document.createElement("zc-virtual-dom");
    document.body.append(virtualDOM);
    ReactDOM.createRoot(document.getElementsByTagName("zc-virtual-dom")[0]).render(<App />);
}

export const toastsManager = new ToastsManager();
export const dialogsManager = new DialogsManager();
