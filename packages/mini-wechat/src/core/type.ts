import { IProjectConfig, IPlatformSpecific, Platform, IMiniConfig } from "@hengshuai/mini-type";
import { Browser, Page } from "puppeteer";

export interface IPerHandleParams {
  browser: Browser;
  page: Page;
  projectConfig: IProjectConfig;
  platformSpecificConfig: IPlatformSpecific[Platform.Wechat];
  config: IMiniConfig;
}
