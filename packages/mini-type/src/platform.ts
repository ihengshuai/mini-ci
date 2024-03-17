import { IProjectConfig } from "./core";

/** 小程序平台 */
export enum Platform {
  Wechat = "Wechat",
  Alipay = "Alipay",
}

/** 每个平台私有配置 */
export type IPlatformSpecific = {
  [Platform.Wechat]: {
    name?: string;
  };
  [Platform.Alipay]: {
    name?: string;
  };
};

/** 平台配置 */
export type IPlatformsConfig = {
  [k in Platform]?: {
    platformSpecific: IPlatformSpecific[k];
    subs: IProjectConfig[];
  };
};

export type IPerPlatformOpts = {};
