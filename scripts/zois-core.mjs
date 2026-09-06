import fs from "fs/promises";
import path from "path";
import chalk from 'chalk';
import { Octokit } from "@octokit/rest";
import { existsSync } from "fs";
import { simpleGit } from "simple-git";
import { Terminal } from "./lib/terminal.mjs";

const octokit = new Octokit();
const terminal = new Terminal("zois-core");
const git = simpleGit();
const args = process.argv.slice(2);
const command = args[0];
const cwd = process.cwd();
const CHANGELOG_CONFIG_FILE_NAME = "changelog.config.json";
const CHANGELOG_BUNDLE_FILE_NAME = "changelog.json";

function getArg(name) {
    const arg = args.find((a) => a.startsWith("--" + name));
    if (arg) return arg.slice(name.length + 3);
    return null;
}

switch (command) {
    case "generate-changelog": {
        generateChangelog().catch((err) => {
            terminal.error(chalk.red("Script failed:"), err.message);
            process.exit(1);
        });
        break;
    }
    default: {
        terminal.log(chalk.red("Unknown command"), `"${chalk.cyan(command)}"`);
        terminal.log("Available commands:")
        terminal.log(`• ${chalk.cyan("generate-changelog")} — Generate changelog bundle`)
    }
}

async function getCommitsSince(owner, repo, sinceSha, perPage = 50) {
    const commits = [];
    let page = 1;
    let hasMore = true;

    try {
        while (hasMore) {
            const { data } = await octokit.rest.repos.listCommits({
                owner,
                repo,
                sha: "HEAD",
                per_page: perPage,
                page: page,
            });

            if (data.length === 0) break;

            const startIndex = data.findIndex((commit) => commit.sha === sinceSha);

            if (startIndex !== -1) {
                commits.push(...data.slice(0, startIndex + 1));
                break;
            } else {
                commits.push(...data);
            }

            page++;
            hasMore = data.length === perPage;
        }

        return commits.map((commit) => ({
            sha: commit.sha,
            message: commit.commit.message,
            date: commit.commit.author.date,
            author: {
                name: commit.author?.login || commit.commit.author.name,
                avatar_url: commit.author?.avatar_url,
                html_url: commit.author?.html_url,
            },
            committer: {
                name: commit.committer?.login || commit.commit.committer.name,
                avatar_url: commit.committer?.avatar_url,
            }
        }));

    } catch (error) {
        terminal.log(chalk.red("Error getting commits:"), error.message);
        throw error;
    }
}

async function getGitRemote() {
    try {
        const remotes = await git.getRemotes(true);
        const origin = remotes.find(r => r.name === "origin");

        if (!origin || !origin.refs || !origin.refs.fetch) {
            return null;
        }

        const url = origin.refs.fetch;
        const match = url.match(/(?:[:/])([^/]+)\/([^/]+?)(?:\.git)?$/);

        if (!match) {
            throw new Error("Git remote could not be identified:", url);
        }

        return {
            owner: match[1],
            name: match[2],
            url
        };
    } catch (err) {
        terminal.log(chalk.red(err));
        return null;
    }
}

async function generateChangelog() {
    let config;
    if (existsSync(path.join(cwd, CHANGELOG_CONFIG_FILE_NAME))) {
        const configText = await fs.readFile(path.join(cwd, CHANGELOG_CONFIG_FILE_NAME), "utf-8");

        try {
            config = JSON.parse(configText);
        } catch {
            terminal.log(chalk.red(`Failed to parse ${CHANGELOG_CONFIG_FILE_NAME}`));
        }
    } else {
        terminal.log(`${CHANGELOG_CONFIG_FILE_NAME} was not detected`);
    }

    const repo = await getGitRemote();
    if (repo === null) {
        terminal.log(chalk.red("Git remote is not detected"));
        process.exit(1);
    }

    const { owner: repoOwner, name: repoName } = repo;

    const fromCommit = getArg("from");
    if (!fromCommit) {
        terminal.log(chalk.red("--from argument not specified"));
        process.exit(1);
    }

    terminal.log(`Generating changelog from commit ${chalk.cyan(fromCommit)}...`);

    const commits = await getCommitsSince(repoOwner, repoName, fromCommit);

    const contributors = [];
    for (const commit of commits) {
        const name = config?.overrides?.authors?.[commit.author.name]?.name ? config.overrides.authors[commit.author.name].name : commit.author.name;
        if (contributors.find((p) => p.name === name)) continue;
        const avatar_url = config?.overrides?.authors?.[commit.author.name]?.avatar_url ? config.overrides.authors[commit.author.name].avatar_url : (commit.author.avatar_url ?? "https://avatars.githubusercontent.com/" + commit.author.name);
        const is_owner = commit.author.name === repoOwner;
        contributors.push({
            name,
            avatar_url,
            is_owner
        });
    }

    const resultToWrite = {
        generated_at: (new Date()).toISOString(),
        contributors,
        changes: commits.map((commit) => ({
            message: commit.message,
            sha: commit.sha,
            author: config?.overrides?.authors?.[commit.author.name]?.name ? config.overrides.authors[commit.author.name].name : commit.author.name,
            date: commit.date,
            tags: [],
            commit_url: `https://github.com/${repoOwner}/${repoName}/commit/${commit.sha}`
        }))
    };

    const outputPath = path.join(cwd, CHANGELOG_BUNDLE_FILE_NAME);

    await fs.writeFile(
        outputPath,
        JSON.stringify(resultToWrite, null, 2),
        "utf-8"
    );

    terminal.log(`Generated changelog.json. (${commits.length} commits)`);
}