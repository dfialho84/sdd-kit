class GeminiTransformer {
  transformSkill(claudeSkill) {
    // Transform parsed Claude skill → Gemini SKILL.md
    // Input: { name, description, instructions, references, ... }
    // Output: string (Gemini SKILL.md content)

    const frontmatter = this.buildFrontmatter({
      name: claudeSkill.name,
      description: claudeSkill.description
    });

    const content = `${frontmatter}\n${claudeSkill.instructions}`;
    return content;
  }

  transformCommand(claudeCommand) {
    // Transform parsed Claude command → Gemini custom command config
    // Input: { name, description, prompt, ... }
    // Output: string (JSON config)

    // Gemini custom commands are JSON with name, description, and prompt
    const config = {
      name: claudeCommand.name,
      description: claudeCommand.description || claudeCommand.name,
      prompt: claudeCommand.prompt
    };

    // Add any extra metadata from original frontmatter
    if (claudeCommand.originalFrontmatter.model) {
      config.model = claudeCommand.originalFrontmatter.model;
    }

    return JSON.stringify(config, null, 2);
  }

  transformAgent(claudeAgent) {
    // Transform parsed Claude agent → Gemini skill (specialized)
    // Agents become skills with a "role" focus
    // Input: { name, description, role, systemInstructions, tools, ... }
    // Output: string (Gemini SKILL.md content)

    const frontmatter = this.buildFrontmatter({
      name: claudeAgent.name,
      description: claudeAgent.description,
      role: claudeAgent.role
    });

    let content = `${frontmatter}\n${claudeAgent.systemInstructions}`;

    // Add tools section if present
    if (claudeAgent.tools && claudeAgent.tools.length > 0) {
      content += '\n\n## Tools Available\n';
      for (const tool of claudeAgent.tools) {
        content += `- ${tool}\n`;
      }
    }

    return content;
  }

  buildFrontmatter(fields) {
    // Build YAML frontmatter for Gemini
    // Input: { name, description, role, ... }
    // Output: string (---\n...\n---)

    const lines = ['---'];

    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === '') continue;

      if (typeof value === 'string') {
        // Escape quotes if necessary
        const escaped = value.replace(/"/g, '\\"');
        lines.push(`${key}: "${escaped}"`);
      } else if (typeof value === 'boolean') {
        lines.push(`${key}: ${value}`);
      } else if (Array.isArray(value)) {
        lines.push(`${key}:`);
        for (const item of value) {
          lines.push(`  - ${item}`);
        }
      } else {
        lines.push(`${key}: ${value}`);
      }
    }

    lines.push('---');
    return lines.join('\n');
  }

  transformArtifact(artifact) {
    // Generic transform dispatcher
    // Input: parsed artifact (any type)
    // Output: { content, extension, filename }

    switch (artifact.type) {
      case 'skill':
        return {
          type: 'skill',
          content: this.transformSkill(artifact),
          extension: '.md',
          filename: 'SKILL.md',
          references: artifact.references,
          name: artifact.name
        };

      case 'command':
        return {
          type: 'command',
          content: this.transformCommand(artifact),
          extension: '.json',
          filename: `${artifact.name}.json`,
          name: artifact.name
        };

      case 'agent':
        return {
          type: 'agent',
          content: this.transformAgent(artifact),
          extension: '.md',
          filename: 'SKILL.md',
          name: artifact.name
        };

      default:
        throw new Error(`Unknown artifact type: ${artifact.type}`);
    }
  }

  transformAllArtifacts(artifacts) {
    // Transform all parsed artifacts
    // Input: { skills: [...], commands: [...], agents: [...] }
    // Output: { skills: [...], commands: [...], agents: [...] }

    return {
      skills: artifacts.skills.map(s => this.transformArtifact(s)),
      commands: artifacts.commands.map(c => this.transformArtifact(c)),
      agents: artifacts.agents.map(a => this.transformArtifact(a))
    };
  }
}

export default GeminiTransformer;
