# Compilador Claude → Gemini (Arquitetura)

## Mapeamento Semântico

| Artefato Claude                     | Semântica                        | Artefato Gemini                                       | Formato                       |
| ----------------------------------- | -------------------------------- | ----------------------------------------------------- | ----------------------------- |
| `.claude/skills/<name>/SKILL.md`    | Definição de skill com instrução | `.gemini/skills/<name>/SKILL.md`                      | Markdown com frontmatter YAML |
| `.claude/commands/<name>.md`        | Prompt que invoca um fluxo       | `.gemini/custom-commands/<name>.json`                 | JSON config + ícone           |
| `.claude/agents/<name>.md`          | Spec de sub-agente               | `.gemini/skills/<name>/SKILL.md` (ou subagent config) | SKILL.md ou agents.json       |
| `.claude/skills/<name>/references/` | Materiais de referência          | `.gemini/skills/<name>/references/`                   | Mesmo diretório               |

## Estrutura de Entrada e Saída

### Entrada: Claude Format (source of truth)

```
.claude/
├── commands/
│   ├── create-prd.md
│   └── create-design.md
├── agents/
│   ├── impl-agent.md
│   └── test-strategy-agent.md
└── skills/
    ├── prd-standards/
    │   ├── SKILL.md
    │   └── references/
    │       ├── interview-guide.md
    │       └── prd-example.md
    └── design-standards/
        ├── SKILL.md
        └── references/
```

### Saída: Gemini Format

```
.gemini/
├── skills/
│   ├── prd-standards/
│   │   ├── SKILL.md (converted)
│   │   └── references/
│   │       ├── interview-guide.md
│   │       └── prd-example.md
│   └── design-standards/
│       ├── SKILL.md (converted)
│       └── references/
└── custom-commands/
    ├── create-prd.json (generated)
    └── create-design.json (generated)
```

---

## Algoritmo de CompilaçãoV

### Fase 1: Parse Claude Artifacts

```javascript
parseClaudeSkill(skillPath) {
  // Input: .claude/skills/foo/SKILL.md
  // Output: { name, description, instructions, references }

  1. Ler SKILL.md
  2. Extrair frontmatter YAML (name, description, etc)
  3. Extrair body (instruções)
  4. Listar subdirectórios em references/

  Return {
    name: <from frontmatter>,
    description: <from frontmatter>,
    instructions: <body markdown>,
    references: [
      { path: "interview-guide.md", content: "..." },
      { path: "example.md", content: "..." }
    ]
  }
}

parseClaudeCommand(commandPath) {
  // Input: .claude/commands/foo.md
  // Output: { name, prompt, trigger_pattern }

  1. Ler arquivo
  2. Extrair frontmatter YAML (name, trigger, model, etc)
  3. Extrair body (prompt)

  Return {
    name: <slugified filename>,
    description: <from frontmatter if exists>,
    prompt: <body>,
    trigger: <frontmatter.trigger or inferred>
  }
}

parseClaudeAgent(agentPath) {
  // Input: .claude/agents/foo.md
  // Output: { name, description, role, tools }

  1. Ler arquivo
  2. Extrair frontmatter (name, role, tools, model)
  3. Extrair body (system instructions)

  Return {
    name: <from frontmatter>,
    description: <from frontmatter>,
    role: <from frontmatter>,
    systemInstructions: <body>,
    tools: <from frontmatter array>
  }
}
```

### Fase 2: Transform to Gemini Format

```javascript
transformSkillToGemini(claudeSkill) {
  // Input: parsed Claude skill
  // Output: Gemini SKILL.md content

  // Gemini SKILL.md é simples: frontmatter + markdown instructions

  const geminiSkillMd = `---
name: ${claudeSkill.name}
description: ${claudeSkill.description}
---

${claudeSkill.instructions}
`;

  Return geminiSkillMd;
}

transformCommandToGemini(claudeCommand) {
  // Input: parsed Claude command
  // Output: Gemini custom command config

  // Gemini custom commands são JSON com prompt/shell

  const customCommand = {
    name: claudeCommand.name,
    description: claudeCommand.description,
    prompt: claudeCommand.prompt,
    // trigger: claudeCommand.trigger, // se aplicável
  };

  Return JSON.stringify(customCommand, null, 2);
}

transformAgentToGemini(claudeAgent) {
  // Input: parsed Claude agent
  // Output: Gemini SKILL.md (representando o agente como skill)

  // Agents no Gemini são representados como skills especializados

  const geminiSkillMd = `---
name: ${claudeAgent.name}
description: Agent specializing in: ${claudeAgent.description}
role: ${claudeAgent.role}
---

