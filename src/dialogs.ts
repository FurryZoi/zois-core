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

function createDialog<T>(dialog: Omit<ConfirmDialogProps, "promise"> | Omit<PromptDialogProps, "promise"> | Omit<PickDialogProps<T>, "promise">): Promise<string | T | boolean> {
    return new Promise((resolve, reject) => {

        let inputOrSelectElement: HTMLInputElement | HTMLSelectElement | null = null;

        const clear = () => {
            _dialog.remove();
            background.remove();
            document.removeEventListener("keydown", handleKeyDown);
        };

        const submit = () => {
            clear();
            if (dialog.type === "prompt") {
                resolve(inputOrSelectElement!.value);
            }
            if (dialog.type === "confirm") {
                resolve(true);
            }
            if (dialog.type === "pick") {
                resolve(inputOrSelectElement!.value);
            }
        };

        const cancel = () => {
            clear();
            resolve(false);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
            }

            if (e.key === "Enter") submit();
            if (e.key === "Escape") cancel();
        };

        document.addEventListener('keydown', handleKeyDown);

        const background = document.createElement("div");
        background.style.cssText = "position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 20; opacity: 0.5; background: black;";

        const _dialog = document.createElement("div");
        _dialog.classList.add("zcDialog");
        _dialog.setAttribute("data-zc-dialog-type", dialog.type);
        _dialog.style.fontFamily = CommonGetFontName();

        const message = document.createElement("p");
        message.textContent = dialog.message;
        _dialog.append(message);

        switch (dialog.type) {
            case "confirm": {
                break;
            }
            case "prompt": {
                const input = document.createElement("input");
                input.style.cssText = "color: white; margin-top: 1px; width: 90%; background: rgb(82, 89, 104); border: none; border-radius: 4px; padding: 0.45em;";
                inputOrSelectElement = input;
                _dialog.append(input);
                break;
            }
            case "pick": {
                const select = document.createElement("select");
                select.style.cssText = "cursor: pointer; width: 90%; background: rgb(82, 89, 104); border: none; padding: 0.4em; color: white; border-radius: 4px;";
                dialog.options.forEach((o) => {
                    const option = document.createElement("option");
                    option.setAttribute("key", o.name);
                    option.text = o.name;
                    select.append(option);
                });
                inputOrSelectElement = select;
                _dialog.append(select);
                break;
            }
        }

        const buttons = document.createElement("div");
        buttons.style.cssText = "display: flex; justify-content: end; column-gap: 0.75em; width: 90%; padding: 0.9em 0;";

        const cancelBtn = document.createElement("button");
        cancelBtn.textContent = "Cancel";
        cancelBtn.addEventListener("click", cancel);

        const submitBtn = document.createElement("button");
        submitBtn.textContent = "Ok";
        submitBtn.addEventListener("click", submit);

        buttons.append(cancelBtn, submitBtn);
        _dialog.append(buttons);
        document.body.append(_dialog, background);
        if (inputOrSelectElement) inputOrSelectElement.focus();
    });
}

export class DialogsManager {
    private process<T>(dialogProps: Omit<ConfirmDialogProps, "promise"> | Omit<PromptDialogProps, "promise"> | Omit<PickDialogProps<T>, "promise">) {
        return createDialog(dialogProps);
    }

    public prompt({ message }: Omit<PromptDialogProps, "type" | "promise">): Promise<string | false> {
        //@ts-expect-error
        return this.process({
            type: "prompt",
            message,
        });
    }

    public confirm({ message }: Omit<ConfirmDialogProps, "type" | "promise">): Promise<boolean> {
        //@ts-expect-error
        return this.process({
            type: "confirm",
            message,
        });
    }

    public pick<T>({ message, options }: Omit<PickDialogProps<T>, "type" | "promise">): Promise<T | false> {
        //@ts-expect-error
        return this.process({
            type: "pick",
            message,
            options
        });
    }
}


export const dialogsManager = new DialogsManager();