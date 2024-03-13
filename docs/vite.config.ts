import { defineConfig } from "vite";
// import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

const config = dotenv.config({ path: path.resolve(__dirname, ".env") });
const __isDev__ = config.parsed?.NODE_ENV !== "production";

const alias = createAlias();

export default defineConfig({
  // plugins: [vueJsx()],
  resolve: {
    alias,
  },
});

function createAlias() {
  const dirs: string[] = fs.readdirSync(path.resolve(__dirname, "../packages"));
  // 开发环境时直接引用本地对应的源码文件
  const alias = __isDev__
    ? dirs.reduce((prev, name) => {
        prev[`@hengshuai/${name}`] = path.resolve(__dirname, `../packages/${name}/src`);
        return prev;
      }, {})
    : {};
  return alias;
}
