// src/prompts.ts

import prompts from "prompts";
import { registry } from "./registry.js";

export type Answers = {
  name: string;
  templateKey: keyof typeof registry;
  install: boolean;
  git: boolean;
};

export async function ask(opts: Partial<Answers>): Promise<Answers> {
  const templateChoices = Object.entries(registry).map(([key, v]) => ({
    title: v.label,
    value: key
  }));

  const res = await prompts(
    [
      {
        name: "name",
        type: opts.name ? null : "text",
        message: "Project name:",
        initial: "my-app"
      },
      {
        name: "templateKey",
        type: opts.templateKey ? null : "select",
        message: "Select a template:",
        choices: templateChoices
      },
      {
        name: "install",
        type: typeof opts.install === "boolean" ? null : "toggle",
        message: "Install dependencies?",
        active: "yes",
        inactive: "no",
        initial: true
      },
      {
        name: "git",
        type: typeof opts.git === "boolean" ? null : "toggle",
        message: "Initialize git?",
        active: "yes",
        inactive: "no",
        initial: true
      }
    ],
    { onCancel: () => process.exit(1) }
  );

  return { ...opts, ...res } as Answers;
}
