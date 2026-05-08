---
name: convert-to-gemini
description: Regenera template/.gemini/ a partir de template/.claude/ usando o gemini-converter-agent
---

Inicie o agente `gemini-converter-agent`.

Contexto para o agente:
- Origem: `template/.claude/` (relativo à raiz do projeto sdd-kit)
- Destino: `template/.gemini/` (relativo à raiz do projeto sdd-kit)
- Instrução: limpar o destino antes de converter para evitar artefatos obsoletos
