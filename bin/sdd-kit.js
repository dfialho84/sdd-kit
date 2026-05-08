#!/usr/bin/env node
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

        try {
            if (global) {
                installGlobal(platform);
            } else {
                installToProject(platform, overwriteFormats);
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
