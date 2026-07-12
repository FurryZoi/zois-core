import simpleGit from "simple-git";
import fs from "fs/promises";
import path from "path";

const git = simpleGit({ baseDir: process.cwd() });

async function getUnpushedCommits() {
    try {
        const branchSummary = await git.branch();
        const currentBranch = branchSummary.current;

        const remoteBranch = `origin/${currentBranch}`;

        try {
            const log = await git.log([`${remoteBranch}..HEAD`]);
            return log.all;
        } catch (err) {
            console.warn("No remote tracking branch found, returning all commits.");
            const log = await git.log();
            return log.all;
        }
    } catch (error) {
        console.error("Error getting unpushed commits:", error.message);
        return [];
    }
}

async function getCommitsFromHash(hash) {
    try {
        const log = await git.log({
            from: hash,
            to: "HEAD"
        });
        return log.all;
    } catch (error) {
        console.error(`Error getting commits from hash ${hash}:`, error.message);
        return [];
    }
}

async function generateChangelog() {
    const args = process.argv.slice(2);
    let commits = [];

    if (args.length > 0 && args[0].startsWith("--from=")) {
        const hash = args[0].split("=")[1];
        if (hash) {
            console.log(`Generating changelog from commit ${hash}...`);
            commits = await getCommitsFromHash(hash);
        } else {
            console.error("Invalid --from= hash provided.");
            process.exit(1);
        }
    } else {
        console.log("Generating changelog for unpushed commits...");
        commits = await getUnpushedCommits();
    }

    const changelog = commits.map((commit) => ({
        hash: commit.hash,
        author: commit.author_name || commit.author || "Unknown",
        message: commit.message || commit.body || "",
        date: commit.date
    }));

    const outputPath = path.join(process.cwd(), "changelog.json");

    await fs.writeFile(
        outputPath,
        JSON.stringify(changelog, null, 2),
        "utf-8"
    );

    console.log(`Generated changelog.json. (${changelog.length} commits)`);
}

generateChangelog().catch((err) => {
    console.error("❌ Script failed:", err.message);
    process.exit(1);
});