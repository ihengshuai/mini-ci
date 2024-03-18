import { createImgFileName, deleteFile, logger, resolvePath, sleep } from "@hengshuai/mini-helper";
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
  try {
    // console.log("setupWechat", projectConfig, platformSpecificConfig, config);

    if (projectConfig.skipUpload !== true) {
      logger.cyan(`======> 正在上传微信平台代码, appId: ${projectConfig.appId}`);

      await uploadCodeToPlatform(projectConfig, platformSpecificConfig, config);
    }

    if (projectConfig.mode === IProjectActionMode.UPLOAD_CODE) return;

    await sleep(1000);

    const browser = await puppeteer.launch({
      headless: typeof config.ci?.visual === "boolean" ? !config.ci?.visual : true,
      timeout: config.ci?.timeout,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-infobars"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(projectConfig.admin || "https://blog.usword.cn");

    await sleep(3000);

    const clip = await page.evaluate(() => {
      const { x, y, width, height } =
        document && document.querySelector(".login_frame.input_login")!.getBoundingClientRect();
      return {
        x,
        y,
        width,
        height,
      };
    });

    await page.screenshot({
      path: resolvePath(qrFileName),
      clip,
    });
    logger.info("请扫码认证\n");

    await sleep(1000);

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

    await sleep(2000);

    // const protocolBtn = await page.waitForSelector(".code_submit_dialog .weui-desktop-form__checkbox", {
    //   timeout: 7000,
    //   visible: false,
    //   hidden: true,
    // });
    // protocolBtn?.click();

    // 协议勾选
    await page.evaluate(async () => {
      const checkbox = document.querySelector(".code_submit_dialog .weui-desktop-form__checkbox")! as HTMLElement;
      checkbox.click();
    });

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

    // 删除二维码
    await deleteFile(qrFileName);

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
    qrFileName && (await deleteFile(qrFileName));
    error?.message && logger.error("【wechat error】", error.message);
    process.exit(1);
  }
}
