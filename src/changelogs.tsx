
import { createElement, Crown, Heart } from "lucide";
import { MOD_DATA, ModData } from ".";
import { logger } from "./logging";
import { getDynamicClass, getDynamicKeyframes } from "./ui";
import {
    Dialog,
    DialogButton,
    DialogButtons,
    DialogCloseButton
} from "./dialogs";
import handIcon from "./assets/icons/hand.svg";

export type ChangelogEntryTag = "feature" | "chore" | "fix" | "localization";

interface TagProperties {
    name: string;
    coloring: {
        text: string;
        background: string;
        border: string;
    };
}

const TAGS: Record<ChangelogEntryTag, TagProperties> = {
    fix: {
        name: "Fix",
        coloring: {
            text: "var(--tmd-text, #771515)",
            background: "var(--tmd-invalid, #f9b4b4)",
            border: "var(--tmd-invalid-hover, #ca6565)"
        }
    },
    chore: {
        name: "Chore",
        coloring: {
            text: "var(--tmd-text, #464646)",
            background: "var(--tmd-element-hint, #f2f2f2)",
            border: "var(--tmd-element-hover, #e2e2e2)"
        }
    },
    feature: {
        name: "Feature",
        coloring: {
            text: "var(--tmd-text, #147914)",
            background: "var(--tmd-allowed, #cbffcb)",
            border: "var(--tmd-allowed-hover, #4eea4e)"
        }
    },
    localization: {
        name: "Localization",
        coloring: {
            text: "var(--tmd-text, #09093e)",
            background: "var(--tmd-equipped, #a1e0f4)",
            border: "var(--tmd-equipped-hover, #66adec)"
        }
    }
};

const HEARTS = [
    { left: "8%", top: "25%", duration: "2.5s", size: "15px", delay: "0s" },
    { left: "24%", top: "8%", duration: "2s", size: "11px", delay: "0.4s" },
    { left: "43%", top: "38%", duration: "3s", size: "13px", delay: "0.8s" },
    { left: "62%", top: "12%", duration: "2.2s", size: "16px", delay: "0.2s" },
    { left: "82%", top: "35%", duration: "2.8s", size: "12px", delay: "0.6s" },
];

const HEART_ANIMATION = getDynamicKeyframes("zcChangelogHeart", {
    "0%": {
        opacity: "0",
        transform: "translateY(8px) scale(0.4) rotate(-15deg)"
    },
    "20%": {
        opacity: "1",
        transform: "translateY(0) scale(1) rotate(0deg)"
    },
    "75%": {
        opacity: "0.9",
        transform: "translateY(-20px) scale(1.1) rotate(15deg)"
    },
    "100%": {
        opacity: "0",
        transform: "translateY(-36px) scale(0.5) rotate(25deg)"
    }
});

const VERSION_ANIMATION = getDynamicKeyframes("zcChangelogVersion", {
    "0%": {
        opacity: "0",
        transform: "translateY(12px)"
    },
    "100%": {
        opacity: "1",
        transform: "translateY(0)"
    }
});

function createHeart(h: typeof HEARTS[number]): SVGSVGElement {
    const heart = createElement(Heart) as SVGSVGElement;

    heart.setAttribute("fill", "#ff4d6d");
    heart.setAttribute("stroke", "#ff4d6d");

    heart.style.position = "absolute";
    heart.style.pointerEvents = "none";
    heart.style.zIndex = "5";
    heart.style.animation = `${HEART_ANIMATION} ${h.duration} ease-in-out ${h.delay} infinite`;
    heart.style.left = h.left;
    heart.style.top = h.top;
    heart.style.width = h.size;
    heart.style.height = h.size;

    return heart;
}

function createCrown(): SVGSVGElement {
    const crown = createElement(Crown) as SVGSVGElement;

    crown.setAttribute("width", "12");
    crown.setAttribute("height", "12");
    crown.setAttribute("fill", "#ffe300");

    return crown;
}

