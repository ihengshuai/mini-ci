import path from "path";
import process from "process";
import fs from "fs";
import chalk from "chalk";
import { CI_ENVS, MiniAssetsDir, Platform } from "@hengshuai/mini-type";
import open from "open";

export const rootDir = process.cwd();

/** 取ci执行目录 */
export const resolvePath = (p = "") => path.resolve(rootDir, p);

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
  return `${MiniAssetsDir}/${platform ? platform : "default"}__${+new Date()}.png`;
}

/**
 * 有颜色的log
 */
export const logger = {
  info: (...args: Array<string | number | boolean>) =>
    console.log(chalk.hex("#b4b4b4")(`${useEnv() ? `【${useEnv()}】` : ""}`, ...args, "\n")),
  success: (...args: Array<string | number | boolean>) =>
    console.log(chalk.greenBright(`${useEnv() ? `【${useEnv()}】` : ""}`, ...args, "\n")),
  warn: (...args: Array<string | number | boolean>) =>
    console.log(chalk.hex("#ff8515")(`${useEnv() ? `【${useEnv()}】` : ""}`, ...args, "\n")),
  error: (...args: Array<string | number | boolean>) =>
    console.log(chalk.red(`${useEnv() ? `【${useEnv()}】` : ""}`, ...args, "\n")),
  log: (hexColor: string, ...args: Array<string | number | boolean>) =>
    console.log(chalk.hex(hexColor)(`${useEnv() ? `【${useEnv()}】` : ""}`, ...args, "\n")),
  cyan: (...args: Array<string | number | boolean>) =>
    console.log(chalk.cyanBright(`${useEnv() ? `【${useEnv()}】` : ""}`, ...args, "\n")),
};

export function openBrowser(url: string) {
  open(url);
}

/**
 * 创建二维码HTML模板
 * @param type 平台
 * @param timeout 超时时间
 * @param qrURL 二维码地址
 */
export function createQrHTMLTemplate(type: Platform, timeout: number, qrURL: string) {
  return `
    <div style="display:flex;justify-content: center;align-items: center;flex-direction: column;">
      <h1>请使用开发者微信扫码认证</h1>
      <p style="color:#999;font-size:14px;">扫码后可关闭页面</p>
      <img src="${qrURL}" />
      <p id="qr_expired">${timeout / 1000}s后二维码过期</p>
      <p style="color:#999;font-size:14px;">可通过 mini-ci start -t 时间 / mini-ci.config调整过期时间</p>
    </div>
    <script>
      const timeout = ${timeout};
      let step = 0;
      const qrExpired = document.getElementById("qr_expired");
      setInterval(() => {
        step++;
        if (step > timeout / 1000) {
          window.close();
        } else {
          qrExpired.innerText = timeout / 1000 - step + "s后二维码过期";
        }
      }, 1000);
    </script>
  `;
}

export function useEnv(): CI_ENVS {
  return process.env.ENV as CI_ENVS;
}

/** 判断当前环境是否debug环境 */
export function isDebug() {
  return useEnv() === CI_ENVS.DEBUG;
}

/**
 * 设置CI环境
 * @param {env} CI_ENVS CI环境
 */
export function setCIEnv(env: CI_ENVS) {
  process.env.ENV = env;
}
