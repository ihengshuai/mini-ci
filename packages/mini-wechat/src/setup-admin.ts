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
} from "@hengshuai/mini-helper";
import {
  Platform,
  IProjectConfig,
  IMiniConfig,
  IPlatformSpecific,
  MiniAssetsDir,
  IProjectActionMode,
} from "@hengshuai/mini-type";
import inquirer from "inquirer";
import puppeteer, { Browser, Page } from "puppeteer";
import fs from "fs";

interface IPerHandleParams {
  browser: Browser;
  page: Page;
  projectConfig: IProjectConfig;
  platformSpecificConfig: IPlatformSpecific[Platform.Wechat];
  config: IMiniConfig;
}

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
      logger.info("请扫码认证\n");
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
    if (projectConfig.mode === IProjectActionMode.REVIEW) {
      await handleReview({ browser, page, config, projectConfig, platformSpecificConfig });
    }

    // 删除二维码和html
    await Promise.all([deleteFile(qrFilePath), deleteFile(htmlPath)]);

    await inquirer.prompt([
      {
        name: "processDone",
        type: "confirm",
        message: "ci执行结束,继续以释放资源",
      },
    ]);

    await page.close();
    await browser.close();
  } catch (error) {
    await Promise.all([deleteFile(qrFilePath), deleteFile(htmlPath)]);
    throw error;
  }
}

/** 处理提审 */
async function handleReview({ browser, page, config, projectConfig, platformSpecificConfig }: IPerHandleParams) {
  try {
    // const visual = projectConfig.visual;
    const timeout = config.ci!.timeout!;

    // 选择对应的版本提交审核
    await page.waitForSelector(".code_version_logs .code_version_log .weui-desktop-btn_wrp button", {
      visible: true,
      timeout,
    });
    // reviewVersionBtn?.click();

    await page.evaluate(async projectConfig => {
      const nodes: HTMLElement[] = ((document.querySelectorAll(".code_version_logs .code_version_log") as any) ||
        []) as HTMLElement[];

      let versionElem: HTMLElement | null = null;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const versionNode = node.querySelector(".simple_preview_value") as HTMLElement;
        const text = versionNode.innerText;
        if (text?.trim() === projectConfig.version?.trim()) {
          versionElem = node;
          break;
        }
      }

      if (!versionElem) {
        logger.error(`版本错误! appId: ${projectConfig.appId}`);
        return process.exit(0);
      }

      const reviewVersionBtn = versionElem!.querySelector(".weui-desktop-btn_wrp button") as HTMLElement;
      reviewVersionBtn?.click();
    }, projectConfig);

    // await sleep(2000);

    // 勾选协议
    const protocolBtn = await page.waitForSelector(".code_submit_dialog .weui-desktop-icon-checkbox", {
      timeout,
      visible: true,
    });
    protocolBtn?.click();

    // 勾选协议后下一步按钮
    const protocolNextBtn = await page.waitForSelector(".code_submit_dialog .weui-desktop-dialog__ft button", {
      visible: true,
      timeout,
    });
    protocolNextBtn?.click();

    await sleep(1500);

    // 继续提交
    await page.evaluate(async () => {
      const [theDialog] = ([...(document.querySelectorAll(".weui-desktop-dialog__wrp") || [])] as HTMLElement[]).filter(
        (item: HTMLElement) => item.style.display !== "none"
      );
      const nextConfirm = theDialog.querySelector(".weui-desktop-dialog__ft .weui-desktop-btn_primary")! as HTMLElement;
      nextConfirm.click();
    });

    await page.waitForResponse(
      response => response.url().startsWith("https://mp.weixin.qq.com/wxamp/cgi/version/CheckPrivacyApiAuth"),
      { timeout }
    );

    await sleep(3000);

    const pageList = (await browser.pages()).map(p => p.url());

    const target = await browser.waitForTarget(t => t.url() == pageList[pageList.length - 1]);
    const newPage = await target.page();

    await newPage?.setViewport({ width: 1280, height: 800 });

    // 新页面点击最后的提交审核按钮
    const submitReviewBtn = await newPage?.waitForSelector(".tool_bar.tc .btn_primary", {
      visible: true,
      timeout,
    });

    submitReviewBtn?.click();

    logger.success(`========> 提审成功! appId: ${projectConfig.appId}\n`);

    // logger.info(newPage?.url());
  } catch (error) {
    logger.error(`提审失败! appId: ${projectConfig.appId}`);
    console.log(error);

    throw error;
  }
}
