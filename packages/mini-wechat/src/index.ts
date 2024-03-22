import { isDebug, logger, resolvePath } from "@hengshuai/mini-helper";
import {
  IMiniConfig,
  IPlatformSpecific,
  IProjectActionMode,
  IProjectConfig,
  MiniCIDefaultDir,
  Platform,
} from "@hengshuai/mini-type";

import { setupUploadCode } from "./setup-upload-code";
import fs from "fs";
import { setupAdmin } from "./setup-admin";

export async function setup(
  projectConfig: IProjectConfig,
  platformSpecificConfig: IPlatformSpecific[Platform.Wechat],
  config: IMiniConfig
) {
  if (!fs.existsSync(resolvePath(MiniCIDefaultDir))) {
    await fs.mkdirSync(resolvePath(MiniCIDefaultDir));
  }

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

      if (!isDebug()) {
        await setupUploadCode(projectConfig, platformSpecificConfig, config);
      }
    }

    if (projectConfig.mode === IProjectActionMode.UPLOAD_CODE) return;

    if (!projectConfig.admin) {
      logger.error(`请设置该项目admin地址! appId: ${projectConfig.appId}`);
      return process.exit(0);
    }

    await setupAdmin(projectConfig, platformSpecificConfig, config);
  } catch (error: any) {
    error?.message && logger.error("【wechat error】", error.message);
    process.exit(1);
  }
}
