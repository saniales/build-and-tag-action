import { Toolkit } from "actions-toolkit";

/**
 * Retrieves the tag name from the given toolkit.
 *
 * @param {Toolkit} tools - The toolkit object containing the necessary tools for the function.
 * @return {string} - The tag name retrieved from the toolkit.
 * @throws {Error} - If no tag_name was found or provided.
 */
export default function getTagName(tools: Toolkit): string {
  if (tools.inputs.tag_name) {
    return tools.inputs.tag_name;
  }

  if (tools.context.event === "release") {
    return tools.context.payload.release.tag_name;
  }

  throw new Error("No tag_name was found or provided!");
}
