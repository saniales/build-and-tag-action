import { Toolkit } from 'actions-toolkit'

import readFile from './read-file'

import yaml from 'yaml'

export default async function createCommit(tools: Toolkit) {
  const actionYML = await readFile(tools.workspace, 'action.yml')
  const { runs } = await yaml.parse(actionYML)

  if (!runs) {
    throw new Error('Property "runs" does not exist in your `action.yml`.')
  }

  const { main, pre, post } = runs

  if (!main) {
    throw new Error('Property "runs.main" does not exist in your `action.yml`.')
  }

  const treeFiles: any = [
    {
      path: 'action.yml',
      mode: '100644',
      type: 'blob',
      content: actionYML
    },
    {
      path: main,
      mode: '100644',
      type: 'blob',
      content: await readFile(tools.workspace, main)
    }
  ]

  if (pre) {
    treeFiles.push({
      path: pre,
      mode: '100644',
      type: 'blob',
      content: await readFile(tools.workspace, pre)
    })
  }

  if (post) {
    treeFiles.push({
      path: post,
      mode: '100644',
      type: 'blob',
      content: await readFile(tools.workspace, post)
    })
  }

  tools.log.info('Creating tree')
  const tree = await tools.github.git.createTree({
    ...tools.context.repo,
    tree: treeFiles
  })

  tools.log.complete('Tree created')

  tools.log.info('Creating commit')
  const commit = await tools.github.git.createCommit({
    ...tools.context.repo,
    message: 'Automatic compilation',
    tree: tree.data.sha,
    parents: [tools.context.sha]
  })
  tools.log.complete('Commit created')

  return commit.data
}
