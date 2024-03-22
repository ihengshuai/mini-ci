#!/usr/bin/env node

export * from "./utils";
export * from "@hengshuai/mini-core";
export * from "@hengshuai/mini-type";
import { Command } from "commander";
// import inquirer from "inquirer";
import { VERSION } from "./utils";
import { CI_ENVS, ICITerminalConfig, IProjectActionMode, WEB_SERVER_PORT } from "@hengshuai/mini-type";
import { defaultUserConfigPath, startByTerminal } from "@hengshuai/mini-core";
import { logger, resolvePath, setCIEnv } from "@hengshuai/mini-helper";
import fs from "fs";
import process from "process";

logger.info(`
MiniCI v${VERSION}: \n
mini-ci start
  -m 设置发布模式
  -c 指定配置文件路径
  -t 设置超时时间
  -s 静默模式
  --debug 启动debug模式
运行mini-ci help start查看更多帮助信息
`);

const program = new Command();

const projectModeRegExp = new RegExp(`${Object.values(IProjectActionMode).join("|")}`);

/* 终端参数优先级最高 */
program
  .command("start")
  .description("执行MiniCI")
  // .option("-d, --debug", "是否开启调试模式", false)
  .option("-p, --port <port>", "web端口", (v, p) => parseInt(v) || p, WEB_SERVER_PORT)
  .option("-c, --config <config>", "配置文件路径", defaultUserConfigPath)
  .option("-m, --mode <Mode>", "使用模式(uploadCode, review, release, preset)", v => {
    const isValid = projectModeRegExp.test(v);
    if (!isValid) {
      throw new Error(`模式值不正确 => input 【${v}】, must be (${Object.values(IProjectActionMode).join("|")})`);
    }
    return v as IProjectActionMode;
  })
  .option("-s, --silent [boolean]", "默认静默模式不启用图形界面", v => v === "true")
  .option("-t, --timeout <number>", "超时时间s", v => parseInt(v) || null)
  .option("--thread <number>", "线程数", v => parseInt(v) || null)
  .option("--debug [boolean]", "调试模式(开启图形界面,不执行最后操作)", v => v === "true")
  .action(async (opts: ICITerminalConfig) => {
    if (!fs.existsSync(resolvePath(opts.config))) {
      logger.warn("请提供mini config文件!");
      process.exit(0);
    }

    if (`${opts.debug}` === "true") {
      logger.info("====== 当前Debug模式,不会执行最终操作. ======");

      setCIEnv(CI_ENVS.DEBUG);
    } else {
      setCIEnv(CI_ENVS.PROD);
    }
    opts.config = resolvePath(opts.config);
    await startByTerminal(opts);
  });

program.version(VERSION, "-V, --version", "ci版本");
program.option("-h, --help", "显示帮助信息");

program.parse(process.argv);
