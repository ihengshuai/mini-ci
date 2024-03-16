import { ICI } from "./ci";
import { IPlatformsConfig } from "./platform";

/** MiniCI 入口配置 */
export interface IMiniConfig {
  /** ci配置  */
  ci?: ICI;
  /** 平台配置 */
  platforms: IPlatformsConfig;
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
