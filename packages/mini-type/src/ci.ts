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

  /**
   * 是否开启调试模式(调试模式不会自动执行最后一步)
   * @default false
   */
  debug?: boolean;
}

export interface ICITerminalConfig {
  /**
   * 静默模式不会出现图形界面
   * @default true
   */
  silent: boolean;

  /**
   * 运行模式 (优先级最高)
   * @default uploadCode
   */
  mode: IProjectActionMode;

  /**
   * ci配置文件路径
   */
  config: string;

  /**
   * web服务端口
   */
  port: number;

  /**
   * 超时时间(单位 ms)
   * @default 120s
   */
  timeout: number;

  /**
   * 线程数
   * @default 1
   */
  thread?: number;

  /**
   * 是否开启调试模式(调试模式不会自动执行最后一步)
   * @default false
   */
  debug?: boolean;
}
