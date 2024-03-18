import path from "path";
import process from "process";
import fs from "fs";
import chalk from "chalk";
import { MiniCIDefaultDir, Platform } from "@hengshuai/mini-type";

export const rootDir = process.cwd();

/** 取ci执行目录 */
export const resolvePath = (p: string) => path.resolve(rootDir, p);

export function sleep(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 删除文件
export async function deleteFile(filePath: string) {
  try {
    if (filePath && filePath !== "" && fs.existsSync(resolvePath(filePath))) {
      await fs.unlinkSync(resolvePath(filePath));
    }
  } catch (err) {
    console.error(err);
  }
}

/**
 * 创建图片文件名字
 * @param platform 平台
 */
export function createImgFileName(platform?: Platform) {
  return `${MiniCIDefaultDir}/${platform ? platform : "default"}__${+new Date()}.png`;
}

/**
 * 有颜色的log
 */
export const logger = {
  info: (...args: Array<string | number | boolean>) => console.log(chalk.hex("#b4b4b4")(...args)),
  success: (...args: Array<string | number | boolean>) => console.log(chalk.greenBright(...args)),
  warn: (...args: Array<string | number | boolean>) => console.log(chalk.hex("#ff8515")(...args)),
  error: (...args: Array<string | number | boolean>) => console.log(chalk(...args)),
  log: (hexColor: string, ...args: Array<string | number | boolean>) => console.log(chalk.hex(hexColor)(...args)),
  cyan: (...args: Array<string | number | boolean>) => console.log(chalk.cyanBright(...args)),
};
