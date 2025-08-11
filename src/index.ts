#!/usr/bin/env node
// src/index.ts

import path from "node:path";
import fs from "node:fs";
import minimist from "minimist";
import kleur from "kleur";
import ora from "ora";
import { ask } from "./prompts.js";
import { registry } from "./registry.js";
import { copyTemplate } from "./fetchTemplate.js";
import { finalizeProject } from "./postInstall.js";
import { buildTreeString, writeTreeToFile } from "./tree.js"

const argv = minimist(process.argv.slice(2), {
  string: ["template", "name", "tag", "dir", "pm"],
  boolean: ["install", "git", "yes", "tree"],
  default: { install: undefined, git: undefined, tree: false },
});

function getProjectName(dir: string): string {
  try {
    const pkgJsonPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
      if (pkg.name) return pkg.name;
    }
  } catch {
    // ignore error and fallback below
  }
  return path.basename(dir);
}

function prefixTreeWithRootName(treeStr: string, rootName: string): string {
  const indent = '│   ';
  const lines = treeStr.split('\n').filter(Boolean);
  const indentedLines = lines.map(line => indent + line);
  return `${rootName}/\n${indentedLines.join('\n')}\n`;
}

(async () => {
  if (argv.tree) {
    const dirToPrint = path.resolve(process.cwd(), argv.dir || ".");
    const rootName = getProjectName(dirToPrint);
    const fullTreeColored = buildTreeString(dirToPrint, '', { color: true });

    console.log(kleur.bold(`\nProject structure for: ${dirToPrint}`));
    console.log(kleur.bold(`Generating project structure for: ${dirToPrint}\n`));

    const treeWithRoot = `${rootName}/\n${fullTreeColored}`;
    const treeLines = treeWithRoot.trim().split('\n');
    const snippetLimit = 30;
    if (treeLines.length > snippetLimit) {
      console.log(treeLines.slice(0, snippetLimit).join('\n'));
      console.log(kleur.gray(`\n...snipped ${treeLines.length - snippetLimit} lines...\n`));
    } else {
      console.log(treeWithRoot);
    }

    const structurePath = path.join(dirToPrint, 'structure.txt');
    const projectStructurePath = path.join(dirToPrint, 'project_structure.txt');
    const filePathToWrite = fs.existsSync(structurePath) ? projectStructurePath : structurePath;
    const plainTree = buildTreeString(dirToPrint, '', { color: false });
    const plainWithRoot = `${rootName}/\n${plainTree}`;

    fs.writeFileSync(filePathToWrite, plainWithRoot);

    console.log(kleur.green(`Project structure mapped and written.`));
    console.log(kleur.green(`Check it out at: ${filePathToWrite}\n`));
    process.exit(0);
  }


  const answers = await ask({
    name: argv.name,
    templateKey: argv.template as any,
    install: argv.install,
    git: argv.git,
  });

  const dest = path.resolve(process.cwd(), argv.dir ?? answers.name);

  if (fs.existsSync(dest) && fs.readdirSync(dest).length > 0) {
    if (!argv.yes) {
      console.error(kleur.red(`\nError: Target directory '${dest}' is not empty.`));
      console.log(
        kleur.yellow(
          `\nTip: Re-run with ${kleur.bold("--yes")} to overwrite, or choose an empty folder.\n`
        )
      );
      process.exit(1);
    }
  }
  fs.mkdirSync(dest, { recursive: true });

  const entry = registry[answers.templateKey];
  const repoRef = argv.tag ? `${entry.repo.split("#")[0]}#${argv.tag}` : entry.repo;

  const spin = ora(`Fetching ${entry.label} ...`).start();
  try {
    await copyTemplate(repoRef, entry.subdir, dest);
    spin.succeed("Template copied");
  } catch (e) {
    spin.fail("Failed to fetch template");
    console.error(e);
    process.exit(1);
  }

  const hasPackageJson = fs.existsSync(path.join(dest, "package.json"));

  await finalizeProject(dest, answers.name, {
    install: hasPackageJson ? !!answers.install : false,
    git: !!answers.git,
    pm: (argv.pm as "npm" | "yarn" | "pnpm" | "bun" | undefined),
  });

  console.log(`\n${kleur.bold("Done!")} Created ${kleur.cyan(answers.name)} at ${kleur.gray(dest)}\n`);
  console.log(kleur.bold("Next steps:"));
  console.log(`  cd ${answers.name}`);

  if (hasPackageJson) {
    const pm = (argv.pm || "npm") as "npm" | "yarn" | "pnpm" | "bun";
    const commands: Record<typeof pm, [string, string]> = {
      npm: ["npm install", "npm run dev"],
      yarn: ["yarn install", "yarn dev"],
      pnpm: ["pnpm install", "pnpm dev"],
      bun: ["bun install", "bun dev"],
    };

    const [installCmd, devCmd] = commands[pm] || commands.npm;

    if (!answers.install) console.log(`  ${installCmd}`);
    console.log(`  ${devCmd}\n`);
  } else {
    console.log(`  Open ${kleur.cyan("index.html")} in your browser.`);
    console.log(`  Or serve locally:\n    - live-server\n    - python3 -m http.server\n`);
  }

  process.exit(0);
})();
