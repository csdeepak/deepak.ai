# prompts/

Curated, reusable prompts organized by AI tool.

As AI assistants participate in building and maintaining Deepak Labs, the prompts that produce good results are captured here so they can be reused and improved over time.

## Structure

| Folder | Tool |
| --- | --- |
| [`claude/`](claude) | Anthropic Claude. |
| [`gpt/`](gpt) | OpenAI GPT models. |
| [`gemini/`](gemini) | Google Gemini. |
| [`cursor/`](cursor) | Cursor editor. |
| [`copilot/`](copilot) | GitHub Copilot. |

## Conventions

- One folder per tool, each with a `README.md` describing what belongs there.
- Store prompts as individual Markdown files with a short description of intent and expected output.
- Keep prompts general and reusable; project-specific context lives in [`memory/`](../memory).
