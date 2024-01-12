import { Toolkit } from "actions-toolkit";

/**
 * Updates a tag in the GitHub repository.
 *
 * @param {Toolkit} tools - The toolkit object for accessing GitHub actions and utilities.
 * @param {string} sha - The SHA of the commit associated with the tag.
 * @param {string} tagName - The name of the tag to update.
 * @return {Promise<any>} A promise that resolves when the tag update is complete.
 */
export default async function updateTag(
  tools: Toolkit,
  sha: string,
  tagName: string
) {
  const ref = `tags/${tagName}`;

  tools.log.info(`Updating ${ref}`);
  return tools.github.git.updateRef({
    ...tools.context.repo,
    ref,
    force: true,
    sha,
  });
}