function formatDate(date: string): string {
    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

function createSectionIcon(icon: "users" | "changes"): HTMLSpanElement {
    const sectionIconClassName = getDynamicClass({
        base: {
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "27px",
            height: "27px",
            borderRadius: "8px",
            color: "var(--tmd-text, #555555)"
        }
    });

    const element = document.createElement("span");
    element.className = sectionIconClassName;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");

    if (icon === "users") {
        svg.innerHTML = `
            <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="10" cy="7" r="4"/>
            <path d="M20 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        `;
    } else {
        svg.innerHTML = `
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/>
        `;
    }

    element.append(svg);

    return element;
}

export function showChangelogModal(): void {
    const changelog = MOD_DATA.changelog;

    if (!changelog) return;

    const versions = [...changelog.data].reverse();

    const headerClassName = getDynamicClass({
        base: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1em",
            paddingBottom: "1em",
            borderBottom: "1px solid var(--tmd-element-hover, #e5e7eb)",
            flexShrink: "0"
        }
    });

    const titleClassName = getDynamicClass({
        base: {
            margin: "0",
            color: "var(--tmd-text, #1f2937)",
            fontSize: "1.5em",
            fontWeight: "800",
            letterSpacing: "-0.03em"
        }
    });

    const subtitleClassName = getDynamicClass({
        base: {
            display: "block",
            marginTop: "0.25em",
            color: "var(--tmd-text-disabled, #888888)",
            fontSize: "0.85em"
        }
    });

    const scrollClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            gap: "1.8em",
            flex: "1 1 auto",
            minHeight: "0",
            overflowY: "auto",
            overflowX: "hidden",
            padding: "0.7em 0.3em 1em"
        }
    });

    const emptyClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.7em",
            padding: "3em 1em",
            color: "var(--tmd-text-disabled, #888888)",
            textAlign: "center"
        }
    });

    let dialog: HTMLDialogElement;

    const close = () => {
        document.removeEventListener("keydown", keyDownHandler, { capture: true });

        if (dialog.open) {
            dialog.close();
        }

        dialog.remove();
    };

    const keyDownHandler = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;

        e.preventDefault();
        e.stopPropagation();
        close();
    };

    const dialogContent = (
        <Dialog wide>
            <div class={headerClassName}>
                <div>
                    <h2 class={titleClassName}>
                        Changelog
                    </h2>
                    <span class={subtitleClassName}>
                        {MOD_DATA.name} · {versions.length} releases
                    </span>
                </div>
                <DialogCloseButton onClick={close} />
            </div>
            <div class={scrollClassName}>
                {versions.length === 0 && (
                    <div class={emptyClassName}>
                        <span style={{ fontSize: "2.5em" }}>♡</span>
                        <strong>No changelog entries yet</strong>
                        <span>There are no published changes for this mod.</span>
                    </div>
                )}
                {versions.map((versionData, versionIndex) => (
                    <VersionSection
                        versionData={versionData}
                        isLatest={versionIndex === 0}
                    />
                ))}
            </div>
        </Dialog>
    ) as HTMLDialogElement;

    dialog = dialogContent;
    dialog.setAttribute("data-zc-dialog-type", "changelog");

    dialog.addEventListener("cancel", (e) => {
        e.preventDefault();
        close();
    });

    dialog.addEventListener("click", (e) => {
        if (e.target === dialog) {
            close();
        }
    });

    document.addEventListener("keydown", keyDownHandler, { capture: true });

    document.body.append(dialog);
    dialog.showModal();
}

interface VersionSectionProps {
    versionData: NonNullable<ModData["changelog"]>["data"][number];
    isLatest: boolean;
}

