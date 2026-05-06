import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templateDir = path.resolve(__dirname, "../template/.claude");

export function installToProject() {
    const dest = path.join(process.cwd(), ".claude");
    fs.copySync(templateDir, dest, { overwrite: false });
    console.log("✅ sdd-kit instalado em .claude/");
}

export function installGlobal() {
    const dest = path.join(process.env.HOME, ".claude");
    fs.copySync(templateDir, dest, { overwrite: false });
    console.log("✅ sdd-kit instalado globalmente em ~/.claude/");
}
