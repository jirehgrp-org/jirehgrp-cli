// src/tree.ts

import fs from "fs";
import path from "path";
import kleur from "kleur";

export interface TreeOptions {
  ignore?: string[];
  color?: boolean;
  maxDepth?: number;
  currentDepth?: number;
  excludeExtensions?: string[];
  json?: boolean;
}

function loadIgnoreList(): string[] {
  return [
    "node_modules",
    ".git",
    "dist",
    "build",
    "out",
    "coverage",
    ".cache",
    ".parcel-cache",
    "npm-debug.log",
    "yarn-error.log",
    "pnpm-debug.log",
    "package-lock.json",
    ".DS_Store",
    "Thumbs.db",
    ".next",
    "__pycache__",
    "*.py[cod]",
    "*.egg-info",
    ".pytest_cache",
    ".mypy_cache",
    "log",
    "tmp",
    "vendor/bundle",
    ".byebug_history",
    "vendor",
    ".env",
    ".env.*",
    "storage",
    "db.sqlite3",
    "media",
    "target",
    "*.class",
    "*.jar",
    "*.war",
    "*.ear",
    ".vscode",
    ".idea",
    "*.iml",
    "*.log",
  ];
}

interface TreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: TreeNode[];
}

function shouldExclude(name: string, excludeExtensions: string[] = []): boolean {
  return excludeExtensions.some((ext) => name.endsWith(ext));
}

function buildTreeObject(
  dirPath: string,
  options: TreeOptions = {}
): TreeNode {
  const { ignore = loadIgnoreList(), excludeExtensions = [], maxDepth, currentDepth = 0 } = options;

  if (maxDepth !== undefined && currentDepth > maxDepth) {
    return { name: path.basename(dirPath), path: dirPath, type: "directory" };
  }

  const entries = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((item) => !ignore.includes(item.name))
    .filter((item) => !shouldExclude(item.name, excludeExtensions))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  const children: TreeNode[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      children.push(
        buildTreeObject(fullPath, {
          ...options,
          currentDepth: currentDepth + 1,
        })
      );
    } else {
      children.push({
        name: entry.name,
        path: fullPath,
        type: "file",
      });
    }
  }

  return {
    name: path.basename(dirPath),
    path: dirPath,
    type: "directory",
    children,
  };
}

function buildTreeString(
  dirPath: string,
  prefix = "",
  options: TreeOptions = {}
): string {
  const { ignore = loadIgnoreList(), excludeExtensions = [], maxDepth, currentDepth = 0 } = options;
  const useColor = options.color !== false;

  if (maxDepth !== undefined && currentDepth > maxDepth) {
    return "";
  }

  const entries = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((item) => !ignore.includes(item.name))
    .filter((item) => !shouldExclude(item.name, excludeExtensions))
    .sort((a, b) => {
      if (a.isDirectory() && !b.isDirectory()) return -1;
      if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name);
    });

  let treeString = "";

  entries.forEach((item, index) => {
    const isLast = index === entries.length - 1;
    const connector = isLast ? "└── " : "├── ";
    let name = item.name + (item.isDirectory() ? "/" : "");

    if (useColor) {
      name = item.isDirectory() ? kleur.cyan(name).toString() : kleur.white(name).toString();
    }

    treeString += prefix + connector + name + "\n";

    if (item.isDirectory()) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      treeString += buildTreeString(path.join(dirPath, item.name), newPrefix, {
        ...options,
        currentDepth: currentDepth + 1,
      });
    }
  });

  return treeString;
}

export function writeTreeToFile(
  dirPath: string,
  options: TreeOptions & { rootName?: string } = {}
): string {
  const { rootName } = options;

  if (options.json) {
    const treeObject = buildTreeObject(dirPath, options);
    const jsonStr = JSON.stringify(treeObject, null, 2);
    const jsonPath = path.join(dirPath, "structure.json");
    fs.writeFileSync(jsonPath, jsonStr, { encoding: "utf-8" });
    return jsonPath;
  } else {
    const treeString = buildTreeString(dirPath, "", { ...options, color: false });
    const root = rootName ?? path.basename(dirPath);
    const treeWithRoot = `${root}/\n${treeString}`;

    const structurePath = path.join(dirPath, "structure.txt");
    const projectStructurePath = path.join(dirPath, "project_structure.txt");
    let filePathToWrite: string;

    if (fs.existsSync(structurePath)) {
      filePathToWrite = projectStructurePath;
    } else {
      filePathToWrite = structurePath;
    }

    fs.writeFileSync(filePathToWrite, treeWithRoot, { encoding: "utf-8" });

    return filePathToWrite;
  }
}

export { buildTreeString, buildTreeObject };
