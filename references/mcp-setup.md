# MCP Setup for Portfolio Work

## Recommended MCPs

### 1. GitHub MCP

Purpose:

- inspect repos
- read READMEs
- inspect code structure
- map proof trail
- create GitHub Map content

Use with:

- `github-proof-cartographer`
- `project-casefile-curator`

### 2. Playwright MCP

Purpose:

- open local portfolio
- test interactions
- inspect accessibility tree
- verify responsive behavior
- catch broken UI flows

Use with:

- `browser-qa-inspector`
- `motion-polish-reviewer`

### 3. Context7 MCP

Purpose:

- current framework/library docs
- avoid outdated Next/Tailwind/Motion/shadcn usage

Use with:

- implementation tasks only when docs are needed

### 4. Chrome DevTools MCP

Purpose:

- console/network/performance inspection
- rendering and layout diagnostics
- animation performance review

Use with:

- `browser-qa-inspector`
- `motion-polish-reviewer`

### 5. Figma MCP

Purpose:

- only if a Figma moodboard or design exists
- extract design context from selected frames

Use with:

- `visual-reference-translator`

## Suggested CLI commands

```bash
codex mcp add context7 -- npx -y @upstash/context7-mcp
codex mcp add playwright -- npx -y @playwright/mcp@latest
codex mcp add chrome-devtools -- npx -y chrome-devtools-mcp@latest
```

GitHub MCP setup depends on your chosen official GitHub MCP installation method and token policy. Keep tokens in environment variables.

## Security rules

- Do not add random MCP servers with broad access.
- Do not paste secrets into config files.
- Prefer read-only access where possible.
- Disable unused MCP servers.
- Use project-scoped MCP config only in trusted repositories.
