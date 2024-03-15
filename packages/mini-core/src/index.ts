import { resolvePath, sleep, deleteFile } from "@hengshuai/mini-helper";
import puppeteer from "puppeteer";
import inquirer from "inquirer";

export enum Platform {
  Wechat = "Wechat",
  Alipay = "Alipay",
}

interface IMiniConfig {
  name: string;
  appId: string;
  site?: string;
  platform: Platform;
  headless?: boolean;
}

export const getUserConfig = (): IMiniConfig => {
  const ciConfig = require(resolvePath("./mini-ci.config.js"));
  return ciConfig;
};

export const getConfig = (): IMiniConfig => {
  const userConfig = getUserConfig();
  return userConfig;
};

export const defineConfig = (miniConfig: IMiniConfig) => {
  return {
    ...miniConfig,
    uuid: 100,
  };
};

export const setup = async () => {
  const config = getConfig();
  const browser = await puppeteer.launch({
    headless: config.headless ?? true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-infobars"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto(config.site || "https://blog.usword.cn");

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

  const qrFileName = "screen_" + +new Date() + "_.png";

  await page.screenshot({
    path: resolvePath(qrFileName),
    clip,
  });

  // const rs = await inquirer.prompt([
  //   {
  //     name: "hasScan",
  //     type: "confirm",
  //     message: "您已经扫码认证了吗？",
  //   },
  // ]);

  // if (rs.hasScan) {
  console.log("请扫码认证");
  await sleep(1000);

  const versionManagerMenu = await page.waitForSelector("#menuBar .menu_item a", { visible: true });
  console.log("versionManagerMenu", versionManagerMenu?.click);

  versionManagerMenu?.click();

  // await page.evaluate(() => {
  //   const versionMenu = document.querySelector("#menuBar .menu_item a") as HTMLElement;
  //   versionMenu?.click();
  // });

  // await sleep(7000);

  // 版本审核按钮
  const reviewVersionBtn = await page.waitForSelector(
    ".code_version_logs .code_version_log .weui-desktop-btn_wrp button",
    { visible: true }
  );
  reviewVersionBtn?.click();

  // 选择对应的版本提交审核
  // await page.evaluate(async () => {
  //   const versionMenu = document.querySelector(
  //     ".code_version_logs .code_version_log .weui-desktop-btn_wrp button"
  //   ) as HTMLElement;

  //   versionMenu?.click();
  // });

  await sleep(2000);

  // const protocolBtn = await page.waitForSelector(".code_submit_dialog .weui-desktop-form__checkbox", {
  //   timeout: 7000,
  //   visible: false,
  //   hidden: true,
  // });
  // protocolBtn?.click();
  // console.log(33333);

  // 协议勾选
  await page.evaluate(async () => {
    const checkbox = document.querySelector(".code_submit_dialog .weui-desktop-form__checkbox")! as HTMLElement;
    checkbox.click();
  });

  // await sleep(1000);

  // 勾选协议后下一步按钮
  const protocolNextBtn = await page.waitForSelector(".code_submit_dialog .weui-desktop-dialog__ft button", {
    visible: true,
  });
  protocolNextBtn?.click();

  // 下一步
  // await page.evaluate(async () => {
  //   const nextBtn = document.querySelector(".code_submit_dialog .weui-desktop-dialog__ft button")! as HTMLElement;
  //   nextBtn.click();
  // });

  await sleep(1000);

  // 继续提交
  await page.evaluate(async () => {
    const [theDialog] = ([...(document.querySelectorAll(".weui-desktop-dialog__wrp") || [])] as HTMLElement[]).filter(
      (item: HTMLElement) => item.style.display !== "none"
    );
    const nextConfirm = theDialog.querySelector(".weui-desktop-dialog__ft .weui-desktop-btn_primary")! as HTMLElement;
    nextConfirm.click();
  });

  // await page.evaluate(async () => {});

  await sleep(5000);

  const pageList = (await browser.pages()).map(p => p.url());

  const target = await browser.waitForTarget(t => t.url() == pageList[pageList.length - 1]);
  const newPage = await target.page();

  await newPage?.setViewport({ width: 1280, height: 800 });

  await newPage?.evaluate(async () => {
    console.log(document.URL);
  });

  console.log(newPage?.url());

  // 删除二维码
  await deleteFile(qrFileName);

  await inquirer.prompt([
    {
      name: "hh",
      type: "confirm",
      message: "结束",
    },
  ]);
  // } else {
  //   console.log("请扫码认证");
  // }

  await page.close();
  await browser.close();
  process.exit(0);
};
