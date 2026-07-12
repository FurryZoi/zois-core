import { MOD_DATA } from ".";
import { logger } from "./logging";
import { toastsManager } from "./toasts";

class GitHubAPI {
    private static baseUrl = 'https://api.github.com';

    private static getHeaders(): HeadersInit {
        const headers: HeadersInit = {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'GitHubAPI-Client'
        };

        return headers;
    }

    public static async getCommit(sha: string): Promise<any> {
        const effectiveOwner = MOD_DATA.changelog?.owner;
        const effectiveRepo = MOD_DATA.changelog?.repo;
        const url = `${GitHubAPI.baseUrl}/repos/${effectiveOwner}/${effectiveRepo}/commits/${sha}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            logger.error(`GitHub API error: ${response.status} ${error.message || response.statusText}`);
            return null;
        }

        return await response.json();
    }
}

export async function showChangelogModal(): Promise<void> {
    const changelog = MOD_DATA.changelog!;

    const id = toastsManager.spinner({
        message: "Preparing changelog..."
    });

    const { owner, repo, data } = changelog;

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

    for (const commitData of data) {
        const commitElement = await createCommitElement(commitData, owner, repo);
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

    toastsManager.removeSpinner(id);
}

async function createCommitElement(commitData: any, owner: string, repo: string): Promise<HTMLElement | null> {
    try {
        const fullCommit = await GitHubAPI.getCommit(commitData.hash);
        const changelogCommit = MOD_DATA.changelog?.data.find((c) => c.hash === commitData.hash)!;

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
        commitDiv.onmouseover = () => commitDiv.style.borderColor = '#3b82f6';
        commitDiv.onmouseout = () => commitDiv.style.borderColor = '#e5e7eb';

        const avatar = document.createElement('img');
        avatar.src = fullCommit?.author?.avatar_url || fullCommit?.committer?.avatar_url || 'https://github.com/identicons/default.png';
        avatar.style.cssText = `
            width: 48px;
            height: 48px;
            border-radius: 50%;
            flex-shrink: 0;
        `;

        const info = document.createElement('div');
        info.style.flex = '1';

        const author = document.createElement('div');
        author.textContent = changelogCommit.author;
        author.style.fontWeight = '600';
        author.style.marginBottom = '4px';

        const message = document.createElement('div');
        message.textContent = changelogCommit.message;
        message.style.cssText = 'color: #374151; line-height: 1.4;';

        info.append(author, message);

        commitDiv.style.cursor = 'pointer';
        commitDiv.onclick = () => {
            window.open(`https://github.com/${owner}/${repo}/commit/${commitData.hash}`, '_blank');
        };

        commitDiv.appendChild(avatar);
        commitDiv.appendChild(info);

        return commitDiv;
    } catch (err) {
        logger.error(`Failed to load commit ${commitData.hash}:`, err);
        return null;
    }
}