import { MOD_DATA, ModData } from ".";
import { logger } from "./logging";
import { toastsManager } from "./toasts";
import { addDynamicClass } from "./ui";

const avatarsCache = new Map<string, string>();

interface GithubCommit {
    sha: string
    author?: {
        login: string
        id: number
        avatar_url?: string
    }
    committer?: {
        login: string
        id: number
        avatar_url?: string
    }
}


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

    const commitsList = document.createElement('div');
    commitsList.style.display = 'flex';
    commitsList.style.flexDirection = 'column';
    commitsList.style.gap = '16px';

    for (const commitData of data.changes) {
        const commitElement = createCommitElement(commitData);
        if (commitElement) commitsList.appendChild(commitElement);
    }

    content.appendChild(commitsList);

    modal.appendChild(header);
    modal.appendChild(content);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    overlay.onclick = (e) => {
        if (e.target === overlay) document.body.removeChild(overlay);
    };

    closeBtn.onclick = () => document.body.removeChild(overlay);
    document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') {
            document.body.removeChild(overlay);
            document.removeEventListener('keydown', handler);
        }
    });
}

function createCommitElement(changelogCommit: NonNullable<ModData["changelog"]>["data"]["changes"][number]) {
    try {
        const commitDiv = document.createElement('div');
        commitDiv.style.cssText = `
            display: flex;
            gap: 12px;
            align-items: center;
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            transition: all 0.2s;
        `;
        commitDiv.onmouseover = () => commitDiv.style.borderColor = "#3b82f6";
        commitDiv.onmouseout = () => commitDiv.style.borderColor = "#e5e7eb";

        const avatar = document.createElement('img');
        avatar.src = changelogCommit.author.avatar_url;
        avatar.style.cssText = `
            width: 48px;
            height: 48px;
            border-radius: 50%;
            flex-shrink: 0;
        `;

        const info = document.createElement("div");
        info.style.flex = "1";
        info.style.position = "relative";

        const author = document.createElement("div");
        author.textContent = changelogCommit.author.name;
        author.style.fontWeight = "600";
        author.style.marginBottom = "4px";

        const message = document.createElement("div");
        message.textContent = changelogCommit.message;
        message.style.cssText = "color: #374151; line-height: 1.4;";

        
        const tags = document.createElement("div");
        tags.style.cssText = "display: flex; gap: 4px; position: absolute; right: 2px; top: 2px;";

        for (const tag of changelogCommit.tags) {
            const tagEl = document.createElement("p");
            tagEl.textContent = tag;
            addDynamicClass(tagEl, {
                base: {
                    fontSize: "0.85em",
                    padding: "2px 6px",
                    borderRadius: "6px",
                    background: tag === "fix" ? "#f9b4b4" : tag === "feature" ? "#cbffcbc7" : "#a1e0f4",
                    color: tag === "fix" ? "#771515" : tag === "feature" ? "#147914" : "#09093e",
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: tag === "fix" ? "#ca6565" : tag === "feature" ? "#4eea4e" : "#66adec"
                }
            });
            tags.append(tagEl);
        }
        
        info.append(author, message, tags);

        commitDiv.style.cursor = 'pointer';
        commitDiv.onclick = () => {
            window.open(changelogCommit.commit_url, "_blank");
        };

        commitDiv.appendChild(avatar);
        commitDiv.appendChild(info);

        return commitDiv;
    } catch (err) {
        logger.error(`Failed to load commit ${changelogCommit.sha}:`, err);
        return null;
    }
}