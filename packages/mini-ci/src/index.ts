#!/usr/bin/env node

export * from "./utils";
export * from "@hengshuai/mini-core";
export * from "@hengshuai/mini-type";
import { Command } from "commander";
// import inquirer from "inquirer";
import { VERSION } from "./utils";
import { ICITerminalConfig, IProjectActionMode } from "@hengshuai/mini-type";
import { defaultUserConfigPath, startByTerminal } from "@hengshuai/mini-core";
import { logger, resolvePath } from "@hengshuai/mini-helper";
import fs from "fs";
import process from "process";

const program = new Command();

const projectModeRegExp = new RegExp(`${Object.values(IProjectActionMode).join("|")}`);

/* 终端参数优先级最高 */
program
  .command("start")
  .description("执行MiniCI")
  // .option("-d, --debug", "是否开启调试模式", false)
  .option("-p, --port <port>", "端口", (v, p) => parseInt(v) || p, 6969)
  .option("-c, --config <config>", "配置文件路径", defaultUserConfigPath)
  .option("-m, --mode <Mode>", "使用模式(uploadCode, review, release, preset)", v => {
    const isValid = projectModeRegExp.test(v);
    if (!isValid) {
      throw new Error(`模式值不正确 => input 【${v}】, must be (${Object.values(IProjectActionMode).join("|")})`);
    }
    return v as IProjectActionMode;
  })
  .option("-s, --silent <boolean>", "是否静默模式", v => v === "true")
  .option("-t, --timeout <number>", "超时时间", v => parseInt(v) || null)
  .option("--thread <number>", "线程数", v => parseInt(v) || null)
  .action(async (opts: ICITerminalConfig) => {
    if (!fs.existsSync(resolvePath(opts.config))) {
      logger.warn("请提供mini config文件!\n");
      process.exit(0);
    }
    opts.config = resolvePath(opts.config);
    await startByTerminal(opts);
  });

program.version(VERSION, "-V, --version", "ci版本");
program.option("-h, --help", "显示帮助信息");

program.parse(process.argv);
