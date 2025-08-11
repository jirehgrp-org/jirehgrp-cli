# jirehgrp-cli

A fast, interactive **CLI tool** for scaffolding frontend projects from the [Jireh Group Templates](https://github.com/jirehgrp-org/jirehgrp-templates) repository.

Supports **Next.js**, **React + Vite**, **Vue 3 + Vite**, **SvelteKit + Vite**, **Vanilla JS/TS**, and **Vanilla + Vite (JS/TS)** — all preconfigured with multilingual (🇪🇹 / 🇺🇸) and theme toggle support.

---

## Features

* **Interactive CLI** — Choose project name, framework, language variant, install dependencies, and initialize Git.
* **Multiple Frameworks** — Next.js, React (Vite), Vue 3 (Vite), SvelteKit (Vite), Vanilla JS/TS (+ Vite).
* **Multilingual Ready** — Amharic 🇪🇹 + English 🇺🇸 toggle included in most templates.
* **Theme Toggle** — Dark/Light mode out of the box.
* **Multiple Package Managers** — Works with **npm**, **yarn**, **pnpm**, and **bun**.
* **Git Integration** — Optional `git init` with first commit.
* **Direct Template Fetching** — Downloads templates straight from our GitHub repo via [degit](https://github.com/Rich-Harris/degit).
* **Project Structure Mapping** — Use `--tree` flag to generate a visual tree of your project folder saved as `structure.txt`.

---

## Getting Started

Pick your favorite package manager:

```bash
# npm
npx jirehgrp@latest

# yarn (classic)
yarn create jirehgrp

# yarn
yarn dlx create jirehgrp

# pnpm
pnpm dlx jirehgrp

# bun
bunx jirehgrp
```

Follow the prompts:

1. **Project Name** — Added to `package.json` (when present).
2. **Template** — Pick a framework + JS/TS.
3. **Install Dependencies?** — Automatically runs with your package manager.
4. **Initialize Git?** — Optional first commit.

---

## CLI Options

You can also use flags to customize behavior:

| Flag         | Type    | Description                                                                            |
| ------------ | ------- | -------------------------------------------------------------------------------------- |
| `--name`     | string  | Specify project name upfront, skips prompt.                                            |
| `--template` | string  | Choose template upfront (e.g. `react-vite/ts`), skips prompt.                          |
| `--install`  | boolean | Automatically install dependencies after scaffolding (overrides prompt).               |
| `--git`      | boolean | Initialize a git repository with first commit (overrides prompt).                      |
| `--yes`      | boolean | Overwrite non-empty target directories without confirmation.                           |
| `--dir`      | string  | Specify the target directory to create the project in (defaults to project name).      |
| `--pm`       | string  | Force package manager (`npm`, `yarn`, `pnpm`, or `bun`) for install and commands.      |
| `--tag`      | string  | Specify Git branch, tag, or commit ref when fetching the template.                     |
| `--tree`     | boolean | Generate a `structure.txt` file showing the folder structure of an existing directory. |

---

### Generate Project Structure Tree

Generate a tree view of an existing project directory without scaffolding a new project:

```bash
# Long form
npx jirehgrp --tree --dir ./path/to/project
```

This creates a `structure.txt` file inside the specified directory containing a colored, hierarchical listing of folders and files, ignoring common unwanted files/folders.

---

### Overwrite Behavior

If the target directory exists and is **not empty**, the CLI will exit with an error unless you use the `--yes` flag to force overwriting.

Example:

```bash
jirehgrp --template nextjs --name myapp --yes
```

---

### Examples

```bash
# Scaffold a Next.js (TS) project, install deps, and initialize git
npx jirehgrp --template nextjs --install --git

# Scaffold React + Vite TS project into ./my-app directory, overwrite if exists
jirehgrp --template react-vite/ts --name my-app --yes

# Generate a folder tree of an existing project directory
jirehgrp --tree --dir ./my-app
```

---

## Folder Structure

```plaintext
jirehgrp-cli/
├── src/
│   ├── fetchTemplate.ts    # Template fetching logic
│   ├── index.ts            # CLI entry point
│   ├── postInstall.ts      # Package manager install + git init
│   ├── prompts.ts          # CLI questions
│   ├── registry.ts         # Maps CLI choices to template paths
│   └── tree.ts             # Project structure mapping feature
├── LICENSE
├── package.json            # Bin config, dependencies, version
├── README.md
└── tsconfig.json
```

---

## Template Source

All templates are stored in:

**[jirehgrp-templates](https://github.com/jirehgrp-org/jirehgrp-templates)**

Each CLI option maps to a subfolder inside `templates/` (see [`registry.ts`](src/registry.ts)).

---

## Package Manager Support

The CLI detects or allows you to choose a package manager and prints the **correct next steps**:

* **npm** → `npm install` → `npm run dev`
* **yarn** → `yarn install` → `yarn dev`
* **pnpm** → `pnpm install` → `pnpm dev`
* **bun** → `bun install` → `bun dev`

---

## Requirements

* **Node.js >= 18** is required to run the jirehgrp-cli.

---

## Architecture Overview

* `src/index.ts` — CLI entry point and main control flow
* `src/fetchTemplate.ts` — Handles cloning and copying templates via degit
* `src/postInstall.ts` — Installs dependencies and initializes git repo
* `src/prompts.ts` — Interactive CLI prompts with user
* `src/registry.ts` — Template definitions and repo metadata
* `src/tree.ts` — Generates visual folder tree for `--tree` flag

---

## Thank You

Thank you to everyone who has downloaded and tried **jirehgrp** so far! 🚀

We’re excited to see 135+ weekly downloads just days after launch — your support means a lot and motivates us to keep improving.

If you have any feedback, issues, or feature requests, please open an issue or contribute on GitHub. We love hearing from you!

---

## Credits

Built with:

* [degit](https://github.com/Rich-Harris/degit) – Template fetching
* [ora](https://github.com/sindresorhus/ora) – CLI spinners
* [kleur](https://github.com/lukeed/kleur) – Terminal colors
* [prompts](https://github.com/terkelg/prompts) – Interactive CLI

Licensed under MIT © 2025 [JirehGroup](https://jirehgrp.com)

---

**Made with ❤️ by the [JirehGroup](https://jirehgrp.com) Team**
