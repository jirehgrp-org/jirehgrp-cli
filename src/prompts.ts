// src/prompts.ts

import prompts from "prompts";
import kleur from "kleur";
import { groupedTemplates } from "./registry.js";

export type Answers = {
  name: string;
  mainTemplateKey: string;
  subTemplateKey: string;
  install: boolean;
  git: boolean;
};

export async function ask(opts: Partial<Answers>): Promise<Answers> {
  const mainChoices = Object.entries(groupedTemplates).map(([key, group]) => ({
    title: group.label,
    value: key,
  }));

  const mainRes = await prompts({
    name: "mainTemplateKey",
    type: opts.mainTemplateKey ? null : "select",
    message: "Select a template:",
    choices: mainChoices,
  });

  if (!mainRes.mainTemplateKey) process.exit(1);

  console.log();
  console.log(kleur.dim(`— ${groupedTemplates[mainRes.mainTemplateKey].description ?? ""}\n`));

  const group = groupedTemplates[mainRes.mainTemplateKey];
  let subTemplateKey = opts.subTemplateKey;

  if (Object.keys(group.children).length > 1) {
    const subChoices = Object.entries(group.children).map(([key, tpl]) => ({
      title: tpl.label,
      value: key,
    }));

    const subRes = await prompts({
      name: "subTemplateKey",
      type: subTemplateKey ? null : "select",
      message: `Select ${group.label} variant:`,
      choices: subChoices,
    });

    if (!subRes.subTemplateKey) process.exit(1);
    subTemplateKey = subRes.subTemplateKey;
  } else {
    subTemplateKey = Object.keys(group.children)[0];
  }

  if (!subTemplateKey) {
    throw new Error("subTemplateKey must be defined");
  }

  const restRes = await prompts(
    [
      {
        name: "name",
        type: opts.name ? null : "text",
        message: "Project name:",
        initial: "my-app",
      },
      {
        name: "install",
        type: typeof opts.install === "boolean" ? null : "toggle",
        message: "Install dependencies?",
        active: "yes",
        inactive: "no",
        initial: true,
      },
      {
        name: "git",
        type: typeof opts.git === "boolean" ? null : "toggle",
        message: "Initialize git?",
        active: "yes",
        inactive: "no",
        initial: true,
      },
    ],
    { onCancel: () => process.exit(1) }
  );

  return {
    ...opts,
    ...restRes,
    mainTemplateKey: mainRes.mainTemplateKey,
    subTemplateKey,
  };
}