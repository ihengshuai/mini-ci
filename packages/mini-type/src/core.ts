import { ICI } from "./ci";
import { IPlatformsConfig, Platform } from "./platform";

/** MiniCI 入口配置 */
export interface IMiniConfig {
  /** ci配置  */
  ci?: ICI;
  /** 平台 */
  platforms: IPlatformsConfig;
}

/** 每个项目配置项 */
export interface IProjectConfig {
  appId: string;
  platform?: Platform;
  projectPath: string;
  privateKeyPath: string;
  admin: string;
  /**
   * 发布模式
   * @default uploadCode
   */
  mode?: IProjectActionMode;
  version?: string;
  description?: string;
  type?: IProjectType;
  compiler?: ICompileSettings;
  ignores?: string[];
}

/** 项目发布模式 */
export enum IProjectActionMode {
  /** 上传代码 */
  UPLOAD_CODE = "uploadCode",
  /** 提审 */
  REVIEW = "review",
  /** 发布 */
  RELEASE = "release",
  /** 体验 */
  PRESET = "preset",
}

/** 程序类型：取自微信 */
export enum IProjectType {
  MiniProgram = "miniProgram",
  MiniGame = "miniGame",
  MiniProgramPlugin = "miniProgramPlugin",
  MiniGamePlugin = "miniGamePlugin",
}

/** 小程序编译配置 */
export interface ICompileSettings {
  es6?: boolean;
  es7?: boolean;
  minify?: boolean;
  codeProtect?: boolean;
  minifyJS?: boolean;
  minifyHTML?: boolean;
  minifyCSS?: boolean;
  autoPrefixCSS?: boolean;
  disableUseStrict?: boolean;
  compileWorklet?: boolean;
}
