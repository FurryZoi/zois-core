import { createElement, Crown, Hand, HandGrab, Heart } from "lucide";
import { MOD_DATA, ModData } from ".";
import { logger } from "./logging";
import { toastsManager } from "./toasts";
import { addDynamicClass } from "./ui";
import handIcon from "./assets/icons/hand.svg";

export type ChangelogEntryTag = "feature" | "chore" | "fix" | "localization";

interface TagProperties {
    name: string
    coloring: {
        text: string
        background: string
        border: string
    }
}

const TAGS: Record<ChangelogEntryTag, TagProperties> = {
    fix: {
        name: "Fix",
        coloring: {
            text: "#771515",
            background: "#f9b4b4",
            border: "#ca6565"
        }
    },
    chore: {
        name: "Chore",
        coloring: {
            text: "#464646",
            background: "#f2f2f2",
            border: "#e2e2e2"
        }
    },
    feature: {
        name: "Feature",
        coloring: {
            text: "#147914",
            background: "#cbffcbc7",
            border: "#4eea4e"
        }
    },
    localization: {
        name: "Localization",
        coloring: {
            text: "#09093e",
            background: "#a1e0f4",
            border: "#66adec"
        }
    }
};

export function showChangelogModal() {
    const changelog = MOD_DATA.changelog!;
    const { data } = changelog;

    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background-color: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        font-family: ${CommonGetFontName()};
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
        background: #ffffff;
        color: #1f2937;
        width: 90%;
        max-width: 720px;
        max-height: 85vh;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
        padding: 0.65em;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;

    const title = document.createElement('h2');
    title.textContent = `Changelog · ${MOD_DATA.name} v${MOD_DATA.version}`;
    title.style.cssText = 'margin: 0; font-size: 1.5rem; font-weight: 600;';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #6b7280;
        padding: 4px 8px;
        border-radius: 6px;
    `;
    closeBtn.onmouseover = () => closeBtn.style.color = '#1f2937';
    closeBtn.onmouseout = () => closeBtn.style.color = '#6b7280';

    header.appendChild(title);
    header.appendChild(closeBtn);

    const content = document.createElement('div');
    content.style.cssText = `
        padding: 16px 24px;
        overflow-y: auto;
        flex: 1;
    `;

    const contributorsTitle = document.createElement("p");
    contributorsTitle.style.cssText = `
        font-size: 22px;
        margin: 0;
    `;
    contributorsTitle.textContent = "Contributors";


    const contributorsList = document.createElement("div");
    contributorsList.style.display = "flex";
    contributorsList.style.justifyContent = "center";
    contributorsList.style.flexWrap = "wrap";
    contributorsList.style.gap = "16px";
    contributorsList.style.padding = "16px";

    for (const contributor of data.contributors) {
        const container = document.createElement("div");
        container.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;  
        `;

        const imageContainer = document.createElement("div");
        imageContainer.style.cssText = `
            position: relative;
            width: 100px;
            height: 100px;
            border: 1px solid black;
            border-radius: 50%;
            overflow: hidden;
        `;

        const handGrabIcon = document.createElement("img");
        handGrabIcon.src = handIcon;
        handGrabIcon.style.cssText = `
            position: absolute;
            top: 0;
            left: 35%;
            width: 40px;
            height: 40px;
            line-height: 1;
            pointer-events: none;
            filter: drop-shadow(0 3px 4px rgba(0,0,0,0.45));
            z-index: 10;
            transform-origin: center bottom;
            animation: zcStrokeUD 1.3s ease-in-out infinite;
        `;

        const hearts = [
            { left: "18%", top: "35%", duration: "2.5s", size: "16px" },
            { left: "25%", top: "10%", duration: "2s", size: "10px" },
            { left: "40%", top: "40%", duration: "1.0s", size: "12px" },
            { left: "55%", top: "28%", duration: "4.5s", size: "14px" },
            { left: "35%", top: "48%", duration: "1.0s", size: "15px" },
            { left: "65%", top: "42%", duration: "1.5s", size: "13px" },
        ];

        hearts.forEach((h) => {
            const heart = createElement(Heart, { fill: "#ff4d6d", stroke: "#ff4d6d" });
            heart.style.cssText = `
                position: absolute;
                pointer-events: none;
                z-index: 5;
                animation: zcFloatHeart ${h.duration} ease-out infinite;
                left: ${h.left};
                top: ${h.top};
                width: ${h.size};
                height: ${h.size};
            `;
            imageContainer.append(heart);
        });

        const image = document.createElement("img");
        image.src = contributor.avatar_url;
        image.style.cssText = `
            width: 100%;
            height: 100%;
            border-radius: 50%;
        `;

        imageContainer.append(image, handGrabIcon);

        const name = document.createElement("span");
        name.textContent = contributor.name;
        name.style.textAlign = "center";
        container.append(imageContainer, name);

        if (contributor.is_owner) {
            const ownerLabelContainer = document.createElement("div");
            ownerLabelContainer.style.cssText = `
                display: flex;
                align-items: center;
                gap: 6px;
                border-radius: 6px;
                padding: 2px 4px;
                font-size: 10px;
                background: #fbfb142e;
                border: 1px solid #60600a;
            `;
            const crown = createElement(Crown, { width: "10px", height: "10px", fill: "#ffe300" });
            const label = document.createElement("span");
            label.textContent = "Project owner";
            ownerLabelContainer.append(crown, label);
            container.append(ownerLabelContainer);
        }

        contributorsList.append(container);
    }

    const changesTitle = document.createElement("p");
    changesTitle.style.cssText = `
        font-size: 22px;
        margin: 0;
    `;
    changesTitle.textContent = "Changes";

    const commitsList = document.createElement('div');
    commitsList.style.display = 'flex';
    commitsList.style.flexDirection = 'column';
    commitsList.style.gap = '16px';
    commitsList.style.marginTop = "16px";

    for (const commitData of data.changes) {
        const commitElement = createCommitElement(data, commitData.sha);
        if (commitElement) commitsList.append(commitElement);
    }

    content.append(contributorsTitle, contributorsList, changesTitle, commitsList);

    modal.append(header);
    modal.append(content);
    overlay.append(modal);
    document.body.append(overlay);

    const exitHandler = () => {
        document.removeEventListener("keydown", keyDownHandler, { capture: true });
        document.body.removeChild(overlay);
    };

    const keyDownHandler = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopPropagation();
            exitHandler();
        }
    };

    overlay.onclick = (e) => {
        if (e.target === overlay) exitHandler();
    };

    closeBtn.onclick = exitHandler;
    document.addEventListener("keydown", keyDownHandler, { capture: true });
}

