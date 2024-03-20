const { build } = require("esbuild");
const { copy } = require("esbuild-plugin-copy");

build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.js",
  format: "cjs",
  platform: "node",
  target: "node14",
  minify: true,
  external: ["puppeteer", "miniprogram-ci", "@hengshuai/mini-*"],
  // packages: "external",
  plugins: [
    copy({
      resolveFrom: "cwd",
      assets: {
        from: ["README.md"],
        to: ["dist/README.md"],
      },
    }),
  ],
});
