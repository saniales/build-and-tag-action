import path from "path";
import readFile from "../src/lib/read-file";

describe("read-file", () => {
  const baseDir = path.join(__dirname, "fixtures");

  it("reads the file and returns the contents", async () => {
    const result = await readFile(baseDir, "README.md");
    expect(result).toBe(
      "This is just a mock of the Github Action workspace used in tests\n"
    );
  });

  it("throws if the file does not exist", async () => {
    await expect(readFile(baseDir, "invalid-file.txt")).rejects.toThrow(
      '"invalid-file.txt" does not exist.'
    );
  });
});
