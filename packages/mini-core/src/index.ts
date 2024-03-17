import { ICITerminalConfig, IMiniConfig, IPlatformsConfig, IProjectConfig, Platform } from "@hengshuai/mini-type";
import { resolvePath, sleep, deleteFile } from "@hengshuai/mini-helper";
import inquirer from "inquirer";
import fs from "fs";

export const defaultUserConfigPath = ".mini-ci/mini-ci.config.js";
export const defaultTimeoutConfig = 120; // 120s

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
  config.ci.timeout = terminalConfig?.timeout || defaultTimeoutConfig;

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

export const startByTerminal = async (tConfig: ICITerminalConfig) => {
  await setTerminalConfig(tConfig);

  await setup();
};

export const setup = async () => {
  const config = getConfig();

  if (!config.platforms || Object.keys(config.platforms).length === 0) {
    return process.exit(0);
  }

  console.log("config", "------------------- config -----------------");

  const projects: IProjectConfig[] = [];
  (Object.keys(config.platforms || {}) as Platform[]).forEach(async pf => {
    if (!Platform[pf] || !Array.isArray(config.platforms[pf]?.subs)) return;
    const platformSpecific = {
      ...config.platforms[pf]?.platformSpecific,
    };
    config.platforms[pf]?.subs.forEach(project => {
      projects.push({
        ...project,
        platform: pf,
      });
    });
  });

  console.log("projects", "---------------- projects -----------------\n");

  await processQueue(projects, config);
};

async function processQueue(projects: IProjectConfig[], config: IMiniConfig) {
  const len = projects.length;
  async function next(idx: number) {
    if (idx < len) {
      const project = projects[idx];
      const { platform } = project;
      const { setup } = require(`@hengshuai/mini-${platform?.toLowerCase()}`);
      await setup(project, config);
      idx++;
      return await next(idx);
    }
  }

  await next(0);
}
