# sdd-kit

> Toolkit de comandos, agentes e skills para **Specification-Driven Development (SDD)** com Claude Code.

O `sdd-kit` instala no seu projeto (ou globalmente) um conjunto de artefatos prontos para uso no Claude Code, cobrindo todo o fluxo SDD — da constituição à implementação.

---

## O que é instalado

| Artefato     | Localização         | Descrição                                        |
| ------------ | ------------------- | ------------------------------------------------ |
| **Comandos** | `.claude/commands/` | Comandos `/sdd-*` para cada etapa do fluxo SDD   |
| **Agentes**  | `.claude/agents/`   | Agentes especializados (ex: `impl-agent`)        |
| **Skills**   | `.claude/skills/`   | Skills reutilizáveis referenciadas pelos agentes |

---

## Requisitos

- [Node.js](https://nodejs.org) 18 ou superior
- [Claude Code](https://claude.ai/code) instalado e configurado

---

## Instalação

### No projeto atual (recomendado)

Adiciona os artefatos em `.claude/` dentro do diretório do seu projeto:

```bash
npx sdd-kit init
```

### Globalmente

Instala em `~/.claude/`, tornando os artefatos disponíveis em qualquer projeto:

```bash
npx sdd-kit init --global
```

### Instalação permanente via npm

```bash
npm install -g sdd-kit
sdd-kit init
```

---

## Uso

Após a instalação, os comandos ficam disponíveis diretamente no Claude Code. O fluxo SDD segue a ordem abaixo:

### Fluxo SDD

| Comando | Descrição |
| ------- | --------- |
| `/sdd:create-constitution` | Cria o `constitution.md` do projeto de forma incremental, seção por seção |
| `/sdd:create-prd` | Cria o PRD (Product Requirements Document) de uma feature de forma incremental |
| `/sdd:create-user-stories` | Cria o arquivo de estórias de usuário a partir do PRD da feature |
| `/sdd:create-scenarios` | Cria o arquivo de cenários BDD (`.feature`) a partir do PRD e das User Stories |
| `/sdd:create-reqs` | Cria os requisitos funcionais no formato EARS a partir do PRD, User Stories e cenários BDD |
| `/sdd:create-nf-reqs` | Cria os requisitos não funcionais a partir do PRD, User Stories, cenários BDD e requisitos funcionais |
| `/sdd:create-design` | Cria o documento de design técnico da feature a partir dos requisitos funcionais e não funcionais |
| `/sdd:create-design-system` | Cria os arquivos do design system do projeto (`colors.md`, `typography.md`, `spacing.md`, `components.md`, `themes.md`) em `docs/design-system/` |
| `/sdd:extract-views` | Extrai telas/views dos cenários BDD e gera um `tela.md` por tela com componentes, estados e considerações de UX |
| `/sdd:create-test-strategy` | Cria o `test-strategy.md` da feature definindo testes por tipo (unitário, integração, E2E, performance, segurança) |
| `/sdd:create-tasks` | Gera o `tasks.md` da feature com tasks organizadas por requisito funcional, em granularidade de card de board |
| `/sdd:implement` | Implementa as tasks de uma feature de forma incremental, uma por vez, com verificação por testes e relatório antes de avançar |

### Utilitários

| Comando | Descrição |
| ------- | --------- |
| `/commit` | Analisa as mudanças no repositório e sugere uma mensagem de commit em português seguindo o padrão Conventional Commits. Aceita a flag `-y` para confirmar o commit automaticamente |

---

## Estrutura instalada

```
.claude/
├── commands/
│   ├── sdd-spec.md
│   ├── sdd-impl.md
│   └── sdd-review.md
├── agents/
│   └── impl-agent.md
└── skills/
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
