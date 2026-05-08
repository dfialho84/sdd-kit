# Guia de Desenvolvimento do sdd-kit

## Estrutura do projeto

```
sdd-kit/
├── bin/sdd-kit.js          ← CLI: init, compile
├── src/
│   ├── install.js          ← lógica de instalação multi-plataforma
│   └── compilers/
│       ├── index.js        ← compilador principal
│       ├── claude-parser.js     ← lê artefatos de template/.claude/
│       ├── gemini-transformer.js ← converte para formato Gemini
│       └── gemini-writer.js     ← escreve em template/.gemini/
└── template/
    ├── .claude/            ← SOURCE OF TRUTH (edite aqui)
    │   ├── skills/
    │   ├── commands/
    │   └── agents/
    └── .gemini/            ← GERADO AUTOMATICAMENTE (não edite)
        ├── skills/
        └── custom-commands/
```

---

## Regra fundamental

**Nunca edite `template/.gemini/` diretamente.** Qualquer alteração manual será sobrescrita na próxima compilação. Todo o conteúdo é gerado a partir de `template/.claude/`.

---

## Editando artefatos existentes

### Skill

Edite o arquivo `template/.claude/skills/<nome>/SKILL.md`.

```markdown
---
description: Descrição clara do que essa skill faz e quando usar
---

# Título da Skill

Instruções para o agente...
```

Após editar, [recompile](#recompilando).

### Command

Edite o arquivo `template/.claude/commands/<nome>.md`.

```markdown
---
description: O que este comando faz
---

Prompt do comando...
```

Após editar, [recompile](#recompilando).

### Agent

Edite o arquivo `template/.claude/agents/<nome>.md`.

```markdown
---
description: Papel deste agente
role: <papel>
tools:
    - ferramenta1
    - ferramenta2
---

Instruções do sistema do agente...
```

Após editar, [recompile](#recompilando).

---

## Adicionando novos artefatos

### Nova skill

```bash
mkdir -p template/.claude/skills/<nome>/references
touch template/.claude/skills/<nome>/SKILL.md
touch template/.claude/skills/<nome>/references/interview-guide.md
touch template/.claude/skills/<nome>/references/<nome>-example.md
```

### Novo command

```bash
touch template/.claude/commands/<nome>.md
```

### Novo agent

```bash
touch template/.claude/agents/<nome>.md
```

Após criar, [recompile](#recompilando).

---

## Removendo artefatos

Apenas delete o arquivo/diretório em `template/.claude/`. A próxima compilação limpa automaticamente o `template/.gemini/` correspondente (o compile faz clean antes de gerar).

---

## Recompilando

Execute, dentro do CLAUDE CLI, após **qualquer** alteração em `template/.claude/`:

```bash
/convert-to-gemini
```

Isso:

1. Apaga `template/.gemini/` completamente
2. Relê todos os artefatos de `template/.claude/`
3. Transforma para o formato de cada plataforma
4. Grava `template/.gemini/` atualizado

Confirme que a saída termina com `✨ Compilation successful!` antes de prosseguir.

---

## Testando localmente

### Teste de instalação Claude

```bash
mkdir /tmp/test-sdd && node bin/sdd-kit.js init --platform claude
# Verifique: ls /tmp/test-sdd/.claude/
```

### Teste de instalação Gemini

```bash
mkdir /tmp/test-sdd && node bin/sdd-kit.js init --platform gemini
# Verifique: ls /tmp/test-sdd/.gemini/
```

### Teste de instalação ambas as plataformas

```bash
mkdir /tmp/test-sdd && node bin/sdd-kit.js init --all-platforms
# Verifique: ls /tmp/test-sdd/
```

---

## Publicando

### Fluxo completo

```bash
# 1. Faça as alterações em template/.claude/

# 2. Recompile para gerar template/.gemini/
node bin/sdd-kit.js compile

# 3. Atualize a versão no package.json
#    Use semver: patch (bug), minor (feature), major (breaking)
npm version patch   # 1.0.4 → 1.0.5
npm version minor   # 1.0.4 → 1.1.0
npm version major   # 1.0.4 → 2.0.0

# 4. Publique no npm
npm publish

# 5. Faça commit e push (npm version já cria o commit e tag)
git push && git push --tags
```

### O que é incluído no pacote

Controlado pelo campo `files` no `package.json`:

```json
"files": ["bin/", "template/", "src/"]
```

Isso significa que `template/.gemini/` **é publicado** junto com o pacote — usuários recebem os artefatos já compilados, sem precisar rodar o compilador.

---

## Adicionando suporte a uma nova plataforma

1. Crie `src/compilers/<plataforma>-transformer.js` com a lógica de transformação
2. Crie `src/compilers/<plataforma>-writer.js` com a lógica de escrita
3. Crie `src/compilers/<plataforma>-compiler.js` orquestrando parser + transformer + writer
4. Adicione a plataforma em `src/install.js`:
    - `installToProject()`: copiar `template/.<plataforma>/` para o projeto
    - `compileTemplates()`: chamar o novo compilador
5. Adicione a opção no prompt interativo em `bin/sdd-kit.js`
6. Compile: `node bin/sdd-kit.js compile --platform <plataforma>`
