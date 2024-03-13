import { main } from "@hengshuai/mini-core";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { logger } from "./utils";
import process from "process";
import path from "path";

main();

export * from "./utils";
export * from "@hengshuai/mini-core";

const root = process.cwd();
const ciConfig = require(path.resolve(root, "./mini-ci.config.js"));
console.log(ciConfig);
