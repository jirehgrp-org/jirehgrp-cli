// src/registry.ts

type TemplateId =
  | "nextjs"
  | "react-vite/js"
  | "react-vite/ts"
  | "vanilla/js"
  | "vanilla/ts"
  | "vanilla-vite/js"
  | "vanilla-vite/ts";

export type Registry = Record<
  TemplateId,
  { label: string; repo: string; subdir?: string; ref?: string }
>;

export const registry: Registry = {
  "nextjs": {
    label: "Next.js (TS)",
    repo: "jirehgrp-org/jirehgrp-templates#v1.0.0",
    subdir: "templates/nextjs"
  },
  "react-vite/js": {
    label: "React + Vite (JS)",
    repo: "jirehgrp-org/jirehgrp-templates#v1.0.0",
    subdir: "templates/react-vite/js"
  },
  "react-vite/ts": {
    label: "React + Vite (TS)",
    repo: "jirehgrp-org/jirehgrp-templates#v1.0.0",
    subdir: "templates/react-vite/ts"
  },
  "vanilla/js": {
    label: "Vanilla (JS)",
    repo: "jirehgrp-org/jirehgrp-templates#v1.0.0",
    subdir: "templates/vanilla/js"
  },
  "vanilla/ts": {
    label: "Vanilla (TS)",
    repo: "jirehgrp-org/jirehgrp-templates#v1.0.0",
    subdir: "templates/vanilla/ts"
  },
  "vanilla-vite/js": {
    label: "Vanilla + Vite (JS)",
    repo: "jirehgrp-org/jirehgrp-templates#v1.0.0",
    subdir: "templates/vanilla/vite/js"
  },
  "vanilla-vite/ts": {
    label: "Vanilla + Vite (TS)",
    repo: "jirehgrp-org/jirehgrp-templates#v1.0.0",
    subdir: "templates/vanilla/vite/ts"
  }
};
