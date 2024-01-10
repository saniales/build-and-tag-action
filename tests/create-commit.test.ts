import nock from 'nock'
import createCommit from '../src/lib/create-commit'
import { generateToolkit } from './helpers'
import { Toolkit } from 'actions-toolkit'

import { jest } from "@jest/globals"

const yaml = require('yaml');
jest.mock('yaml');

describe('create-commit', () => {
  let tools: Toolkit
  let treeParams: any
  let commitParams: any

  beforeEach(() => {
    nock('https://api.github.com')
      .post('/repos/JasonEtco/test/git/commits')
      .reply(200, (_, body) => {
        commitParams = body
      })
      .post('/repos/JasonEtco/test/git/trees')
      .reply(200, (_, body) => {
        treeParams = body
      })

    tools = generateToolkit()
  })

  it('creates the tree and commit', async () => {
    yaml.parse.mockResolvedValue({
      runs: {
        main: "index.js",
      },
    })
    await createCommit(tools)
    expect(nock.isDone()).toBe(true)

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(2)
    expect(treeParams.tree.some((obj: any) => obj.path === 'index.js')).toBe(
      true
    )

    // Test that our commit was created correctly
    expect(commitParams.message).toBe('Automatic compilation')
    expect(commitParams.parents).toEqual([tools.context.sha])
  })

  it('creates the tree and commit', async () => {
    yaml.parse.mockResolvedValue({
      runs: {}
    })
    await expect(() => createCommit(tools)).rejects.toThrow(
      'Property "runs.main" does not exist in your `action.yml`.'
    )
  })
})
