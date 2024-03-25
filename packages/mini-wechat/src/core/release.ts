import { logger } from "@hengshuai/mini-helper";
import { IPerHandleParams } from "./type";

/** 处理发版 */
export async function handleRelease({
  browser,
  page,
  config,
  projectConfig,
  platformSpecificConfig,
}: IPerHandleParams) {
  console.log("handleRelease");
  try {
    const timeout = config.ci!.timeout!;

    // 选择对应版本
    await page.evaluate(async projectConfig => {
      const nodes: HTMLElement[] = ((document.querySelectorAll(".test_version .code_version_log") as any) ||
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
      // TODO: 按钮如果是详情，表明还在审核中，不能发布
      console.log(reviewVersionBtn.textContent);

      reviewVersionBtn?.click();
    }, projectConfig);
  } catch (error) {
    logger.error(`提审失败! appId: ${projectConfig.appId}`);
    console.log(error);

    throw error;
  }
}
