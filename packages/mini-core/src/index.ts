import { ICITerminalConfig, IMiniConfig, IProjectConfig, IProjectType, Platform } from "@hengshuai/mini-type";
import { logger, resolvePath } from "@hengshuai/mini-helper";
// import inquirer from "inquirer";
import fs from "fs";

export const defaultUserConfigPath = ".mini-ci/mini-ci.config.js";
export const defaultTimeoutConfig = 120 * 1000; // 120s

let userConfig: IMiniConfig;
let terminalConfig: ICITerminalConfig;

export const setTerminalConfig = (config: ICITerminalConfig) => {
  terminalConfig = config;
};

export const getUserConfig = (): IMiniConfig | null => {
  const userConfigPath = terminalConfig.config || resolvePath(defaultUserConfigPath);

  const hasUserConfigure = fs.existsSync(userConfigPath);
  if (!hasUserConfigure) return null;

  if (!userConfig) {
    userConfig = require(userConfigPath);
  }
  return userConfig || null;
};

/** 程序最终配置 */
export const getConfig = (): IMiniConfig => {
  const userConfig = getUserConfig();
  const config = { ...userConfig } as IMiniConfig;
  config.ci = config.ci || {};
  config.ci.timeout = (terminalConfig?.timeout ?? userConfig?.ci?.timeout) * 1000 || defaultTimeoutConfig;
  config.ci.visual = config.ci.visual ?? false;

  return config;
};

/**
 * 定义ci配置
 * @param miniConfig 用户配置
 */
export const defineConfig = (miniConfig: IMiniConfig) => {
  return {
    ...miniConfig,
  };
};

// 从终端启动
export const startByTerminal = async (tConfig: ICITerminalConfig) => {
  await setTerminalConfig(tConfig);

  await setup();
};

// 主程序入口
export const setup = async () => {
  const config = getConfig();

  if (!config.platforms || Object.keys(config.platforms).length === 0) {
    return process.exit(0);
  }

  const projects: IProjectConfig[] = [];
  (Object.keys(config.platforms || {}) as Platform[]).forEach(async pf => {
    if (!Platform[pf] || !Array.isArray(config.platforms[pf]?.subs)) return;
    config.platforms[pf]?.subs.forEach(project => {
      projects.push({
        ...project,
        platform: pf,
        type: project.type || IProjectType.MiniProgram,
        skipUpload: project.skipUpload ?? false,
      });
    });
  });

  await processQueue(projects, config);
};

async function processQueue(projects: IProjectConfig[], config: IMiniConfig) {
  const len = projects.length;
  async function next(idx: number) {
    if (idx < len) {
      const project = projects[idx];
      const { platform } = project;
      const { setup } = require(`@hengshuai/mini-${platform?.toLowerCase()}`);
      logger.info(`当前进度 [${idx + 1}/${len}]\n`);
      await setup(project, config.platforms[project.platform!]?.platformSpecific, config);
      idx++;
      return await next(idx);
    }
  }

  await next(0);
}
