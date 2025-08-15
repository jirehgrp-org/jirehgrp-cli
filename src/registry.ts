// src/registry.ts

export type TemplateId =
  | "nextjs"
  | "react-vite/js"
  | "react-vite/ts"
  | "vanilla/js"
  | "vanilla/ts"
  | "vanilla-vite/js"
  | "vanilla-vite/ts";

export type TemplateEntry = {
  label: string;
  repo: string;
  subdir?: string;
  ref?: string;
  description?: string;
};

export type GroupedTemplates = {
  label: string;
  description?: string;
  children: Record<string, TemplateEntry>;
};

export const groupedTemplates: Record<string, GroupedTemplates> = {
  nextjs: {
    label: "Next.js",
    description: "A fully-featured React framework with SSR and static site generation",
    children: {
      "nextjs": {
        label: "Next.js (TS)",
        repo: "jirehgrp-org/jirehgrp-templates",
        subdir: "templates/nextjs",
      }
    }
  },
  "react-vite": {
    label: "React + Vite",
    description: "React app scaffolded with Vite for fast builds and hot reload (JavaScript or TypeScript)",
    children: {
      "react-vite/js": {
        label: "React + Vite (JavaScript)",
        repo: "jirehgrp-org/jirehgrp-templates/",
        subdir: "templates/react-vite/js",
      },
      "react-vite/ts": {
        label: "React + Vite (TypeScript)",
        repo: "jirehgrp-org/jirehgrp-templates/",
        subdir: "templates/react-vite/ts",
      }
    }
  },
  "vanilla": {
    label: "Vanilla",
    description: "Simple vanilla projects without bundler (JS or TS)",
    children: {
      "vanilla/js": {
        label: "Vanilla (JavaScript)",
        repo: "jirehgrp-org/jirehgrp-templates/",
        subdir: "templates/vanilla/js",
      },
      "vanilla/ts": {
        label: "Vanilla (TypeScript)",
        repo: "jirehgrp-org/jirehgrp-templates/",
        subdir: "templates/vanilla/ts",
      }
    }
  },
  "vanilla-vite": {
    label: "Vanilla + Vite",
    description: "Vanilla projects scaffolded with Vite bundler (JS or TS)",
    children: {
      "vanilla-vite/js": {
        label: "Vanilla + Vite (JavaScript)",
        repo: "jirehgrp-org/jirehgrp-templates/",
        subdir: "templates/vanilla/vite/js",
      },
      "vanilla-vite/ts": {
        label: "Vanilla + Vite (TypeScript)",
        repo: "jirehgrp-org/jirehgrp-templates/",
        subdir: "templates/vanilla/vite/ts",
      }
    }
  }
};

export const registry: Record<string, TemplateEntry> = Object.values(groupedTemplates)
  .flatMap(group => Object.entries(group.children))
  .reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {} as Record<string, TemplateEntry>);
  