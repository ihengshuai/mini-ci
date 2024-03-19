import { createImgFileName, deleteFile, logger, openBrowser, resolvePath, sleep } from "@hengshuai/mini-helper";
import {
  IMiniConfig,
  IPlatformSpecific,
  IProjectActionMode,
  IProjectConfig,
  MiniCIDefaultDir,
  Platform,
} from "@hengshuai/mini-type";
import inquirer from "inquirer";
import puppeteer from "puppeteer";
import { uploadCodeToPlatform } from "./upload-code";
import fs from "fs";

export async function setup(
  projectConfig: IProjectConfig,
  platformSpecificConfig: IPlatformSpecific[Platform.Wechat],
  config: IMiniConfig
) {
  if (!fs.existsSync(resolvePath(MiniCIDefaultDir))) {
    await fs.mkdirSync(resolvePath(MiniCIDefaultDir));
  }

  const qrFileName = createImgFileName(Platform.Wechat);
  const qrFilePath = resolvePath(qrFileName);
  const htmlPageName = `${MiniCIDefaultDir}/index.html`;
  const htmlPath = resolvePath(htmlPageName);

  try {
    if (!projectConfig.appId) {
      logger.error(`该项目缺少appId和projectPath!`);
      return process.exit(0);
    }

    if (projectConfig.skipUpload !== true) {
      if (!projectConfig.privateKeyPath || !projectConfig.projectPath) {
        logger.error(`请设置该项目privateKeyPath和projectPath! appId: ${projectConfig.appId}`);
        return process.exit(0);
      }
      logger.cyan(`======> 正在上传微信平台代码, appId: ${projectConfig.appId}`);

      await uploadCodeToPlatform(projectConfig, platformSpecificConfig, config);
    }

    if (projectConfig.mode === IProjectActionMode.UPLOAD_CODE) return;

    if (!projectConfig.admin) {
      logger.error(`请设置该项目admin地址! appId: ${projectConfig.appId}`);
      return process.exit(0);
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
      await sleep(1000);
      const loginCodeClip = await loginCode?.boundingBox();

      await page.screenshot({
        path: qrFilePath,
        clip: loginCodeClip!,
      });
      logger.info("请扫码认证\n");
      await fs.writeFileSync(htmlPath, `<h1>请扫码认证</h1><img src="${qrFilePath}" />`, { encoding: "utf8" });
      openBrowser(htmlPath);
    }

    // 进入版本管理页
    const versionManagerMenu = await page.waitForSelector("#menuBar .menu_item a", {
      visible: true,
      timeout: config.ci!.timeout,
    });

    logger.info("登录成功,正在处理...\n");
    versionManagerMenu?.click();

    // 选择对应的版本提交审核
    const reviewVersionBtn = await page.waitForSelector(
      ".code_version_logs .code_version_log .weui-desktop-btn_wrp button",
      { visible: true, timeout: config.ci!.timeout }
    );
    reviewVersionBtn?.click();

    // await sleep(2000);

    const protocolBtn = await page.waitForSelector(".code_submit_dialog .weui-desktop-icon-checkbox", {
      timeout,
      visible: true,
    });
    protocolBtn?.click();

    // 勾选协议后下一步按钮
    const protocolNextBtn = await page.waitForSelector(".code_submit_dialog .weui-desktop-dialog__ft button", {
      visible: true,
      timeout: config.ci!.timeout,
    });
    protocolNextBtn?.click();

    await sleep(1000);

    // 继续提交
    await page.evaluate(async () => {
      const [theDialog] = ([...(document.querySelectorAll(".weui-desktop-dialog__wrp") || [])] as HTMLElement[]).filter(
        (item: HTMLElement) => item.style.display !== "none"
      );
      const nextConfirm = theDialog.querySelector(".weui-desktop-dialog__ft .weui-desktop-btn_primary")! as HTMLElement;
      nextConfirm.click();
    });

    await sleep(5000);

    const pageList = (await browser.pages()).map(p => p.url());

    const target = await browser.waitForTarget(t => t.url() == pageList[pageList.length - 1]);
    const newPage = await target.page();

    await newPage?.setViewport({ width: 1280, height: 800 });

    // logger.info(newPage?.url());

    // 删除二维码和html
    await Promise.all([deleteFile(qrFileName), deleteFile(htmlPageName)]);

    await inquirer.prompt([
      {
        name: "hh",
        type: "confirm",
        message: "结束",
      },
    ]);

    await page.close();
    await browser.close();
  } catch (error: any) {
    await Promise.all([deleteFile(qrFileName), deleteFile(htmlPageName)]);
    error?.message && logger.error("【wechat error】", error.message);
    process.exit(1);
  }
}
