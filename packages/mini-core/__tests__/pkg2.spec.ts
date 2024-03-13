import { main } from "@mono/pkg2";

describe("pkg2测试", () => {
  test("pkg2-demo1", () => {
    expect(main("main")).toBe(true);
  });
});
