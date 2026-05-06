import fs from 'fs';
import path from 'path';

class GeminiWriter {
  constructor(targetPath = '.gemini') {
    this.targetPath = targetPath;
  }

  write(transformedArtifacts) {
    // Write all transformed artifacts to .gemini/
    // Input: { skills: [...], commands: [...], agents: [...] }
    // Output: writes files, returns summary

    const summary = {
      skillsWritten: 0,
      commandsWritten: 0,
      agentsWritten: 0,
      errors: []
    };

    // Write skills
    try {
      summary.skillsWritten = this.writeSkills(transformedArtifacts.skills);
    } catch (err) {
      summary.errors.push(`Skills: ${err.message}`);
    }

    // Write commands
    try {
      summary.commandsWritten = this.writeCommands(transformedArtifacts.commands);
    } catch (err) {
      summary.errors.push(`Commands: ${err.message}`);
    }

    // Write agents
    try {
      summary.agentsWritten = this.writeAgents(transformedArtifacts.agents);
    } catch (err) {
      summary.errors.push(`Agents: ${err.message}`);
    }

    return summary;
  }

  writeSkills(skills) {
    // Write transformed skills to .gemini/skills/
    let count = 0;

    for (const skill of skills) {
      const skillDir = path.join(this.targetPath, 'skills', skill.name);
      this.ensureDir(skillDir);

      // Write SKILL.md
      const skillMdPath = path.join(skillDir, 'SKILL.md');
      fs.writeFileSync(skillMdPath, skill.content, 'utf-8');

      // Copy references if present
      if (skill.references && skill.references.length > 0) {
        const referencesDir = path.join(skillDir, 'references');
        this.ensureDir(referencesDir);

        for (const ref of skill.references) {
          const refPath = path.join(referencesDir, ref.path);
          fs.writeFileSync(refPath, ref.content, 'utf-8');
        }
      }

      count++;
    }

    return count;
  }

  writeCommands(commands) {
    // Write transformed commands to .gemini/custom-commands/
    let count = 0;

    const cmdDir = path.join(this.targetPath, 'custom-commands');
    this.ensureDir(cmdDir);

    for (const cmd of commands) {
      const cmdPath = path.join(cmdDir, cmd.filename);
      fs.writeFileSync(cmdPath, cmd.content, 'utf-8');
      count++;
    }

    return count;
  }

  writeAgents(agents) {
    // Write transformed agents to .gemini/skills/ (as specialized skills)
    let count = 0;

    for (const agent of agents) {
      // Agents are stored as skills with "-agent" suffix
      const agentSkillName = `${agent.name}-agent`;
      const agentDir = path.join(this.targetPath, 'skills', agentSkillName);
      this.ensureDir(agentDir);

      // Write SKILL.md
      const skillMdPath = path.join(agentDir, 'SKILL.md');
      fs.writeFileSync(skillMdPath, agent.content, 'utf-8');

      count++;
    }

    return count;
  }

  ensureDir(dirPath) {
    // Create directory if it doesn't exist (recursive)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  validate() {
    // Validate that .gemini/ has valid structure
    // Returns { isValid: boolean, issues: [...] }

    const issues = [];

    // Check if .gemini/ exists
    if (!fs.existsSync(this.targetPath)) {
      issues.push(`${this.targetPath}/ does not exist`);
      return { isValid: false, issues };
    }

    // Check skills
    const skillsDir = path.join(this.targetPath, 'skills');
    if (fs.existsSync(skillsDir)) {
      const skillDirs = fs.readdirSync(skillsDir);
      for (const skillDir of skillDirs) {
        const skillPath = path.join(skillsDir, skillDir);
        const skillMdPath = path.join(skillPath, 'SKILL.md');
        if (!fs.existsSync(skillMdPath)) {
          issues.push(`Skill ${skillDir} missing SKILL.md`);
        }
      }
    }

    // Check custom commands
    const cmdDir = path.join(this.targetPath, 'custom-commands');
    if (fs.existsSync(cmdDir)) {
      const files = fs.readdirSync(cmdDir);
      for (const file of files) {
        if (!file.endsWith('.json')) {
          issues.push(`Invalid command file: ${file} (must be .json)`);
        }
      }
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}

export default GeminiWriter;
