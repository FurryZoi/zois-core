import fs from "fs/promises";
import path from "path";
import chalk from 'chalk';
import { Octokit } from "@octokit/rest";

const octokit = new Octokit();
const args = process.argv.slice(2);
const command = args[0];

function getArg(name) {
    const arg = args.find((a) => a.startsWith("--" + name));
    if (arg) return arg.slice(name.length + 3);
    return null;
}

switch (command) {
    case "generate-changelog": {
        generateChangelog().catch((err) => {
            console.log(chalk.red("Script failed:"), err.message);
            process.exit(1);
        });
        break;
    }
    default: {
        console.log(chalk.red("Unknown command"), `"${chalk.cyan(command)}"`);
        console.log("Available commands:")
        console.log(`• ${chalk.cyan("generate-changelog")} — Generate changelog bundle`)
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
        console.log(chalk.red("Error getting commits:"), error.message);
        throw error;
    }
}

async function generateChangelog() {
    const owner = getArg("owner");
    if (!owner) {
        console.log(chalk.red("--owner argument not specified"));
        process.exit(1);
    }
    const repo = getArg("repo");
    if (!repo) {
        console.log(chalk.red("--repo argument not specified"));
        process.exit(1);
    }
    const fromCommit = getArg("from");
    if (!fromCommit) {
        console.log(chalk.red("--from argument not specified"));
        process.exit(1);
    }
    console.log(`Generating changelog from commit ${chalk.cyan(fromCommit)}...`);

    const commits = await getCommitsSince(owner, repo, fromCommit);

    const resultToWrite = {
        generated_at: (new Date()).toISOString(),
        changes: commits.map((c) => ({
            message: c.message,
            sha: c.sha,
            author: {
                name: c.author.name,
                avatar_url: c.author.avatar_url ?? "https://avatars.githubusercontent.com/" + c.author.name,
            },
            date: c.date,
            tags: [],
            commit_url: `https://github.com/${owner}/${repo}/commit/${c.sha}`
        }))
    };

    const outputPath = path.join(process.cwd(), "changelog.json");

    await fs.writeFile(
        outputPath,
        JSON.stringify(resultToWrite, null, 2),
        "utf-8"
    );

    console.log(`Generated changelog.json. (${commits.length} commits)`);
}