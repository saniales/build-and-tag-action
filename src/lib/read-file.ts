import fs from "fs";
import path from "path";

/**
 * Reads a file from the specified directory asynchronously.
 *
 * @param {string} baseDir - The base directory path.
 * @param {string} file - The file to read.
 * @return {Promise<string>} A promise that resolves with the content of the file as a string.
 * @throws {Error} In case the file does not exist.
 */
export default async function readFile(baseDir: string, file: string) {
  const pathToFile = path.join(baseDir, file);

  if (!fs.existsSync(pathToFile)) {
    throw new Error(`"${file}" does not exist.`);
  }

  return fs.promises.readFile(pathToFile, "utf8");
}
