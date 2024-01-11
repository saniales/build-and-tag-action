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
      .post('/repos/saniales/test/git/commits')
      .reply(200, (_, body) => {
        commitParams = body
      })
      .post('/repos/saniales/test/git/trees')
      .reply(200, (_, body) => {
        treeParams = body
      })

    tools = generateToolkit()
  })

  it('creates the tree and commit', async () => {
    yaml.parse.mockResolvedValue({
      runs: {
        main: "dist/index.js",
      },
    })
    await createCommit(tools)
    expect(nock.isDone()).toBe(true)

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(2)
    expect(treeParams.tree.some((obj: any) => obj.path === 'dist/index.js')).toBe(
      true
    )

    // Test that our commit was created correctly
    expect(commitParams.message).toBe('Automatic compilation')
    expect(commitParams.parents).toEqual([tools.context.sha])
  })

  it('creates the tree and commit (valid pre)', async () => {
    yaml.parse.mockResolvedValue({
      runs: {
        pre: "dist/index.js",
        main: "dist/index.js",
      },
    })
    await createCommit(tools)
    expect(nock.isDone()).toBe(true)

    // Test that our tree was created correctly
    expect(treeParams.tree).toHaveLength(3)
    expect(treeParams.tree.filter((obj: any) => obj.path === 'dist/index.js').length).toBe(
      2
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

  it('creates the tree and commit (no runs configuration)', async () => {
    yaml.parse.mockResolvedValue({}) // empty action file
    await expect(() => createCommit(tools)).rejects.toThrow(
      'Property "runs" does not exist in your `action.yml`.',
    )
  })

  it('creates the tree and commit (invalid main)', async () => {
    yaml.parse.mockResolvedValue({
      runs: {
        main: "dist/invalid.js",
      }
    })
    await expect(() => createCommit(tools)).rejects.toThrow(
      'invalid "runs.main": "dist/invalid.js" does not exist.'
    )
  })

  it('creates the tree and commit (invalid pre)', async () => {
    yaml.parse.mockResolvedValue({
      runs: {
        pre: "dist/invalid.js",
        main: "dist/index.js",
      }
    })
    await expect(() => createCommit(tools)).rejects.toThrow(
      'invalid "runs.pre": "dist/invalid.js" does not exist.'
    )
  })

  it('creates the tree and commit (invalid post)', async () => {
    yaml.parse.mockResolvedValue({
      runs: {
        main: "dist/index.js",
        post: "dist/invalid.js",
      }
    })
    await expect(() => createCommit(tools)).rejects.toThrow(
      'invalid "runs.post": "dist/invalid.js" does not exist.'
    )
  })
})
