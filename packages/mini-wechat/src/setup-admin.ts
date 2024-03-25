/**
 * 需要登录平台的操作
 */

import {
  createImgFileName,
  resolvePath,
  deleteFile,
  logger,
  openBrowser,
  sleep,
  createQrHTMLTemplate,
  isDebug,
} from "@hengshuai/mini-helper";
import {
  Platform,
  IProjectConfig,
  IMiniConfig,
  IPlatformSpecific,
  MiniAssetsDir,
  IProjectActionMode,
} from "@hengshuai/mini-type";
// import inquirer from "inquirer";
import puppeteer from "puppeteer";
import fs from "fs";
import { handleReview } from "./core/review";
import { handleRelease } from "./core/release";

export async function setupAdmin(
  projectConfig: IProjectConfig,
  platformSpecificConfig: IPlatformSpecific[Platform.Wechat],
  config: IMiniConfig
) {
  const qrFilePath = resolvePath(createImgFileName(Platform.Wechat));
  const htmlPath = resolvePath(`${MiniAssetsDir}/index.html`);
  try {
    if (!fs.existsSync(resolvePath(MiniAssetsDir))) {
      await fs.mkdirSync(resolvePath(MiniAssetsDir));
    }

    const visual = projectConfig.visual;
    const timeout = config.ci!.timeout!;

    const browser = await puppeteer.launch({
      headless: !visual,
      timeout,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-infobars"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(projectConfig.admin);

    if (!visual) {
      // 获取登录二维码
      const loginCode = await page.waitForSelector(
        ".login__type__container__scan .login__type__container__scan__qrcode",
        {
          visible: true,
          timeout: config.ci!.timeout,
        }
      );
      await sleep(2000);
      const loginCodeClip = await loginCode?.boundingBox();

      await page.screenshot({
        path: qrFilePath,
        clip: loginCodeClip!,
      });
      logger.info("请扫码认证");
      await fs.writeFileSync(htmlPath, createQrHTMLTemplate(Platform.Wechat, timeout, qrFilePath), {
        encoding: "utf8",
      });
      openBrowser(htmlPath);
    }

    // 进入版本管理页
    const versionManagerMenu = await page.waitForSelector("#menuBar .menu_item a", {
      visible: true,
      timeout: config.ci!.timeout,
    });

    logger.info("登录成功,正在处理...\n");
    versionManagerMenu?.click();

    /** 提审 */
    if (projectConfig.skipReview !== true) {
      await handleReview({ browser, page, config, projectConfig, platformSpecificConfig });
    }

    /** 发布 */
    // await handleRelease({ browser, page, config, projectConfig, platformSpecificConfig });

    // 删除二维码和html
    await Promise.all([deleteFile(qrFilePath), deleteFile(htmlPath)]);

    // if (isDebug()) {
    //   await inquirer.prompt([
    //     {
    //       name: "processDone",
    //       type: "confirm",
    //       message: "debug模式流程已跑完,确定以结束!",
    //     },
    //   ]);
    // } else {
    //   await inquirer.prompt([
    //     {
    //       name: "processDone",
    //       type: "confirm",
    //       message: "ci执行结束,继续以释放资源",
    //     },
    //   ]);
    // }

    if (isDebug()) {
      logger.success(`appId: ${projectConfig.appId} done! 🎉`);
    }

    await sleep(1000);
    await page.close();
    await browser.close();
  } catch (error) {
    await Promise.all([deleteFile(qrFilePath), deleteFile(htmlPath)]);
    throw error;
  }
}
