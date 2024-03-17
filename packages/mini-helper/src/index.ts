import path from "path";
import process from "process";
import fs from "fs";
import chalk from "chalk";

export const rootDir = process.cwd();

export const resolvePath = (p: string) => path.resolve(rootDir, p);

export function sleep(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 删除文件
export async function deleteFile(filePath: string) {
  try {
    if (filePath && filePath !== "") {
      await fs.unlinkSync(resolvePath(filePath));
    }
  } catch (err) {
    console.error(err);
  }
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