${claudeAgent.systemInstructions}

## Tools available
${claudeAgent.tools.map(t => `- ${t}`).join('\n')}
`;

  Return geminiSkillMd;
}
```

### Fase 3: Write to Gemini Directory

```javascript
writeGeminiArtifacts(transformedArtifacts, targetPath = ".gemini") {
  // Input: array of { type, name, content, path }
  // Output: writes files to .gemini/

  for each artifact:
    1. Determine output path based on type
       - skill → .gemini/skills/<name>/SKILL.md
       - command → .gemini/custom-commands/<name>.json
       - agent → .gemini/skills/<name>-agent/SKILL.md

    2. Create directory if not exists

    3. Write file (fs.writeFileSync)

    4. Copy references/ if exists
       - copySync(.claude/skills/<name>/references → .gemini/skills/<name>/references)
}
```

---

## Compiler API

```javascript
class ClaudeToGeminiCompiler {
  constructor(sourcePath = ".claude", targetPath = ".gemini") {
    this.sourcePath = sourcePath;
    this.targetPath = targetPath;
  }

  compile() {
    // Main entry point

    1. Scan source paths
    2. Parse all artifacts (skills, commands, agents)
    3. Transform each artifact
    4. Write to target
    5. Validate output
    6. Return summary
  }

  compileSkills() {
    const skillDirs = fs.readdirSync(`${this.sourcePath}/skills`);

    for each skillDir:
      const parsed = parseClaudeSkill(`${this.sourcePath}/skills/${skillDir}`);
      const transformed = transformSkillToGemini(parsed);
      writeGeminiArtifacts([{
        type: 'skill',
        name: skillDir,
        content: transformed,
        referencesPath: `${this.sourcePath}/skills/${skillDir}/references`
      }]);
  }

  compileCommands() {
    const cmdFiles = fs.readdirSync(`${this.sourcePath}/commands`).filter(f => f.endsWith('.md'));

    for each cmdFile:
      const parsed = parseClaudeCommand(`${this.sourcePath}/commands/${cmdFile}`);
      const transformed = transformCommandToGemini(parsed);
      writeGeminiArtifacts([{
        type: 'command',
        name: parsed.name,
        content: transformed
      }]);
  }

  compileAgents() {
    const agentFiles = fs.readdirSync(`${this.sourcePath}/agents`).filter(f => f.endsWith('.md'));

    for each agentFile:
      const parsed = parseClaudeAgent(`${this.sourcePath}/agents/${agentFile}`);
      const transformed = transformAgentToGemini(parsed);
      writeGeminiArtifacts([{
        type: 'agent',
        name: parsed.name,
        content: transformed
      }]);
  }
}
```

---

## Estratégia de Validação

Após compilação, validar:

1. **Integridade**: Cada skill tem SKILL.md com frontmatter válido
2. **Referências**: Nenhuma referência está quebrada
3. **Nomes**: Nenhum conflito de nomes entre plataformas
4. **Semanântica**: O conteúdo transformado mantém a semântica original

```javascript
validateCompilation(targetPath = ".gemini") {
  const results = {
    skills: validateSkills(`${targetPath}/skills`),
    commands: validateCommands(`${targetPath}/custom-commands`),
    errors: []
  };

  return results;
}
```

---

## Integração com CLI

### Novo flag: `--platform`

```bash
# Instalar para Claude (default)
npx sdd-kit init

# Instalar para Gemini
npx sdd-kit init --platform gemini

# Instalar para ambas
npx sdd-kit init --platform both
# ou
npx sdd-kit init --all-platforms
```

### Fluxo do install.js refatorado

```javascript
async function install(options) {
    const platform = options.platform || "claude"; // default

    if (platform === "claude") {
        await installClaude(options);
    } else if (platform === "gemini") {
        // 1. Compile Claude → Gemini
        const compiler = new ClaudeToGeminiCompiler(
            "./template/.claude",
            "./template/.gemini",
        );
        compiler.compile();

        // 2. Copy .gemini to project
        await installGemini(options);
    } else if (platform === "both" || options.allPlatforms) {
        await installClaude(options);
        await installGemini(options);
    }
}
```

---

## Próximas Fases (Roadmap)

1. **v1.1-alpha**: Compilador básico (skills + commands)
2. **v1.1-beta**: Suporte a agents e validação
3. **v1.1-rc**: Testes de round-trip (Claude ↔ Gemini)
4. **v1.2**: Suporte a 3ª plataforma (formato agnóstico)
5. **v2.0**: Hot-reload (mudanças em fonte → regeneração automática)
