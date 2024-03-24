import { sleep, isDebug, logger } from "@hengshuai/mini-helper";
import { IPerHandleParams } from "./type";

/** 处理提审 */
export async function handleReview({ browser, page, config, projectConfig, platformSpecificConfig }: IPerHandleParams) {
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
        throw Error(`版本错误! version: ${projectConfig.version} 当前版本没找到! appId: ${projectConfig.appId}`);
        // return process.exit(0);
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

    if (!isDebug()) {
      submitReviewBtn?.click();
    }

    logger.success(`========> 提审成功! appId: ${projectConfig.appId}\n`);

    // logger.info(newPage?.url());
  } catch (error) {
    logger.error(`提审失败! appId: ${projectConfig.appId}`);
    console.log(error);

    throw error;
  }
}
