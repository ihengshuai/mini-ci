/**
 * 上传代码到平台
 */
import { IMiniConfig, IPlatformSpecific, IProjectConfig, Platform } from "@hengshuai/mini-type";
import { logger, resolvePath } from "@hengshuai/mini-helper";
import * as CI from "miniprogram-ci";

export async function setupUploadCode(
  projectConfig: IProjectConfig,
  platformSpecificConfig: IPlatformSpecific[Platform.Wechat],
  config: IMiniConfig
) {
  try {
    const project = new CI.Project({
      appid: projectConfig.appId,
      type: projectConfig.type!,
      projectPath: resolvePath(projectConfig.projectPath),
      privateKeyPath: projectConfig.privateKeyPath,
      ignores: projectConfig.ignores ? [...projectConfig.ignores, "node_modules/**/*"] : ["node_modules/**/*"],
    });

    await CI.upload({
      project,
      version: projectConfig.version!,
      desc: projectConfig.description || `ci助手上传${+new Date()}`,
      setting: {
        es6: true,
        ...projectConfig.compiler,
      },
      // onProgressUpdate: (args: any) => (args.status === "done" ? logger.success("代码上传成功!\n") : null),
    });
    logger.success(`======> 微信平台代码上传成功, appId: ${projectConfig.appId}`);
  } catch (err: any) {
    logger.error(`微信平台代码上传失败! appId: ${projectConfig.appId}\n`);
    // err?.message && logger.error(err.message);
    throw err;
  }
}
