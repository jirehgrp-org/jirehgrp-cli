// src/postInstall.ts

import { execa } from "execa";
import fs from "node:fs";
import path from "node:path";

function detectPM(explicit?: string) {
  if (explicit) return explicit;
  const ua = process.env.npm_config_user_agent || "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("bun"))  return "bun";
  return "npm";
}

export async function finalizeProject(
  dest: string,
  name: string,
  opts: { install: boolean; git: boolean; pm?: "npm"|"yarn"|"pnpm"|"bun" }
) {
  const pkgPath = path.join(dest, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    const safe = name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-_.]/g, "");
    pkg.name = safe || "my-app";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  }

  if (opts.git && !fs.existsSync(path.join(dest, ".git"))) {
    await execa("git", ["init", "-b", "main"], { cwd: dest });
    await execa("git", ["add", "-A"], { cwd: dest });
    await execa("git", ["commit", "-m", "chore: initial scaffold with jirehgrp"], { cwd: dest })
      .catch(() => {});
  }

  if (opts.install && fs.existsSync(pkgPath)) {
    const pm = detectPM(opts.pm);
    const installCmd =
      pm === "yarn" ? ["yarn"] :
      pm === "pnpm" ? ["pnpm","install"] :
      pm === "bun"  ? ["bun","install"] :
                      ["npm","install"];
    await execa(installCmd[0], installCmd.slice(1), { cwd: dest, stdio: "inherit" });
  }
}
