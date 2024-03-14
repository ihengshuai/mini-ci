import path from "path";
import process from "process";
import fs from "fs";

export const rootDir = process.cwd();

export const resolvePath = (p: string) => path.resolve(rootDir, p);

export function sleep(ms = 500) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 删除文件
export async function deleteFile(filePath: string) {
  try {
    if (filePath && filePath !== "") {
      await fs.unlinkSync(resolvePath(filePath));
    }
  } catch (err) {
    console.error(err);
  }
}
