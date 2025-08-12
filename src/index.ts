#!/usr/bin/env node
// src/index.ts

import path from "node:path";
import fs from "node:fs";
import minimist from "minimist";
import kleur from "kleur";
import prompts from "prompts";
import ora from "ora";
import { ask } from "./prompts.js";
import { registry } from "./registry.js";
import { copyTemplate } from "./fetchTemplate.js";
import { finalizeProject } from "./postInstall.js";
import { buildTreeString } from "./tree.js"

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

async function handleDirConflict(dir: string): Promise<string | null> {
  if (!fs.existsSync(dir)) return dir;
  if (fs.readdirSync(dir).length === 0) return dir;

  const response = await prompts({
    type: "select",
    name: "action",
    message: `Target directory '${dir}' exists and is not empty. What do you want to do?`,
    choices: [
      { title: "Overwrite existing folder", value: "overwrite" },
      { title: "Rename new project folder", value: "rename" },
      { title: "Backup existing folder", value: "backup" },
      { title: "Cancel", value: "cancel" },
    ],
  });

  switch (response.action) {
    case "overwrite":
      fs.rmSync(dir, { recursive: true, force: true });
      fs.mkdirSync(dir, { recursive: true });
      return dir;

    case "rename": {
      const renameRes = await prompts({
        type: "text",
        name: "newName",
        message: "Enter new folder name:",
        initial: dir + "-new",
      });
      if (!renameRes.newName) return null;
      const newDir = path.resolve(process.cwd(), renameRes.newName);
      if (fs.existsSync(newDir)) {
        console.error(kleur.red(`Folder '${newDir}' already exists. Aborting.`));
        return null;
      }
      return newDir;
    }

    case "backup": {
      const backupName = dir + "-" + new Date().toISOString().replace(/[:.]/g, "-") + "-backup";
      fs.renameSync(dir, backupName);
      fs.mkdirSync(dir, { recursive: true });
      console.log(kleur.green(`Backed up existing folder to '${backupName}'.`));
      return dir;
    }

    case "cancel":
    default:
      console.log(kleur.yellow("Operation cancelled by user."));
      return null;
  }
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
    install: argv.install,
    git: argv.git,
    mainTemplateKey: argv.template,
    subTemplateKey: argv.template,
  });

  const dest = path.resolve(process.cwd(), argv.dir ?? answers.name);

  let targetDir = dest;
  if (fs.existsSync(targetDir) && fs.readdirSync(targetDir).length > 0) {
    if (!argv.yes) {
      const resolvedDir = await handleDirConflict(targetDir);
      if (!resolvedDir) process.exit(1);
      targetDir = resolvedDir;
    } else {
      fs.rmSync(targetDir, { recursive: true, force: true });
      fs.mkdirSync(targetDir, { recursive: true });
    }
  } else {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const entry = registry[answers.subTemplateKey];
  const repoRef = argv.tag ? `${entry.repo.split("#")[0]}#${argv.tag}` : entry.repo;

  const spin = ora(`Fetching ${entry.label} ...`).start();
  try {
    await copyTemplate(repoRef, entry.subdir, targetDir);
    spin.succeed("Template copied");
  } catch (e) {
    spin.fail("Failed to fetch template");
    console.error(e);
    process.exit(1);
  }

  await finalizeProject(targetDir, answers.name, {
    install: fs.existsSync(path.join(targetDir, "package.json")) ? !!answers.install : false,
    git: !!answers.git,
    pm: argv.pm as "npm" | "yarn" | "pnpm" | "bun" | undefined,
  });

  console.log(`\n${kleur.bold("Done!")} Created ${kleur.cyan(answers.name)} at ${kleur.gray(targetDir)}\n`);
  console.log(kleur.bold("Next steps:"));
  console.log(`  cd ${answers.name}`);

  if (fs.existsSync(path.join(targetDir, "package.json"))) {
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
