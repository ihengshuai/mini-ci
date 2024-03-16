import { ICompileSettings, IProjectType } from "./core";

/** 小程序平台 */
export enum Platform {
  Wechat = "Wechat",
  Alipay = "Alipay",
}

export type IPlatformsConfig = {
  [k in Platform]?: IPlatformConfig[];
};

/** 平台配置项 */
export interface IPlatformConfig {
  appId: string;
  platform?: Platform;
  projectPath: string;
  privateKeyPath: string;
  admin: string;
  version?: string;
  description?: string;
  type?: IProjectType;
  compiler?: ICompileSettings;
  ignores?: string[];
}
