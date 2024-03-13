import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Document",
  outDir: "./dist",
  cleanUrls: false,
  ignoreDeadLinks: true,
  themeConfig: {
    outline: [2, 3],
    outlineTitle: "快速前往",
    footer: {
      message: "Released under the MIT License.",
      copyright: `Copyright © 2020-${new Date().getFullYear()} HengShuai`,
    },
  },
  markdown: {
    toc: { level: [1, 2, 3] },
  },
});
