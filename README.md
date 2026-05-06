# sdd-kit

> Toolkit de comandos, agentes e skills para **Specification-Driven Development (SDD)** com Claude Code e Gemini CLI.

O `sdd-kit` instala no seu projeto (ou globalmente) um conjunto de artefatos prontos para uso, cobrindo todo o fluxo SDD — da constituição à implementação.

---

## Plataformas suportadas

| Plataforma      | Localização instalada | Artefatos                                      |
| --------------- | --------------------- | ---------------------------------------------- |
| **Claude Code** | `.claude/`            | Comandos `/sdd-*`, agentes e skills            |
| **Gemini CLI**  | `.gemini/`            | Custom commands `/sdd-*`, extensions e skills  |

---

## O que é instalado

### Claude Code (`.claude/`)

| Artefato     | Localização         | Descrição                                        |
| ------------ | ------------------- | ------------------------------------------------ |
| **Comandos** | `.claude/commands/` | Comandos `/sdd-*` para cada etapa do fluxo SDD   |
| **Agentes**  | `.claude/agents/`   | Agentes especializados (ex: `impl-agent`)        |
| **Skills**   | `.claude/skills/`   | Skills reutilizáveis referenciadas pelos agentes |

### Gemini CLI (`.gemini/`)

| Artefato            | Localização              | Descrição                                        |
| ------------------- | ------------------------ | ------------------------------------------------ |
| **Custom Commands** | `.gemini/custom-commands/` | Comandos `/sdd-*` para cada etapa do fluxo SDD |
| **Skills**          | `.gemini/skills/`        | Extensions e skills reutilizáveis pelos agentes  |

---

## Requisitos

- [Node.js](https://nodejs.org) 18 ou superior
- [Claude Code](https://claude.ai/code) e/ou [Gemini CLI](https://github.com/google-gemini/gemini-cli) instalado e configurado

---

## Instalação

### No projeto atual (recomendado)

Ao rodar sem flags, um prompt interativo pergunta qual plataforma instalar:

```bash
npx @dfialho84/sdd-kit init
```

```
🚀 sdd-kit - Qual plataforma você deseja instalar?

1) Claude Code
2) Gemini CLI
3) Ambas as plataformas

Escolha uma opção (1-3):
```

### Especificando a plataforma diretamente

```bash
# Apenas Claude Code
npx @dfialho84/sdd-kit init --platform=claude

# Apenas Gemini CLI
npx @dfialho84/sdd-kit init --platform=gemini

# Ambas as plataformas
npx @dfialho84/sdd-kit init --platform=both
# ou
npx @dfialho84/sdd-kit init --all-platforms
```

### Globalmente

Instala em `~/.claude/` e/ou `~/.gemini/`, tornando os artefatos disponíveis em qualquer projeto:

```bash
npx @dfialho84/sdd-kit init --global
npx @dfialho84/sdd-kit init --global --platform=gemini
npx @dfialho84/sdd-kit init --global --all-platforms
```

### Instalação permanente via npm

```bash
npm install -g @dfialho84/sdd-kit
sdd-kit init
```

---

## Uso

Após a instalação, os comandos ficam disponíveis diretamente no Claude Code ou no Gemini CLI. O fluxo SDD segue a ordem abaixo:

### Fluxo SDD

| Comando                     | Descrição                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/sdd:create-constitution`  | Cria o `constitution.md` do projeto de forma incremental, seção por seção                                                                        |
| `/sdd:create-prd`           | Cria o PRD (Product Requirements Document) de uma feature de forma incremental                                                                   |
| `/sdd:create-user-stories`  | Cria o arquivo de estórias de usuário a partir do PRD da feature                                                                                 |
| `/sdd:create-scenarios`     | Cria o arquivo de cenários BDD (`.feature`) a partir do PRD e das User Stories                                                                   |
| `/sdd:create-reqs`          | Cria os requisitos funcionais no formato EARS a partir do PRD, User Stories e cenários BDD                                                       |
| `/sdd:create-nf-reqs`       | Cria os requisitos não funcionais a partir do PRD, User Stories, cenários BDD e requisitos funcionais                                            |
| `/sdd:create-design`        | Cria o documento de design técnico da feature a partir dos requisitos funcionais e não funcionais                                                |
| `/sdd:create-design-system` | Cria os arquivos do design system do projeto (`colors.md`, `typography.md`, `spacing.md`, `components.md`, `themes.md`) em `docs/design-system/` |
| `/sdd:extract-views`        | Extrai telas/views dos cenários BDD e gera um `tela.md` por tela com componentes, estados e considerações de UX                                  |
| `/sdd:create-test-strategy` | Cria o `test-strategy.md` da feature definindo testes por tipo (unitário, integração, E2E, performance, segurança)                               |
| `/sdd:create-tasks`         | Gera o `tasks.md` da feature com tasks organizadas por requisito funcional, em granularidade de card de board                                    |
| `/sdd:implement`            | Implementa as tasks de uma feature de forma incremental, uma por vez, com verificação por testes e relatório antes de avançar                    |

### Utilitários

| Comando   | Descrição                                                                                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/commit` | Analisa as mudanças no repositório e sugere uma mensagem de commit em português seguindo o padrão Conventional Commits. Aceita a flag `-y` para confirmar o commit automaticamente |

---

## Estrutura instalada

### Claude Code

```
.claude/
├── commands/sdd/
│   ├── create-constitution.md
│   ├── create-prd.md
│   └── ...
├── agents/
│   └── impl-agent.md
└── skills/
    └── ...
```

### Gemini CLI

```
.gemini/
├── custom-commands/
│   ├── create-constitution.md
│   ├── create-prd.md
│   └── ...
└── skills/
    ├── impl-agent-agent/
    └── ...
```

---

## Atualização

Para atualizar os artefatos para a versão mais recente do pacote:

```bash
npx sdd-kit@latest init
```

> Por padrão, arquivos existentes **não são sobrescritos**. Use `--force` para forçar a atualização:
>
> ```bash
> npx sdd-kit init --force
> ```

---

## Verificar o que será instalado

```bash
npx sdd-kit list
```

Lista todos os artefatos que seriam copiados, sem instalar nada.

---

## Licença

MIT
