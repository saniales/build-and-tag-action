import { Toolkit } from "actions-toolkit";

/**
 * Creates or updates a git reference with the given SHA and tag name.
 *
 * @param {Toolkit} tools - The toolkit object for accessing GitHub APIs.
 * @param {string} sha - The SHA of the commit to associate with the reference.
 * @param {string} tagName - The name of the tag.
 * @return {Promise<void>} A promise that resolves when the reference is created or updated.
 */
export default async function createOrUpdateRef(
  tools: Toolkit,
  sha: string,
  tagName: string
) {
  const refName = `tags/v${tagName}`;
  tools.log.info(`Updating major version tag ${refName}`);
  const { data: matchingRefs } = await tools.github.git.listMatchingRefs({
    ...tools.context.repo,
    ref: refName,
  });

  const matchingRef = matchingRefs.find((refObj) => {
    return refObj.ref.endsWith(refName);
  });

  if (matchingRef !== undefined) {
    await tools.github.git.updateRef({
      ...tools.context.repo,
      force: true,
      ref: refName,
      sha,
    });
  } else {
    await tools.github.git.createRef({
      ...tools.context.repo,
      ref: `refs/${refName}`,
      sha,
    });
  }
}
