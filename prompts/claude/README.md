# prompts/claude/

Reusable prompts for **Anthropic Claude**.

## What Belongs Here

Prompts designed for Claude models (e.g., the Opus, Sonnet, and Haiku families) and Claude-based tools such as Claude Code. Good candidates include architecture reasoning, long-context documentation work, code review, refactoring, and multi-step planning where Claude excels.

## Conventions

- One prompt per Markdown file, `kebab-case.md`.
- Include: **intent**, the **prompt** itself, and **expected output**.
- Keep prompts reusable; project-specific context belongs in [`../../memory/`](../../memory).
- Note any model or tool assumptions (e.g., "assumes Claude Code with repo access").
