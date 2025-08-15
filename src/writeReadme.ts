// src/writeReadme.ts

import fs from "node:fs";
import path from "node:path";

type ReadmeOptions = {
  projectName: string;
  description?: string;
  packageName?: string;
  usage?: string;
  license?: string;
  includeGeneratedBy?: boolean;
};

export async function writeReadme(targetDir: string, options: ReadmeOptions) {
  const {
    projectName,
    description = "A project created with jirehgrp-CLI",
    packageName = projectName,
    usage = "npm run dev",
    license = "MIT",
    includeGeneratedBy = true,
  } = options;

  const generatedByLine = includeGeneratedBy ? "\n> Generated with ❤️ using the jirehgrp-CLI." : "";

  const content = `# ${projectName}

${description}

---

**Package:** ${packageName}
**Usage:** ${usage}
**License:** ${license}

---

${generatedByLine}
`;

  const outPath = path.join(targetDir, "README.md");
  fs.writeFileSync(outPath, content, "utf-8");

  console.log("✔️ README.md generated");
}
