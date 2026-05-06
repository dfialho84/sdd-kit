#!/usr/bin/env node
import { installToProject, installGlobal, compileTemplates } from "../src/install.js";
import readline from "readline";

const args = process.argv.slice(2);
const command = args[0];

function printHeader() {
    const r = "\x1b[0m";
    const b = "\x1b[1m";
    const c = "\x1b[96m";
    const d = "\x1b[2m";

    console.log("");
    console.log(`${c}  ╔═════════════════════════════════════════════════════════╗${r}`);
    console.log(`${c}  ║                                                         ║${r}`);
    console.log(`${c}  ║${r}   ${b}███████╗██████╗ ██████╗        ██╗  ██╗██╗████████╗${r}   ${c}║${r}`);
    console.log(`${c}  ║${r}   ${b}██╔════╝██╔══██╗██╔══██╗       ██║ ██╔╝██║╚══██╔══╝${r}   ${c}║${r}`);
    console.log(`${c}  ║${r}   ${b}███████╗██║  ██║██║  ██║       █████╔╝ ██║   ██║   ${r}   ${c}║${r}`);
    console.log(`${c}  ║${r}   ${b}╚════██║██║  ██║██║  ██║       ██╔═██╗ ██║   ██║   ${r}   ${c}║${r}`);
    console.log(`${c}  ║${r}   ${b}███████║██████╔╝██████╔╝       ██║  ██╗██║   ██║   ${r}   ${c}║${r}`);
    console.log(`${c}  ║${r}   ${b}╚══════╝╚═════╝ ╚═════╝        ╚═╝  ╚═╝╚═╝   ╚═╝   ${r}   ${c}║${r}`);
    console.log(`${c}  ║                                                         ║${r}`);
    console.log(`${c}  ║${r}                   ${d}dfialho84 · sdd-kit${r}                   ${c}║${r}`);
    console.log(`${c}  ╚═════════════════════════════════════════════════════════╝${r}`);
    console.log("");
}

async function askPlatform() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        console.log("\n🚀 sdd-kit - Qual plataforma você deseja instalar?\n");
        console.log("1) Claude Code");
        console.log("2) Gemini CLI");
        console.log("3) Ambas as plataformas\n");

        rl.question("Escolha uma opção (1-3): ", (answer) => {
            rl.close();
            const platformMap = {
                "1": "claude",
                "2": "gemini",
                "3": "both"
            };
            resolve(platformMap[answer] || "claude");
        });
    });
}

async function run() {
    printHeader();

    if (command === "init") {
        const global = args.includes("--global");
        let platform = "claude";

        // Check for explicit platform flag
        const platformArg = args.find((a) =>
            ["--platform", "-p"].some((f) => a.startsWith(f))
        );

        if (platformArg) {
            platform = platformArg.split("=")[1] || args[args.indexOf(platformArg) + 1];
        } else if (args.includes("--all-platforms")) {
            platform = "both";
        } else if (!args.some((a) => a.startsWith("--platform") || a === "--all-platforms")) {
            // Ask interactively if no platform specified
            platform = await askPlatform();
        }

        try {
            if (global) {
                installGlobal(platform);
            } else {
                installToProject(platform);
            }
        } catch (err) {
            console.error("❌ Erro ao instalar:", err.message);
            process.exit(1);
        }
    } else if (command === "compile") {
        // Regenerate template/.gemini/ from template/.claude/
        // Run this before `npm publish` after editing Claude artifacts
        const platformArg = args.find((a) => a.startsWith("--platform") || a.startsWith("-p"));
        let platforms = ["gemini"];

        if (platformArg) {
            const value = platformArg.split("=")[1] || args[args.indexOf(platformArg) + 1];
            platforms = value === "all" ? ["gemini"] : [value];
        } else if (args.includes("--all-platforms")) {
            platforms = ["gemini"];
        }

        try {
            compileTemplates(platforms);
        } catch (err) {
            console.error("❌ Erro ao compilar:", err.message);
            process.exit(1);
        }
    } else {
        console.log("Uso:");
        console.log("  sdd-kit init [--platform <claude|gemini|both>] [--global]");
        console.log("  sdd-kit init [--all-platforms] [--global]");
        console.log("  sdd-kit compile                    (regenera template/.gemini/ a partir de template/.claude/)");
        console.log("  sdd-kit compile --platform gemini  (explícito)");
        process.exit(1);
    }
}

run();
