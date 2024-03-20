# mini-core

minici核心包是框架的核心基座，其他的平台基于核心进行开发，必备

## 安装

```bash
npm i @hengshuai/mini-core -D
```

## 配置文件

```js
// mini-ci.config.js
const { defineConfig } = require("@hengshuai/mini-core");
const { Platform, IProjectActionMode } = require("@hengshuai/mini-type");

module.exports = defineConfig({
  ci: {},
  platforms: {
    // WeChat平台
    [Platform.Wechat]: {
      platformSpecific: {
        // 包地址
        projectPath: "./dist",
        // 上传代码的私钥
        privateKeyPath: ".mini-ci/keys/wechat-upload-code.key",
      },
      subs: [
        {
          appId: "Your AppId",
          admin: "https://mp.weixin.qq.com",
          version: "1.0.0",
          mode: IProjectActionMode.REVIEW,
          description: "测试ci  " + +new Date,
          compiler: {
            // es6: false,
            // es7: true,
            // minifyJS: true,
          },
        },
      ]
    }
  }
})
```

更多配置参考包定义