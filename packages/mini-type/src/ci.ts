import { IProjectActionMode } from "./core";

export interface ICI {
  /**
   * 可视化的
   * @default false
   */
  visual?: boolean;

  /**
   * 线程数
   * @default 1
   */
  thread?: number;

  /**
   * 超时时间(单位 ms)
   * @default 120s
   */
  timeout?: number;
}

export interface ICITerminalConfig {
  silent: boolean;
  mode: IProjectActionMode;
  config: string;
  port: number;
  timeout: number;
  thread?: number;
}