function createCommitElement(changelogData: NonNullable<ModData["changelog"]>["data"], commitSha: string) {
    try {
        const commit = changelogData.changes.find((c) => c.sha === commitSha);
        if (!commit) {
            logger.warn(`Commit ${commitSha} is not exists in changelog bundle`);
            return;
        }
        const author = changelogData.contributors.find((c) => c.name === commit?.author);
        if (!author) {
            logger.warn(`Author ${commit.author} is not exists in changelog bundle`);
            return;
        }

        const commitWrapper = document.createElement("div");
        commitWrapper.style.cssText = `
            background: #e8e8f4;
            border-radius: 8px;
        `;

        const commitContainer = document.createElement('div');
        commitContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: white;
            transition: all 0.2s;
        `;
        commitWrapper.append(commitContainer);
        commitContainer.onmouseover = () => commitContainer.style.borderColor = "#3b82f6";
        commitContainer.onmouseout = () => commitContainer.style.borderColor = "#e5e7eb";

        const avatarAndInfo = document.createElement("div");
        avatarAndInfo.style.cssText = `
            display: flex;
            gap: 12px;
            align-items: center;
        `;
        commitContainer.append(avatarAndInfo);

        const avatar = document.createElement('img');
        avatar.src = author.avatar_url;
        avatar.style.cssText = `
            width: 48px;
            height: 48px;
            border-radius: 50%;
            flex-shrink: 0;
        `;
        avatarAndInfo.append(avatar);

        const info = document.createElement("div");
        info.style.flex = "1";
        info.style.position = "relative";
        avatarAndInfo.append(info);

        const authorName = document.createElement("div");
        authorName.textContent = author.name;
        authorName.style.fontWeight = "600";
        authorName.style.marginBottom = "4px";
        info.append(authorName);

        const message = document.createElement("div");
        message.textContent = commit.message;
        message.style.cssText = "color: #374151; line-height: 1.4;";
        info.append(message);

        if (commit.note) {
            const note = document.createElement("div");
            note.textContent = commit.note ?? "";
            note.style.cssText = "color: rgb(69, 75, 83); line-height: 1; font-size: 0.8em; padding: 4px;";
            commitWrapper.append(note);
        }

        const tags = document.createElement("div");
        tags.style.cssText = "display: flex; gap: 4px; position: absolute; right: 2px; top: 2px;";
        info.append(tags);

        for (const tag of commit.tags) {
            const tagEl = document.createElement("p");
            tagEl.textContent = TAGS[tag].name;
            addDynamicClass(tagEl, {
                base: {
                    fontSize: "0.85em",
                    padding: "2px 6px",
                    margin: "0",
                    borderRadius: "6px",
                    background: TAGS[tag].coloring.background,
                    color: TAGS[tag].coloring.text,
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: TAGS[tag].coloring.border
                }
            });
            tags.append(tagEl);
        }

        commitContainer.style.cursor = 'pointer';
        commitContainer.onclick = () => {
            window.open(commit.commit_url, "_blank");
        };

        return commitWrapper;
    } catch (err) {
        logger.error(`Failed to load commit ${commitSha}:`, err);
        return null;
    }
}