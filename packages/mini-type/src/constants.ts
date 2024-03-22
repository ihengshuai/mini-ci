/** ci默认的文件夹(放配置,图片等) */
export const MiniCIDefaultDir = ".mini-ci";

/** 执行过程中产生的静态文件目录 */
export const MiniAssetsDir = MiniCIDefaultDir + "/assets";

/** CI环境 */
export enum CI_ENVS {
  DEBUG = "Debug",
  PROD = "Prod",
}

/** web服务端口 */
export const WEB_SERVER_PORT = 9034;
