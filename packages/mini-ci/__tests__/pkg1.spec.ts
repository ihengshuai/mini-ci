import { transform, logger } from "@mono/pkg1";

describe("pkg1测试", () => {
  test("pkg1-demo1", () => {
    expect(transform(true)).toBe(true);
    expect(logger("test"));
  });
});
