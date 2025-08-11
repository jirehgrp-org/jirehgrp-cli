// src/tree.ts

import fs from 'fs';
import path from 'path';
import kleur from 'kleur';

export interface TreeOptions {
  ignore?: string[];
  color?: boolean;
}

function loadIgnoreList(): string[] {
  return [
    'node_modules', '.git', 'dist', 'build', 'out', 'coverage', '.cache', '.parcel-cache',
    'npm-debug.log', 'yarn-error.log', 'pnpm-debug.log', 'package-lock.json',
    '.DS_Store', 'Thumbs.db',
    '.next',
    '__pycache__', '*.py[cod]', '*.egg-info', '.pytest_cache', '.mypy_cache',
    'log', 'tmp', 'vendor/bundle', '.byebug_history',
    'vendor', '.env', '.env.*', 'storage',
    'db.sqlite3', 'media',
    'target', '*.class', '*.jar', '*.war', '*.ear',
    '.vscode', '.idea', '*.iml',
    '*.log',
  ];
}

function buildTreeString(
  dirPath: string,
  prefix = '',
  options: TreeOptions = {}
): string {
  const ignoreList = options.ignore || loadIgnoreList();
  const useColor = options.color !== false;  // default true

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(item => !ignoreList.includes(item.name));

  const dirs = entries.filter(e => e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
  const files = entries.filter(e => !e.isDirectory()).sort((a, b) => a.name.localeCompare(b.name));
  const items = [...dirs, ...files];

  let treeString = '';

  items.forEach((item, index) => {
    const isLast = index === items.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    let name = item.name + (item.isDirectory() ? '/' : '');

    if (useColor) {
      name = item.isDirectory() ? kleur.cyan(name).toString() : kleur.white(name).toString();
    }

    treeString += prefix + connector + name + '\n';

    if (item.isDirectory()) {
      const newPrefix = prefix + (isLast ? '    ' : '│   ');
      treeString += buildTreeString(path.join(dirPath, item.name), newPrefix, options);
    }
  });

  return treeString;
}

export function writeTreeToFile(
  dirPath: string,
  options: TreeOptions = {}
): string {
  // force color false for file output
  const treeString = buildTreeString(dirPath, '', { ...options, color: false });

  const structurePath = path.join(dirPath, 'structure.txt');
  const projectStructurePath = path.join(dirPath, 'project_structure.txt');

  let filePathToWrite: string;

  if (fs.existsSync(structurePath)) {
    filePathToWrite = projectStructurePath;
  } else {
    filePathToWrite = structurePath;
  }

  fs.writeFileSync(filePathToWrite, treeString);

  return filePathToWrite;
}

export { buildTreeString };