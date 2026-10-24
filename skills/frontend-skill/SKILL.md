---
name: frontend-skill
description: |
  Create visually strong landing pages, websites, and app UIs with restrained composition. OpenAI's production frontend playbook.
triggers:
  - "landing page"
  - "frontend playbook"
  - "ui composition"
  - "restrained ui"
od:
  mode: design-system
  category: design-systems
  upstream: "https://github.com/openai/skills"
---

# frontend-skill

> Curated from OpenAI's skills repository.

## What it does

Create visually strong landing pages, websites, and app UIs with restrained composition. OpenAI's production frontend playbook.

## Source

- Upstream: https://github.com/openai/skills
- Category: `design-systems`

## How to use

Before implementing frontend design or writing CSS with the upstream skill, read <https://good-css.com/> and consult the relevant entries. Apply them within the project's browser support, accessibility requirements, and design system.

This catalogue entry advertises the skill in OpenDesign so the agent
discovers it during planning. To run the full upstream workflow with
its original assets, scripts, and references, install the upstream
bundle into your active agent's skills directory:

```bash
# Inspect the upstream README for exact paths
open https://github.com/openai/skills
```

Then ask the agent to invoke this skill by name (`frontend-skill`) or with
one of the trigger phrases listed in this skill's frontmatter.
