import fs from 'fs';
import path from 'path';

class ClaudeParser {
  parseSkill(skillPath) {
    // Input: .claude/skills/foo/
    // Output: { name, description, instructions, references }

    const skillMdPath = path.join(skillPath, 'SKILL.md');
    if (!fs.existsSync(skillMdPath)) {
      throw new Error(`SKILL.md not found at ${skillMdPath}`);
    }

    const content = fs.readFileSync(skillMdPath, 'utf-8');
    const { frontmatter, body } = this.extractFrontmatter(content);

    const name = path.basename(skillPath);
    const description = frontmatter.description || '';
    const instructions = body.trim();

    // Collect references
    const referencesDir = path.join(skillPath, 'references');
    const references = [];
    if (fs.existsSync(referencesDir)) {
      const files = fs.readdirSync(referencesDir);
      for (const file of files) {
        const filePath = path.join(referencesDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        references.push({
          name: file,
          path: file,
          content: fileContent
        });
      }
    }

    return {
      type: 'skill',
      name,
      description,
      instructions,
      references,
      sourcePath: skillPath,
      originalFrontmatter: frontmatter
    };
  }

  parseCommand(commandPath) {
    // Input: .claude/commands/foo.md
    // Output: { name, description, prompt, ... }

    const content = fs.readFileSync(commandPath, 'utf-8');
    const { frontmatter, body } = this.extractFrontmatter(content);

    const name = path.basename(commandPath, '.md');
    const description = frontmatter.description || '';
    const prompt = body.trim();

    return {
      type: 'command',
      name,
      description,
      prompt,
      sourcePath: commandPath,
      originalFrontmatter: frontmatter
    };
  }

  parseAgent(agentPath) {
    // Input: .claude/agents/foo.md
    // Output: { name, description, role, systemInstructions, tools }

    const content = fs.readFileSync(agentPath, 'utf-8');
    const { frontmatter, body } = this.extractFrontmatter(content);

    const name = path.basename(agentPath, '.md');
    const description = frontmatter.description || '';
    const role = frontmatter.role || '';
    const systemInstructions = body.trim();
    const tools = Array.isArray(frontmatter.tools) ? frontmatter.tools : [];

    return {
      type: 'agent',
      name,
      description,
      role,
      systemInstructions,
      tools,
      sourcePath: agentPath,
      originalFrontmatter: frontmatter
    };
  }

  extractFrontmatter(content) {
    // Extract YAML frontmatter from markdown
    // Returns { frontmatter: {}, body: string }

    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { frontmatter: {}, body: content };
    }

    const [, frontmatterStr, body] = match;
    const frontmatter = this.parseYaml(frontmatterStr);

    return { frontmatter, body: body.trim() };
  }

  parseYaml(yamlStr) {
    // Simple YAML parser for common cases
    // Handles: key: value, arrays, strings, booleans

    const lines = yamlStr.split('\n');
    const result = {};

    for (const line of lines) {
      if (!line.trim() || line.trim().startsWith('#')) continue;

      const [key, ...valueParts] = line.split(':');
      if (!valueParts.length) continue;

      const value = valueParts.join(':').trim();

      // Handle different value types
      if (value === 'true') result[key.trim()] = true;
      else if (value === 'false') result[key.trim()] = false;
      else if (value.startsWith('[') && value.endsWith(']')) {
        // Simple array parsing: [item1, item2]
        result[key.trim()] = value
          .slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/^['"]|['"]$/g, ''));
      } else {
        result[key.trim()] = value.replace(/^['"]|['"]$/g, '');
      }
    }

    return result;
  }

  scanAllArtifacts(claudePath = '.claude') {
    // Discover and parse all artifacts in .claude/
    // Returns { skills: [...], commands: [...], agents: [...] }

    const artifacts = {
      skills: [],
      commands: [],
      agents: []
    };

    // Parse skills
    const skillsDir = path.join(claudePath, 'skills');
    if (fs.existsSync(skillsDir)) {
      const skillDirs = fs.readdirSync(skillsDir);
      for (const skillDir of skillDirs) {
        const skillPath = path.join(skillsDir, skillDir);
        if (fs.statSync(skillPath).isDirectory()) {
          try {
            artifacts.skills.push(this.parseSkill(skillPath));
          } catch (err) {
            console.warn(`Failed to parse skill ${skillDir}:`, err.message);
          }
        }
      }
    }

    // Parse commands (recursively search all subdirectories)
    const commandsDir = path.join(claudePath, 'commands');
    if (fs.existsSync(commandsDir)) {
      const findCommandsRecursive = (dir) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            findCommandsRecursive(filePath);
          } else if (file.endsWith('.md')) {
            try {
              artifacts.commands.push(this.parseCommand(filePath));
            } catch (err) {
              console.warn(`Failed to parse command ${filePath}:`, err.message);
            }
          }
        }
      };
      findCommandsRecursive(commandsDir);
    }

    // Parse agents
    const agentsDir = path.join(claudePath, 'agents');
    if (fs.existsSync(agentsDir)) {
      const files = fs.readdirSync(agentsDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          const agentPath = path.join(agentsDir, file);
          try {
            artifacts.agents.push(this.parseAgent(agentPath));
          } catch (err) {
            console.warn(`Failed to parse agent ${file}:`, err.message);
          }
        }
      }
    }

    return artifacts;
  }
}

export default ClaudeParser;
