import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import ClaudeToGeminiCompiler from "./compilers/index.js";

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

        // If .gemini doesn't exist in template, compile from .claude
        if (!fs.existsSync(geminiSource)) {
            console.log("🔄 Compilando artefatos Claude para Gemini...");
            const compiler = new ClaudeToGeminiCompiler(
                path.join(templateDir, ".claude"),
                geminiSource
            );
            const result = compiler.compile();
            if (!result.success) {
                throw new Error("Falha ao compilar artefatos para Gemini");
            }
        }

        const geminiDest = path.join(cwd, ".gemini");
        fs.copySync(geminiSource, geminiDest, { overwrite: false });
        console.log("✅ sdd-kit instalado em .gemini/");
    } else if (platform === "both") {
        const claudeSource = path.join(templateDir, ".claude");
        const claudeDest = path.join(cwd, ".claude");
        fs.copySync(claudeSource, claudeDest, { overwrite: false });
        console.log("✅ sdd-kit instalado em .claude/");

        const geminiSource = path.join(templateDir, ".gemini");

        // If .gemini doesn't exist in template, compile from .claude
        if (!fs.existsSync(geminiSource)) {
            console.log("🔄 Compilando artefatos Claude para Gemini...");
            const compiler = new ClaudeToGeminiCompiler(
                path.join(templateDir, ".claude"),
                geminiSource
            );
            const result = compiler.compile();
            if (!result.success) {
                throw new Error("Falha ao compilar artefatos para Gemini");
            }
        }

        const geminiDest = path.join(cwd, ".gemini");
        fs.copySync(geminiSource, geminiDest, { overwrite: false });
        console.log("✅ sdd-kit instalado em .gemini/");
    }
}

export function compileTemplates(platforms = ["gemini"]) {
    const claudeSource = path.join(templateDir, ".claude");

    for (const platform of platforms) {
        if (platform === "gemini") {
            const geminiTarget = path.join(templateDir, ".gemini");

            // Remove existing to avoid stale artifacts from deleted skills
            if (fs.existsSync(geminiTarget)) {
                fs.removeSync(geminiTarget);
            }

            console.log(`\n🔄 Compilando Claude → Gemini...`);
            const compiler = new ClaudeToGeminiCompiler(claudeSource, geminiTarget);
            const result = compiler.compile();

            if (!result.success) {
                throw new Error(`Falha ao compilar para Gemini`);
            }

            console.log(`\n📦 template/.gemini/ atualizado e pronto para publish`);
        } else {
            console.warn(`⚠️  Plataforma "${platform}" ainda não suportada pelo compile`);
        }
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

        // If .gemini doesn't exist in template, compile from .claude
        if (!fs.existsSync(geminiSource)) {
            console.log("🔄 Compilando artefatos Claude para Gemini...");
            const compiler = new ClaudeToGeminiCompiler(
                path.join(templateDir, ".claude"),
                geminiSource
            );
            const result = compiler.compile();
            if (!result.success) {
                throw new Error("Falha ao compilar artefatos para Gemini");
            }
        }

        const geminiDest = path.join(homeDir, ".gemini");
        fs.copySync(geminiSource, geminiDest, { overwrite: false });
        console.log("✅ sdd-kit instalado globalmente em ~/.gemini/");
    } else if (platform === "both") {
        const claudeSource = path.join(templateDir, ".claude");
        const claudeDest = path.join(homeDir, ".claude");
        fs.copySync(claudeSource, claudeDest, { overwrite: false });
        console.log("✅ sdd-kit instalado globalmente em ~/.claude/");

        const geminiSource = path.join(templateDir, ".gemini");

        // If .gemini doesn't exist in template, compile from .claude
        if (!fs.existsSync(geminiSource)) {
            console.log("🔄 Compilando artefatos Claude para Gemini...");
            const compiler = new ClaudeToGeminiCompiler(
                path.join(templateDir, ".claude"),
                geminiSource
            );
            const result = compiler.compile();
            if (!result.success) {
                throw new Error("Falha ao compilar artefatos para Gemini");
            }
        }

        const geminiDest = path.join(homeDir, ".gemini");
        fs.copySync(geminiSource, geminiDest, { overwrite: false });
        console.log("✅ sdd-kit instalado globalmente em ~/.gemini/");
    }
}