function VersionSection({ versionData, isLatest }: VersionSectionProps) {
    const versionClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            gap: "1.1em",
            padding: "0 0 1.5em",
            animation: `${VERSION_ANIMATION} 0.45s ease both`
        }
    });

    const versionHeaderClassName = getDynamicClass({
        base: {
            display: "flex",
            alignItems: "center",
            gap: "0.7em",
            flexWrap: "wrap"
        },
        "::after": {
            content: '""',
            flex: "1 1 auto",
            minWidth: "30px",
            height: "4px",
            backgroundImage: "radial-gradient(circle, var(--tmd-text-disabled, black) 1px, transparent 1.5px)",
            backgroundSize: "8px 4px",
            backgroundRepeat: "repeat-x",
            opacity: "0.65"
        }
    });

    const versionTitleClassName = getDynamicClass({
        base: {
            color: "var(--tmd-accent, #1f2937)",
            fontSize: "1em",
            fontWeight: "800"
        }
    });

    const versionDateClassName = getDynamicClass({
        base: {
            color: "var(--tmd-text, #888888)",
            fontSize: "1em",
            whiteSpace: "nowrap"
        }
    });

    const latestClassName = getDynamicClass({
        base: {
            fontSize: "0.65em",
            fontWeight: "700",
            color: "var(--tmd-allowed, #fff)",
            background: "var(--tmd-element-hint, #45be62)",
            padding: "0.3em 0.55em",
            borderRadius: "5px"
        }
    });

    const sectionClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            gap: "0.8em"
        }
    });

    const sectionHeaderClassName = getDynamicClass({
        base: {
            display: "flex",
            alignItems: "center",
            gap: "0.55em",
            color: "var(--tmd-text, #303030)",
            fontSize: "1em",
            fontWeight: "750"
        }
    });

    const contributorsClassName = getDynamicClass({
        base: {
            display: "flex",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1.2em",
            padding: "0.3em 0.1em"
        }
    });

    const contributorClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.5em",
            width: "150px",
            color: "var(--tmd-text, #1f2937)"
        }
    });

    const avatarContainerClassName = getDynamicClass({
        base: {
            position: "relative",
            width: "114px",
            height: "114px",
            border: "2px solid var(--tmd-accent, #d1d5db)",
            borderRadius: "50%",
            overflow: "hidden",
            background: "var(--tmd-element-hint, #f3f4f6)",
            boxShadow: "0 3px 12px rgba(0, 0, 0, 0.12)"
        }
    });

    const avatarClassName = getDynamicClass({
        base: {
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "50%"
        }
    });

    const handClassName = getDynamicClass({
        base: {
            position: "absolute",
            top: "0",
            left: "35%",
            width: "40px",
            height: "40px",
            lineHeight: "1",
            pointerEvents: "none",
            filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.45))",
            zIndex: "10",
            transformOrigin: "center bottom",
            animation: "zcStrokeUD 1.3s ease-in-out infinite"
        }
    });

    const contributorNameClassName = getDynamicClass({
        base: {
            color: "var(--tmd-text, #1f2937)",
            fontWeight: "650",
            fontSize: "0.9em",
            textAlign: "center",
            overflowWrap: "anywhere"
        }
    });

    const ownerClassName = getDynamicClass({
        base: {
            display: "flex",
            alignItems: "center",
            gap: "0.35em",
            borderRadius: "6px",
            padding: "0.25em 0.5em",
            fontSize: "0.68em",
            fontWeight: "700",
            background: "var(--tmd-crafted, rgba(255, 255, 14, 0.34))",
            border: "1px solid var(--tmd-crafted-hover, rgba(216, 216, 48, 1))",
            color: "var(--tmd-text, #60600a)"
        }
    });

    const changesClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            gap: "0.65em"
        }
    });

    return (
        <section class={versionClassName}>
            <div class={versionHeaderClassName}>
                <span class={versionTitleClassName}>
                    v{versionData.version}
                </span>
                <span class={versionDateClassName}>
                    {formatDate(versionData.date)}
                </span>
                {isLatest && (
                    <span class={latestClassName}>
                        Latest
                    </span>
                )}
            </div>
            <section class={sectionClassName}>
                <div class={sectionHeaderClassName}>
                    {createSectionIcon("users")}
                    <span>Contributors</span>
                    <span
                        style={{
                            color: "var(--tmd-text-disabled, #888888)",
                            fontSize: "0.8em",
                            fontWeight: "500"
                        }}
                    >
                        ({versionData.contributors.length})
                    </span>
                </div>
                <div class={contributorsClassName}>
                    {versionData.contributors.map((contributor) => (
                        <div class={contributorClassName}>
                            <div class={avatarContainerClassName}>
                                {HEARTS.map((heart) => createHeart(heart))}
                                <img
                                    src={contributor.avatar_url}
                                    class={avatarClassName}
                                    alt={contributor.name}
                                />
                                <img
                                    src={handIcon}
                                    class={handClassName}
                                    alt=""
                                />
                            </div>
                            <span class={contributorNameClassName}>
                                {contributor.name}
                            </span>
                            {contributor.is_owner && (
                                <div class={ownerClassName}>
                                    {createCrown()}
                                    <span>Project owner</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
            <section class={sectionClassName}>
                <div class={sectionHeaderClassName}>
                    {createSectionIcon("changes")}
                    <span>Changes</span>
                    <span
                        style={{
                            color: "var(--tmd-text-disabled, #888888)",
                            fontSize: "0.8em",
                            fontWeight: "500"
                        }}
                    >
                        ({versionData.changes.length})
                    </span>
                </div>
                <div class={changesClassName}>
                    {versionData.changes.map((commit) => (
                        <CommitCard
                            versionData={versionData}
                            commitSha={commit.sha}
                        />
                    ))}
                </div>
            </section>
        </section>
    );
}

interface CommitCardProps {
    versionData: NonNullable<ModData["changelog"]>["data"][number];
    commitSha: string;
}

function CommitCard({ versionData, commitSha }: CommitCardProps) {
    const commitClassName = getDynamicClass({
        base: {
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px",
            border: "2px solid var(--tmd-element-hover, #e5e7eb)",
            borderRadius: "8px",
            background: "var(--tmd-element, #f7f7f7)",
            color: "var(--tmd-text, #1f2937)",
            cursor: "pointer",
        },
        hover: {
            borderColor: "var(--tmd-accent, #3b82f6)",
        }
    });

    const commitAvatarClassName = getDynamicClass({
        base: {
            display: "block",
            flex: "0 0 64px",
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            objectFit: "cover",
            background: "var(--tmd-element-hint, #f3f4f6)"
        }
    });

    const commitBodyClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: "1 1 auto",
            alignSelf: "stretch",
            minWidth: "0",
            gap: "0.65em",
            padding: "0.15em 0 0.8em"
        }
    });

    const commitInfoClassName = getDynamicClass({
        base: {
            display: "flex",
            flexDirection: "column",
            gap: "0.25em",
            minWidth: "0"
        }
    });

    const commitAuthorClassName = getDynamicClass({
        base: {
            color: "var(--tmd-text, #1f2937)",
            fontWeight: "750",
            fontSize: "1em"
        }
    });

    const commitMessageClassName = getDynamicClass({
        base: {
            color: "var(--tmd-text, #374151)",
            lineHeight: "1.45",
            overflowWrap: "anywhere",
            fontSize: "0.95em"
        }
    });

    const tagsClassName = getDynamicClass({
        base: {
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35em",
            position: "absolute",
            right: "0.85em",
            top: "0.65em",
        }
    });

    const tagClassName = getDynamicClass({
        base: {
            display: "inline-flex",
            alignItems: "center",
            padding: "0.2em 0.55em",
            borderRadius: "5px",
            fontSize: "0.72em",
            fontWeight: "750",
            borderWidth: "1px",
            borderStyle: "solid",
            whiteSpace: "nowrap"
        }
    });

    const commitShaClassName = getDynamicClass({
        base: {
            position: "absolute",
            right: "0.85em",
            bottom: "0.65em",
            color: "var(--tmd-text-disabled, #888888)",
            fontSize: "0.7em",
            whiteSpace: "nowrap"
        }
    });

    const commitNoteClassName = getDynamicClass({
        base: {
            padding: "0.55em 0.7em",
            borderLeft: "3px solid var(--tmd-accent, #a1a1aa)",
            background: "var(--tmd-element-hover, #ffffff)",
            color: "var(--tmd-text-disabled, #555555)",
            fontSize: "0.85em",
            lineHeight: "1.45",
            overflowWrap: "anywhere"
        }
    });

    const commit = versionData.changes.find((item) => item.sha === commitSha);

    if (!commit) {
        logger.warn(`Commit ${commitSha} is not exists in changelog bundle`);
        return null;
    }

    const author = versionData.contributors.find((contributor) => contributor.name === commit.author);

    if (!author) {
        logger.warn(`Author ${commit.author} is not exists in changelog bundle`);
        return null;
    }

    return (
        <div
            class={commitClassName}
            onClick={() => {
                window.open(commit.commit_url, "_blank", "noopener,noreferrer");
            }}
            title="Open commit on GitHub"
        >
            <img
                src={author.avatar_url}
                class={commitAvatarClassName}
                alt={author.name}
            />
            <div class={commitBodyClassName}>
                <div class={commitInfoClassName}>
                    <span class={commitAuthorClassName}>
                        {author.name}
                    </span>

                    <span class={commitMessageClassName}>
                        {commit.message}
                    </span>
                </div>
                {commit.note && (
                    <div class={commitNoteClassName}>
                        {commit.note}
                    </div>
                )}
            </div>
            <div class={tagsClassName}>
                {commit.tags.map((tag) => {
                    const tagData = TAGS[tag];

                    if (!tagData) return null;

                    return (
                        <span
                            class={tagClassName}
                            style={{
                                background: tagData.coloring.background,
                                color: tagData.coloring.text,
                                borderColor: tagData.coloring.border
                            }}
                        >
                            {tagData.name}
                        </span>
                    );
                })}
            </div>
            <span class={commitShaClassName}>
                {commit.sha.slice(0, 7)} ↗
            </span>
        </div>
    );
}
