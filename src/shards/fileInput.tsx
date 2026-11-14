import { MOD_DATA } from "../index";
import { autosetFontSize, getDynamicClass, setFontFamily } from "../ui";
import { Shard, ShardContext } from "./base";

export interface FileInputShardContext extends ShardContext {
    title: string
    accept?: string;
    onFile?: (file: File) => void;
}

export class FileInputShard extends Shard<FileInputShardContext> {
    protected render(): Record<keyof NonNullable<FileInputShardContext["modules"]>, HTMLElement | SVGElement> {
        const rootClassName = getDynamicClass({
            base: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                minWidth: "0",
                boxSizing: "border-box",
                padding: "0.8em 1.2em",
                border: "2px dashed var(--tmd-accent, #777)",
                borderRadius: "0.65em",
                background: "var(--tmd-element, rgba(127,127,127,0.12))",
                color: "var(--tmd-text, black)",
                cursor: "pointer",
                transition: "background 140ms ease, border-color 140ms ease, box-shadow 140ms ease",
                fontFamily: "inherit",
                overflow: "hidden",
            },
            hover: {
                background: "var(--tmd-element-hover, rgba(127,127,127,0.22))",
                borderColor: "var(--tmd-accent-hover, var(--tmd-accent, #777))",
            },
            focus: {
                outline: "2px solid var(--tmd-accent-hover, var(--tmd-accent, #777))",
                outlineOffset: "3px",
            },
            active: {
                transform: "scale(0.99)",
            },
        });

        const dragOverClassName = getDynamicClass({
            base: {
                background: "var(--tmd-element-hover, rgba(127,127,127,0.28))",
                borderColor: "var(--tmd-accent-hover, var(--tmd-accent, #777))",
            },
        });

        const inputClassName = getDynamicClass({
            base: {
                position: "absolute",
                width: "1px",
                height: "1px",
                padding: "0",
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: "0",
            },
        });

        const contentClassName = getDynamicClass({
            base: {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "0",
                maxWidth: "100%",
                pointerEvents: "none",
            },
        });

        const textBlockClassName = getDynamicClass({
            base: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.2em",
                minWidth: "0",
                overflow: "hidden",
            },
        });

        const titleClassName = getDynamicClass({
            base: {
                display: "block",
                fontWeight: "600",
                lineHeight: "1.25",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            },
        });

        const hintClassName = getDynamicClass({
            base: {
                display: "block",
                opacity: "0.72",
                fontSize: "0.78em",
                lineHeight: "1.25",
                whiteSpace: "nowrap",
            },
        });

        const titleElement = (
            <span class={titleClassName}>
                {this.context.title}
            </span>
        ) as HTMLSpanElement;

        const hintElement = (
            <span class={hintClassName}>
                JSON files · Click or drop here
            </span>
        ) as HTMLSpanElement;

        const applyFile = (file: File) => {
            titleElement.textContent = file.name;
            hintElement.textContent = `${(file.size / 1024).toFixed(1)} KB · Click or drop to replace`;
            this.context.onFile?.(file);
        };

        const isAccepted = (file: File): boolean => {
            const accept = this.context.accept ?? ".json,application/json";
            const tokens = accept
                .split(",")
                .map((token) => token.trim().toLowerCase())
                .filter(Boolean);

            if (tokens.length === 0) return true;

            const fileName = file.name.toLowerCase();
            const fileType = (file.type || "").toLowerCase();

            return tokens.some((token) => {
                if (token.startsWith(".")) return fileName.endsWith(token);
                if (token.endsWith("/*")) return fileType.startsWith(token.slice(0, -1));
                return fileType === token;
            });
        };

        const root = (
            <label
                class={rootClassName}
                onDragEnter={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget.classList.add(dragOverClassName);
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (event.dataTransfer) {
                        event.dataTransfer.dropEffect = "copy";
                    }
                    event.currentTarget.classList.add(dragOverClassName);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                        event.currentTarget.classList.remove(dragOverClassName);
                    }
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.currentTarget.classList.remove(dragOverClassName);

                    const file = event.dataTransfer?.files?.[0];
                    if (!file) return;
                    if (!isAccepted(file)) return;
                    applyFile(file);
                }}
            >
                <input
                    class={inputClassName}
                    type="file"
                    accept={this.context.accept ?? ".json,application/json"}
                    aria-label="Choose a translation file"
                    onChange={(event) => {
                        const file = event.currentTarget.files?.[0];
                        if (!file) return;
                        applyFile(file);
                    }}
                />
                <span class={contentClassName}>
                    <span class={textBlockClassName}>
                        {titleElement}
                        {hintElement}
                    </span>
                </span>
            </label>
        ) as HTMLLabelElement;

        setFontFamily(root, MOD_DATA.fontFamily);

        return { base: root };
    }

    protected setContextStyles(): void {
        super.setContextStyles();
        autosetFontSize(this.body!.base as HTMLElement);
    }
}