
import fs from "fs/promises";
import path from "path";
import chalk from "chalk";
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
const PACKAGE_FILE_NAME = "package.json";

function getArg(name) {
    const prefix = `--${name}=`;
    const index = args.findIndex((arg) => arg.startsWith(prefix));

    if (index !== -1) {
        return args[index].slice(prefix.length);
    }

    const separateIndex = args.indexOf(`--${name}`);

    if (separateIndex !== -1 && args[separateIndex + 1]) {
        return args[separateIndex + 1];
    }

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
        terminal.log("Available commands:");
        terminal.log(`• ${chalk.cyan("generate-changelog")} — Generate changelog bundle`);
    }
}

async function getCommitsBetween(owner, repo, fromSha, toSha = null, perPage = 100) {
    const commits = [];
    let page = 1;
    let foundFrom = false;
    let foundTo = !toSha;

    try {
        while (!foundFrom) {
            const { data } = await octokit.rest.repos.listCommits({
                owner,
                repo,
                sha: "HEAD",
                per_page: perPage,
                page
            });

            if (data.length === 0) break;

            for (const commit of data) {
                commits.push({
                    sha: commit.sha,
                    message: commit.commit.message,
                    date: commit.commit.author?.date ?? commit.commit.committer?.date,
                    author: {
                        name: commit.author?.login || commit.commit.author?.name || "Unknown",
                        avatar_url: commit.author?.avatar_url ?? null,
                        html_url: commit.author?.html_url ?? null
                    },
                    committer: {
                        name: commit.committer?.login || commit.commit.committer?.name || "Unknown",
                        avatar_url: commit.committer?.avatar_url ?? null
                    }
                });

                if (toSha && commit.sha === toSha) {
                    foundTo = true;
                }

                if (commit.sha === fromSha) {
                    foundFrom = true;
                    break;
                }
            }

            if (foundFrom) break;

            if (data.length < perPage) break;

            page++;
        }

        if (!foundFrom) {
            throw new Error(`Commit specified by --from (${fromSha}) was not found`);
        }

        if (!foundTo) {
            throw new Error(`Commit specified by --to (${toSha}) was not found in the selected range`);
        }

        const fromIndex = commits.findIndex((commit) => commit.sha === fromSha);
        const toIndex = toSha
            ? commits.findIndex((commit) => commit.sha === toSha)
            : 0;

        if (toIndex === -1) {
            throw new Error(`Commit specified by --to (${toSha}) was not found`);
        }

        if (toIndex > fromIndex) {
            throw new Error("--to must be a newer commit than or equal to --from");
        }

        return commits
            .slice(toIndex, fromIndex + 1)
            .reverse();

    } catch (error) {
        terminal.error(chalk.red("Error getting commits:"), error.message);
        throw error;
    }
}

async function getGitRemote() {
    try {
        const remotes = await git.getRemotes(true);
        const origin = remotes.find((remote) => remote.name === "origin");

        if (!origin?.refs?.fetch) {
            return null;
        }

        const url = origin.refs.fetch;
        const match = url.match(/(?:[:/])([^/]+)\/([^/]+?)(?:\.git)?$/);

        if (!match) {
            throw new Error(`Git remote could not be identified: ${url}`);
        }

        return {
            owner: match[1],
            name: match[2],
            url
        };
    } catch (err) {
        terminal.error(chalk.red(err.message));
        return null;
    }
}

async function readConfig() {
    const configPath = path.join(cwd, CHANGELOG_CONFIG_FILE_NAME);

    if (!existsSync(configPath)) {
        terminal.log(chalk.yellow(`${CHANGELOG_CONFIG_FILE_NAME} was not detected`));
        return {};
    }

    const configText = await fs.readFile(configPath, "utf-8");

    try {
        return JSON.parse(configText);
    } catch {
        throw new Error(`Failed to parse ${CHANGELOG_CONFIG_FILE_NAME}`);
    }
}

