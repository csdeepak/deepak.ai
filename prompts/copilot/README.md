# prompts/copilot/

Reusable prompts for **GitHub Copilot**.

## What Belongs Here

Prompts, chat instructions, and custom-instruction snippets for GitHub Copilot and Copilot Chat as used with this repository.

## Available Prompts

| Prompt | Target | Purpose |
| --- | --- | --- |
| [`project-knowledge-extraction.md`](project-knowledge-extraction.md) | Chat (repo-scoped) | Audit a project repo and draft Dex knowledge cards + FAQs from real code, tests, and commit history — with citations and an explicit unknowns list. |

## Conventions

- One prompt per Markdown file, `kebab-case.md`.
- Include: **intent**, the **prompt** itself, and **expected output**.
- Keep prompts reusable; project-specific context belongs in [`../../memory/`](../../memory).
- Note whether a prompt targets inline completion or Copilot Chat.
