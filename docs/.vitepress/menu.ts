import { DefaultTheme } from "vitepress";

export const getSideBarMenu: () => DefaultTheme.Sidebar = () => ({
  "/": [
    {
      text: "开始",
      items: [
        {text: "简介", link: "/index.html"},
        {text: "快速上手", link: "/start.html"},
      ]
    },
    {
      text: "指引",
      items: [
        {text: "安装", link: "/guide/install.html"},
        {text: "配置", link: "/guide/configure.html"},
        {text: "架构", link: "/guide/architecture.html"},
      ]
    }
  ],
})


export const getNavMenu: () => DefaultTheme.NavItem[] = () => ([
  {text: "文档", link: "/"},
  {text: "API", link: "/api/base.html"},
])