async function readPackageVersion() {
    const packagePath = path.join(cwd, PACKAGE_FILE_NAME);

    if (!existsSync(packagePath)) {
        throw new Error(`${PACKAGE_FILE_NAME} was not detected`);
    }

    const packageText = await fs.readFile(packagePath, "utf-8");

    let packageData;

    try {
        packageData = JSON.parse(packageText);
    } catch {
        throw new Error(`Failed to parse ${PACKAGE_FILE_NAME}`);
    }

    if (!packageData.version) {
        throw new Error(`Version is not specified in ${PACKAGE_FILE_NAME}`);
    }

    return packageData.version;
}

async function readChangelog() {
    const changelogPath = path.join(cwd, CHANGELOG_BUNDLE_FILE_NAME);

    if (!existsSync(changelogPath)) {
        return [];
    }

    const changelogText = await fs.readFile(changelogPath, "utf-8");

    let changelog;

    try {
        changelog = JSON.parse(changelogText);
    } catch {
        throw new Error(`Failed to parse ${CHANGELOG_BUNDLE_FILE_NAME}`);
    }

    if (!Array.isArray(changelog)) {
        throw new Error(`${CHANGELOG_BUNDLE_FILE_NAME} must contain an array`);
    }

    return changelog;
}

function resolveAuthorName(authorName, config) {
    return config?.overrides?.authors?.[authorName]?.name ?? authorName;
}

function resolveAuthorAvatar(author, config) {
    return config?.overrides?.authors?.[author.name]?.avatar_url
        ?? author.avatar_url
        ?? `https://avatars.githubusercontent.com/${author.name}`;
}

async function generateChangelog() {
    const config = await readConfig();

    const repo = await getGitRemote();

    if (repo === null) {
        throw new Error("Git remote is not detected");
    }

    const { owner: repoOwner, name: repoName } = repo;

    const fromCommit = getArg("from");
    const toCommit = getArg("to");
    const version = getArg("version") ?? await readPackageVersion();

    if (!fromCommit) {
        throw new Error("--from argument not specified");
    }

    const changelog = await readChangelog();

    if (changelog.some((entry) => entry.version === version)) {
        throw new Error(`Changelog for version ${version} already exists`);
    }

    terminal.log(
        `Generating changelog for version ${chalk.cyan(version)}...`
    );

    terminal.log(
        `From commit: ${chalk.cyan(fromCommit)}`
    );

    if (toCommit) {
        terminal.log(
            `To commit: ${chalk.cyan(toCommit)}`
        );
    } else {
        terminal.log("To commit: latest");
    }

    const commits = await getCommitsBetween(
        repoOwner,
        repoName,
        fromCommit,
        toCommit
    );

    if (commits.length === 0) {
        throw new Error("No commits found in the selected range");
    }

    const contributors = [];

    for (const commit of commits) {
        const name = resolveAuthorName(commit.author.name, config);

        if (contributors.some((contributor) => contributor.name === name)) {
            continue;
        }

        contributors.push({
            name,
            avatar_url: resolveAuthorAvatar(commit.author, config),
            is_owner: commit.author.name === repoOwner
        });
    }

    const result = {
        date: new Date().toISOString(),
        version,
        contributors,
        changes: commits.map((commit) => ({
            message: commit.message,
            sha: commit.sha,
            author: resolveAuthorName(commit.author.name, config),
            date: commit.date,
            tags: [],
            commit_url: `https://github.com/${repoOwner}/${repoName}/commit/${commit.sha}`
        }))
    };

    changelog.push(result);

    const outputPath = path.join(cwd, CHANGELOG_BUNDLE_FILE_NAME);

    await fs.writeFile(
        outputPath,
        JSON.stringify(changelog, null, 2),
        "utf-8"
    );

    terminal.log(
        chalk.green(`Generated changelog.json for version ${version}. (${commits.length} commits)`)
    );
}
