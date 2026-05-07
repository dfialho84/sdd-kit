---
name: gemini-conversion-standards
description: >
    Regras de conversão de artefatos Claude Code (skills, commands, agents) para o
    formato Gemini CLI. Usado pelo gemini-converter-agent antes de publicar o sdd-kit.
---

# Padrões de Conversão Claude → Gemini

## Mapeamento de tipos

| Tipo Claude | Arquivo fonte | Arquivo destino | Formato |
|-------------|--------------|-----------------|---------|
| Command | `template/.claude/commands/**/*.md` | `template/.gemini/commands/{name}.toml` | TOML |
| Skill | `template/.claude/skills/{name}/SKILL.md` | `template/.gemini/skills/{name}/SKILL.md` | Markdown |
| Agent | `template/.claude/agents/{name}.md` | `template/.gemini/skills/{name}-agent/SKILL.md` | Markdown |

---

## Commands: `.md` → `.toml`

O formato de commands do Gemini CLI é **TOML** (extensão `.toml`), não JSON.
O `name` **não** vai no arquivo — é derivado do nome do arquivo.

### Estrutura do arquivo fonte (Claude)

```markdown
---
name: create-prd
description: cria um arquivo PRD de forma incremental
argument-hint: feature-slug [instruções adicionais]
---

Inicie o agente `prd-creator-agent`.
Repasse para o agente o parâmetro informado pelo usuário: $ARGUMENTS
```

### Estrutura do arquivo destino (Gemini)

`template/.gemini/commands/create-prd.toml`:
```toml
description = "cria um arquivo PRD de forma incremental"
prompt = """
Inicie o agente `prd-creator-agent`.
Repasse para o agente o parâmetro informado pelo usuário: {{args}}
"""
```

### Regras

- **Formato:** TOML, extensão `.toml`. Nunca JSON.
- **`name`:** NÃO inclua no arquivo TOML — o nome do command é o nome do arquivo.
- `description` do frontmatter → campo `description` TOML (string entre aspas duplas)
- Corpo do markdown (tudo após o `---` de fechamento) → campo `prompt` TOML (multiline string com `"""`)
- `$ARGUMENTS` no corpo → substituir por `{{args}}` no `prompt`
- Remova campos exclusivos do Claude: `argument-hint`, `model`, `color`, `tools`, `skills`
- **Não** adicione `{{args}}` se `$ARGUMENTS` não estiver no original
- Commands em subdiretórios (ex: `commands/sdd/create-prd.md`) → destino flat em `commands/create-prd.toml`
- Diretório destino: `template/.gemini/commands/` (não `custom-commands/`)

---

## Skills: `SKILL.md` → `SKILL.md`

### Frontmatter Claude → Gemini

| Campo Claude | Ação |
|-------------|------|
| `name` | Manter |
| `description` | Manter (extrair texto completo se multiline `>`) |
| `argument-hint` | Remover |
| `model` | Remover |
| `color` | Remover |
| `tools` | Remover |
| `skills` | Remover |

### Exemplo

**Fonte:**
```markdown
---
name: prd-standards
description: >
    Padrões de qualidade para criação de PRDs (Product Requirements Documents)
    neste projeto. Define as 10 seções obrigatórias...
---

# Padrões de PRD
...
```

**Destino:**
```markdown
---
name: prd-standards
description: "Padrões de qualidade para criação de PRDs (Product Requirements Documents) neste projeto. Define as 10 seções obrigatórias..."
---

# Padrões de PRD
...
```

### Regras

- Corpo do markdown é preservado **integralmente** — não resuma, não reescreva
- Se existir subdiretório `references/`, copie-o com `cp -r` (Bash)
- O `description` multiline YAML deve ser convertido para string única (normalizar espaços/quebras)

---

## Agents: `.md` → `skills/{name}-agent/SKILL.md`

### Exemplo

**Fonte** (`agents/prd-creator-agent.md`):
```markdown
---
name: prd-creator-agent
description: >
    Agente entrevistador que constrói um PRD...
model: haiku
color: purple
tools: Read, Write, Edit, Glob, Bash, AskUserQuestion
skills:
    - _base-agent
    - prd-standards
---

# prd-creator-agent — Entrevistador de PRD
...
```

**Destino** (`skills/prd-creator-agent-agent/SKILL.md`):
```markdown
---
name: prd-creator-agent
description: "Agente entrevistador que constrói um PRD..."
---

# prd-creator-agent — Entrevistador de PRD
...
```

### Regras

- Nome do diretório de destino: `{name}-agent` (adiciona sufixo `-agent` ao valor de `name`)
- Manter apenas `name` e `description` no frontmatter
- Corpo do markdown preservado **integralmente**
- Campos removidos: `model`, `color`, `tools`, `skills`
- `description` multiline → string única (mesma regra das skills)

---

## Tratamento de `description` multiline YAML

O Claude usa a sintaxe `>` do YAML para descriptions longas:

```yaml
description: >
    Primeira linha
    segunda linha
    terceira linha
```

O valor real é: `"Primeira linha segunda linha terceira linha"` (quebras viram espaços, trailing newline removida).

Ao gerar o destino, escreva como string entre aspas simples:
```yaml
description: "Primeira linha segunda linha terceira linha"
```

**Nunca** escreva `description: ">"` — isso indica que o parser não leu o valor corretamente.
