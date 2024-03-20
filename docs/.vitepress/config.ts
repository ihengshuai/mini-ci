import { defineConfig } from "vitepress";
import { getNavMenu, getSideBarMenu } from "./menu";

export default defineConfig({
  lang: "zh-CN",
  title: "MiniCI",
  description: "微信、支付宝等小程序自动化上传代码、提审、发版ci助手",
  outDir: "./dist",
  lastUpdated: true,
  cleanUrls: false,
  ignoreDeadLinks: true,
  srcExclude: ["README.md"],
  themeConfig: {
    sidebar: getSideBarMenu(),
    nav: getNavMenu(),
    externalLinkIcon: true,
    siteTitle: "MiniCI",
    logo: { src: "/icon.png" },
    logoLink: "/",
    outline: [2, 3],
    outlineTitle: "快速前往",
    socialLinks: [{ icon: "github", link: "https://github.com/ihengshuai/mini-ci" }],
    footer: {
      message: "Released under the MIT License.",
      copyright: `Copyright © 2024-${new Date().getFullYear()} HengShuai`,
    },
    lastUpdated: {
      text: '最近更新',
      formatOptions: {
        dateStyle: 'medium',
        // timeStyle: 'short'
      }
    },
    search: {
      options: {
        detailedView: true,
        miniSearch: {
          searchOptions: {
            fields: ['title', 'text']
          }
        }
      },
      provider: 'local',
    },
  },
  appearance: 'dark',
  markdown: {
    theme: "material-theme-palenight",
    lineNumbers: true,
    toc: { level: [1, 2, 3] },
  },
});
