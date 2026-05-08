#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { installToProject, installGlobal } from "../src/install.js";

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
    const options = [
        { label: "Claude Code",           value: "claude" },
        { label: "Gemini CLI",            value: "gemini" },
        { label: "Ambas as plataformas",  value: "both"   },
    ];

    const RESET  = "\x1b[0m";
    const BOLD   = "\x1b[1m";
    const CYAN   = "\x1b[96m";
    const DIM    = "\x1b[2m";

    function render(selected) {
        process.stdout.write(`\x1b[${options.length}A`); // move up N lines
        options.forEach((opt, i) => {
            const cursor = i === selected ? `${BOLD}${CYAN}▶ ` : `${DIM}  `;
            const num    = i === selected ? `${BOLD}${CYAN}${i + 1})` : `${DIM}${i + 1})`;
            const text   = i === selected ? `${BOLD}${CYAN}${opt.label}` : `${DIM}${opt.label}`;
            process.stdout.write(`\r${cursor}${num} ${text}${RESET}\n`);
        });
    }

    return new Promise((resolve) => {
        console.log(`\n${BOLD}Qual plataforma você deseja instalar?${RESET}\n`);

        let selected = 0;
        options.forEach((opt, i) => {
            process.stdout.write(`  ${DIM}${i + 1}) ${opt.label}${RESET}\n`);
        });

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        render(selected);

        process.stdin.on("data", function onKey(key) {
            if (key === "\x1B[A") {                         // arrow up
                selected = (selected - 1 + options.length) % options.length;
                render(selected);
            } else if (key === "\x1B[B") {                  // arrow down
                selected = (selected + 1) % options.length;
                render(selected);
            } else if (key === "\r" || key === "\n") {      // enter
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeListener("data", onKey);
                console.log();
                resolve(options[selected].value);
            } else if (key === "\x03") {                    // ctrl+c
                process.stdin.setRawMode(false);
                process.stdout.write("\n");
                process.exit(0);
            }
        });
    });
}

function getExistingLanguage(platform, isGlobal) {
    const baseDir = isGlobal ? process.env.HOME : process.cwd();
    const configPath = path.join(baseDir, "docs", "sdd", "sdd-config.md");
    if (fs.existsSync(configPath)) {
        const match = fs.readFileSync(configPath, "utf8").match(/^language:\s*(.+)$/m);
        if (match) return match[1].trim();
    }
    return null;
}

async function askLanguage() {
    const RESET  = "\x1b[0m";
    const BOLD   = "\x1b[1m";
    const CYAN   = "\x1b[96m";
    const DIM    = "\x1b[2m";

    const options = [
        { label: "English",   value: "English"    },
        { label: "Português", value: "Português"  },
        { label: "Español",   value: "Español"    },
        { label: "Français",  value: "Français"   },
        { label: "Deutsch",   value: "Deutsch"    },
        { label: "Other...",  value: "__other__"  },
    ];

    function render(selected) {
        process.stdout.write(`\x1b[${options.length}A`);
        options.forEach((opt, i) => {
            const cursor = i === selected ? `${BOLD}${CYAN}▶ ` : `${DIM}  `;
            const num    = i === selected ? `${BOLD}${CYAN}${i + 1})` : `${DIM}${i + 1})`;
            const text   = i === selected ? `${BOLD}${CYAN}${opt.label}` : `${DIM}${opt.label}`;
            process.stdout.write(`\r${cursor}${num} ${text}${RESET}\n`);
        });
    }

    const picked = await new Promise((resolve) => {
        console.log(`\n${BOLD}What language should agents use to communicate and generate documents?${RESET}\n`);

        let selected = 0;
        options.forEach((opt, i) => {
            process.stdout.write(`  ${DIM}${i + 1}) ${opt.label}${RESET}\n`);
        });

        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");

        render(selected);

        process.stdin.on("data", function onKey(key) {
            if (key === "\x1B[A") {
                selected = (selected - 1 + options.length) % options.length;
                render(selected);
            } else if (key === "\x1B[B") {
                selected = (selected + 1) % options.length;
                render(selected);
            } else if (key === "\r" || key === "\n") {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeListener("data", onKey);
                console.log();
                resolve(options[selected].value);
            } else if (key === "\x03") {
                process.stdin.setRawMode(false);
                process.stdout.write("\n");
                process.exit(0);
            }
        });
    });

    if (picked !== "__other__") return picked;

    return new Promise((resolve) => {
        process.stdout.write(`${BOLD}Language name:${RESET} `);
        let input = "";
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", function onChar(ch) {
            if (ch === "\r" || ch === "\n") {
                process.stdin.setRawMode(false);
                process.stdin.pause();
                process.stdin.removeListener("data", onChar);
                process.stdout.write("\n");
                resolve(input.trim() || "English");
            } else if (ch === "\x7f") {
                if (input.length > 0) {
                    input = input.slice(0, -1);
                    process.stdout.write("\b \b");
                }
            } else if (ch === "\x03") {
                process.stdin.setRawMode(false);
                process.stdout.write("\n");
                process.exit(0);
            } else {
                input += ch;
                process.stdout.write(ch);
            }
        });
    });
}

async function run() {
    printHeader();

    if (command === "init" || command === undefined) {
        const global = args.includes("--global");
        const overwriteFormats = args.includes("--overwrite-formats");
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

        const existingLanguage = getExistingLanguage(platform, global);
        let language;
        if (existingLanguage) {
            const BOLD = "\x1b[1m";
            const CYAN = "\x1b[96m";
            const RESET = "\x1b[0m";
            console.log(`\nLanguage: ${BOLD}${CYAN}${existingLanguage}${RESET} (preserved from existing config)\n`);
            language = existingLanguage;
        } else {
            language = await askLanguage();
        }

        try {
            if (global) {
                installGlobal(platform, language);
            } else {
                installToProject(platform, overwriteFormats, language);
            }
        } catch (err) {
            console.error("❌ Erro ao instalar:", err.message);
            process.exit(1);
        }
    } else {
        console.log("Uso:");
        console.log("  sdd-kit init [--platform <claude|gemini|both>] [--global] [--overwrite-formats]");
        console.log("  sdd-kit init [--all-platforms] [--global] [--overwrite-formats]");
        process.exit(1);
    }
}

run();
