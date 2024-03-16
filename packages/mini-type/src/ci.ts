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
   * 超时时间(单位 s)
   * @default 60s
   */
  timeout?: number;
}
