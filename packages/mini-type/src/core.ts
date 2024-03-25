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
  /** 项目路径 */
  projectPath?: string;
  /** 上传代码私钥地址 */
  privateKeyPath?: string;
  admin: string;
  /**
   * 发布模式
   * @default uploadCode
   */
  mode?: IProjectActionMode;
  /**
   * 不上传代码
   * @default false
   */
  skipUpload?: boolean;
  /**
   * 跳过提审
   * @default false
   */
  skipReview?: boolean;
  version?: string;
  description?: string;
  /**
   * 当前项目是否可视化(优先级：项目 > ci > config)
   * @default false
   */
  visual?: boolean;
  type?: IProjectType;
  compiler?: ICompileSettings;
  ignores?: string[];
}

/**
 * 项目发布模式
 * @default uploadCode
 */
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
