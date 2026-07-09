import esbuild from "esbuild";
import path from "path";
import fs, { existsSync } from "fs";
import { execSync } from "child_process";

if (existsSync("dist")) fs.rmSync("dist", { recursive: true, force: true });
else fs.mkdirSync("dist");

const srcDir = path.resolve(import.meta.dirname, "..", "src");
const distDir = path.resolve(import.meta.dirname, "..", "dist");

console.log("\x1b[36m%s\x1b[0m", "[ESM]:", "Building...");
try {
    await esbuild.build({
        entryPoints: ["./src/**/*.*"],
        outdir: distDir,
        bundle: false,
        minify: false,
        format: "esm",
        treeShaking: true,
        splitting: false,
        legalComments: "none",
        platform: "browser",
        tsconfig: path.resolve(import.meta.dirname, "..", "tsconfig.json"),
        loader: {
            ".ts": "ts",
            ".svg": "copy",
            ".png": "copy"
        }
    });
    console.log("\x1b[32m%s\x1b[0m", "[ESM]:", "Done");
} catch (err) {
    console.error("\x1b[31m✗\x1b[0m \x1b[31m%s\x1b[0m", "[ESM]:", "Failed");
    console.error("\x1b[31m%s\x1b[0m", err.message);
    process.exit(1);
}

console.log("\x1b[36m%s\x1b[0m", "[DTS]:", "Generating types...");
try {
    execSync("tsc -p tsconfig.dts.json", { 
        stdio: 'pipe',
        encoding: 'utf-8'
    });
    console.log("\x1b[32m%s\x1b[0m", "[DTS]:", "Done");
} catch (error) {
    console.error("\x1b[31m✗\x1b[0m \x1b[31m%s\x1b[0m", "[DTS]:", "Failed");
    console.error("\x1b[33m%s\x1b[0m", "─".repeat(50));
    console.error("\x1b[31m%s\x1b[0m", error.stderr || error.stdout || error.message);
    console.error("\x1b[33m%s\x1b[0m", "─".repeat(50));
    process.exit(1);
}

console.log("\x1b[32m%s\x1b[0m", "Build completed successfully!");