import { Toolkit } from "actions-toolkit";

import readFile from "./read-file";

import yaml from "yaml";

function throwInvalidFileError(
  property_path: string = "unknown",
  err: Error | unknown
) {
  if (err instanceof Error) {
    throw new Error(`invalid "${property_path}": ${err.message}`);
  }

  throw new Error("Unknown error");
}

export default async function createCommit(tools: Toolkit) {
  const actionYML = await readFile(tools.workspace, "action.yml");
  const { runs } = await yaml.parse(actionYML);

  if (!runs) {
    throw new Error('Property "runs" does not exist in your `action.yml`.');
  }

  const { main, pre, post } = runs;

  if (!main) {
    throw new Error(
      'Property "runs.main" does not exist in your `action.yml`.'
    );
  }

  const treeFiles: any = [
    {
      path: "action.yml",
      mode: "100644",
      type: "blob",
      content: actionYML,
    },
  ];

  try {
    treeFiles.push({
      path: main,
      mode: "100644",
      type: "blob",
      content: await readFile(tools.workspace, main),
    });
  } catch (err) {
    throwInvalidFileError("runs.main", err);
  }

  if (pre) {
    try {
      treeFiles.push({
        path: pre,
        mode: "100644",
        type: "blob",
        content: await readFile(tools.workspace, pre),
      });
    } catch (err) {
      throwInvalidFileError("runs.pre", err);
    }
  }

  if (post) {
    try {
      treeFiles.push({
        path: post,
        mode: "100644",
        type: "blob",
        content: await readFile(tools.workspace, post),
      });
    } catch (err) {
      throwInvalidFileError("runs.post", err);
    }
  }

  tools.log.info("Creating tree");
  const tree = await tools.github.git.createTree({
    ...tools.context.repo,
    tree: treeFiles,
  });

  tools.log.complete("Tree created");

  tools.log.info("Creating commit");
  const commit = await tools.github.git.createCommit({
    ...tools.context.repo,
    message: "Automatic compilation",
    tree: tree.data.sha,
    parents: [tools.context.sha],
  });
  tools.log.complete("Commit created");

  return commit.data;
}
