# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

`sdd-kit` is a Node.js CLI that scaffolds Specification-Driven Development (SDD) artifacts into a Claude Code project. Running `sdd-kit init` copies the `template/.claude/` directory into the target project's `.claude/` folder (without overwriting existing files).

## Commands

```bash
# Run the CLI locally (no build step needed)
node bin/sdd-kit.js init            # install to current project
node bin/sdd-kit.js init --global   # install to ~/.claude/

# Install dependencies
npm install

# Test manually by running init in a temp dir
mkdir /tmp/test-sdd && cd /tmp/test-sdd && node /path/to/sdd-kit/bin/sdd-kit.js init
```

There are no build, lint, or test scripts defined. The package ships as plain JS (no compilation).

## Architecture

```
bin/sdd-kit.js        ← CLI entry point; parses argv, calls src/install.js
src/install.js        ← installToProject() / installGlobal() via fs-extra.copySync
template/.claude/     ← the artifact tree that gets copied on init
```

### Template structure

Everything under `template/.claude/` is copied verbatim. Its layout:

| Path | Purpose |
|------|---------|
| `commands/sdd/` | Slash commands covering the full SDD flow (one per artifact) |
| `commands/commit.md` | Commit helper command |
| `agents/` | Specialized sub-agents (impl-agent, tasks-agent, test-strategy-agent, user-stories-agent) |
| `skills/<artifact>-standards/` | Each skill has `SKILL.md` + `references/` (interview guide + example) |

### SDD workflow order (commands)

`create-constitution` → `create-prd` → `create-reqs` / `create-nf-reqs` → `create-design` / `create-design-system` → `extract-views` → `create-user-stories` → `create-scenarios` → `create-test-strategy` → `create-tasks` → `implement`

### Skills anatomy

Each skill under `template/.claude/skills/<name>/` contains:
- `SKILL.md` — standards and instructions for the agent
- `references/interview-guide.md` — questions to gather requirements
- `references/<artifact>-example.md` (or `.feature`) — canonical output example

The `_base-agent` skill is a shared base included by all other agents.

## Key constraint

`copySync` uses `{ overwrite: false }`, so `sdd-kit init` is safe to re-run — it never overwrites existing files in the target project.
