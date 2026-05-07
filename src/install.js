import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templateDir = path.resolve(__dirname, "../template");

export function installToProject(platform = "claude") {
    const cwd = process.cwd();

    const docsSource = path.join(templateDir, "docs");
    const docsDest = path.join(cwd, "docs");
    fs.copySync(docsSource, docsDest, { overwrite: false });
    console.log("✅ Formatos SDD instalados em docs/sdd/");

    if (platform === "claude") {
        const claudeSource = path.join(templateDir, ".claude");
        const claudeDest = path.join(cwd, ".claude");
        fs.copySync(claudeSource, claudeDest, { overwrite: false });
        console.log("✅ sdd-kit instalado em .claude/");
    } else if (platform === "gemini") {
        const geminiSource = path.join(templateDir, ".gemini");
        const geminiDest = path.join(cwd, ".gemini");
        fs.copySync(geminiSource, geminiDest, { overwrite: false });
        console.log("✅ sdd-kit instalado em .gemini/");
    } else if (platform === "both") {
        const claudeSource = path.join(templateDir, ".claude");
        const claudeDest = path.join(cwd, ".claude");
        fs.copySync(claudeSource, claudeDest, { overwrite: false });
        console.log("✅ sdd-kit instalado em .claude/");

        const geminiSource = path.join(templateDir, ".gemini");
        const geminiDest = path.join(cwd, ".gemini");
        fs.copySync(geminiSource, geminiDest, { overwrite: false });
        console.log("✅ sdd-kit instalado em .gemini/");
    }
}

export function installGlobal(platform = "claude") {
    const homeDir = process.env.HOME;

    if (platform === "claude") {
        const claudeSource = path.join(templateDir, ".claude");
        const claudeDest = path.join(homeDir, ".claude");
        fs.copySync(claudeSource, claudeDest, { overwrite: false });
        console.log("✅ sdd-kit instalado globalmente em ~/.claude/");
    } else if (platform === "gemini") {
        const geminiSource = path.join(templateDir, ".gemini");
        const geminiDest = path.join(homeDir, ".gemini");
        fs.copySync(geminiSource, geminiDest, { overwrite: false });
        console.log("✅ sdd-kit instalado globalmente em ~/.gemini/");
    } else if (platform === "both") {
        const claudeSource = path.join(templateDir, ".claude");
        const claudeDest = path.join(homeDir, ".claude");
        fs.copySync(claudeSource, claudeDest, { overwrite: false });
        console.log("✅ sdd-kit instalado globalmente em ~/.claude/");

        const geminiSource = path.join(templateDir, ".gemini");
        const geminiDest = path.join(homeDir, ".gemini");
        fs.copySync(geminiSource, geminiDest, { overwrite: false });
        console.log("✅ sdd-kit instalado globalmente em ~/.gemini/");
    }
}
