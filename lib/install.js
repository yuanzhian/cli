/* eslint-disable camelcase */
/* eslint-disable standard/no-callback-literal */
const fs = require('fs')
const util = require('util')
const readdir = util.promisify(fs.readdir)
const writeFile = util.promisify(fs.writeFile)
const reifyFinish = require('./utils/reify-finish.js')
const log = require('npmlog')
const { resolve, join } = require('path')
const Arborist = require('@npmcli/arborist')
const runScript = require('@npmcli/run-script')
const { breadth, depth } = require('treeverse')

const ArboristWorkspaceCmd = require('./workspaces/arborist-cmd.js')
class Install extends ArboristWorkspaceCmd {
  /* istanbul ignore next - see test/lib/load-all-commands.js */
  static get description () {
    return 'Install a package'
  }

  /* istanbul ignore next - see test/lib/load-all-commands.js */
  static get name () {
    return 'install'
  }

  /* istanbul ignore next - see test/lib/load-all-commands.js */
  static get params () {
    return [
      'save',
      'save-exact',
      'global',
      'global-style',
      'legacy-bundling',
      'strict-peer-deps',
      'package-lock',
      'omit',
      'ignore-scripts',
      'audit',
      'bin-links',
      'fund',
      'dry-run',
      'importmap',
      ...super.params,
    ]
  }

  /* istanbul ignore next - see test/lib/load-all-commands.js */
  static get usage () {
    return [
      '[<@scope>/]<pkg>',
      '[<@scope>/]<pkg>@<tag>',
      '[<@scope>/]<pkg>@<version>',
      '[<@scope>/]<pkg>@<version range>',
      '<alias>@npm:<name>',
      '<folder>',
      '<tarball file>',
      '<tarball url>',
      '<git:// url>',
      '<github username>/<github project>',
    ]
  }

  async completion (opts) {
    const { partialWord } = opts
    // install can complete to a folder with a package.json, or any package.
    // if it has a slash, then it's gotta be a folder
    // if it starts with https?://, then just give up, because it's a url
    if (/^https?:\/\//.test(partialWord)) {
      // do not complete to URLs
      return []
    }

    if (/\//.test(partialWord)) {
      // Complete fully to folder if there is exactly one match and it
      // is a folder containing a package.json file.  If that is not the
      // case we return 0 matches, which will trigger the default bash
      // complete.
      const lastSlashIdx = partialWord.lastIndexOf('/')
      const partialName = partialWord.slice(lastSlashIdx + 1)
      const partialPath = partialWord.slice(0, lastSlashIdx) || '/'

      const annotatePackageDirMatch = async (sibling) => {
        const fullPath = join(partialPath, sibling)
        if (sibling.slice(0, partialName.length) !== partialName)
          return null // not name match

        try {
          const contents = await readdir(fullPath)
          return {
            fullPath,
            isPackage: contents.indexOf('package.json') !== -1,
          }
        } catch (er) {
          return { isPackage: false }
        }
      }

      try {
        const siblings = await readdir(partialPath)
        const matches = await Promise.all(
          siblings.map(async sibling => {
            return await annotatePackageDirMatch(sibling)
          })
        )
        const match = matches.filter(el => !el || el.isPackage).pop()
        if (match) {
          // Success - only one match and it is a package dir
          return [match.fullPath]
        } else {
          // no matches
          return []
        }
      } catch (er) {
        return [] // invalid dir: no matching
      }
    }
    // Note: there used to be registry completion here,
    // but it stopped making sense somewhere around
    // 50,000 packages on the registry
  }

  exec (args, cb) {
    this.install(args).then(() => cb()).catch(cb)
  }

  async install (args) {
    // the /path/to/node_modules/..
    const globalTop = resolve(this.npm.globalDir, '..')
    const ignoreScripts = this.npm.config.get('ignore-scripts')
    const isGlobalInstall = this.npm.config.get('global')
    const where = isGlobalInstall ? globalTop : this.npm.prefix

    // don't try to install the prefix into itself
    args = args.filter(a => resolve(a) !== this.npm.prefix)

    // `npm i -g` => "install this package globally"
    if (where === globalTop && !args.length)
      args = ['.']

    // TODO: Add warnings for other deprecated flags?  or remove this one?
    if (this.npm.config.get('dev'))
      log.warn('install', 'Usage of the `--dev` option is deprecated. Use `--include=dev` instead.')

    const opts = {
      ...this.npm.flatOptions,
      log: this.npm.log,
      auditLevel: null,
      path: where,
      add: args,
      workspaces: this.workspaceNames,
    }
    const arb = new Arborist(opts)
    await arb.reify(opts)

    if (!args.length && !isGlobalInstall && !ignoreScripts) {
      const scriptShell = this.npm.config.get('script-shell') || undefined
      const scripts = [
        'preinstall',
        'install',
        'postinstall',
        'prepublish', // XXX should we remove this finally??
        'preprepare',
        'prepare',
        'postprepare',
      ]
      for (const event of scripts) {
        await runScript({
          path: where,
          args: [],
          scriptShell,
          stdio: 'inherit',
          stdioString: true,
          banner: log.level !== 'silent',
          event,
        })
      }
    }
    await reifyFinish(this.npm, arb)
    if (this.npm.flatOptions.importmap) {
      await generateImportMap(this.npm, arb)
      this.npm.output('\nGenerated importmap.json')
    }
  }
}

const generateImportMap = async (npm, arb) => {
  const actualTree = await arb.loadActual()
  const seen = new Set()
  const _depth = Symbol('depth')
  const importmap = { modules: {}, scopes: { '/': {} } }

  const getNode = (node) => {
    const location = `/${node.location}`
    let parent_location = `${node?.parent?.location}`
    if (!node[_depth])
      node[_depth] = 0
    else if (node[_depth] === 1)
      importmap.scopes['/'][node.name] = location
    else if (node[_depth] > 1) {
      if (!parent_location)
        importmap.modules[node.name] = location
      else {
        parent_location = '/' + parent_location
        if (!importmap.scopes[parent_location])
          importmap.scopes[parent_location] = {}
        importmap.scopes[parent_location][node.name] = location
      }
    }
    const hash = `${location}::${parent_location}`
    if (seen.has(hash) || !node.edgesOut)
      return
    seen.add(hash)

    for (const edge of node.edgesOut.values()) {
      if (edge.to) {
        edge.to[_depth] = node[_depth] + 1
        getNode(edge.to)
      }
    }
  }

  /*
  await depth({
    tree: actualTree,
    visit (node) {
      if (node[_depth] === 1)
        importmap.modules[node.name] = node.location
      else if (node[_depth] > 1) {
        if (!importmap.scopes[node.parent_location])
          importmap.scopes[node.parent_location] = {}
        importmap.scopes[node.parent_location][node.name] = node.location
      }
    },
    getChildren (node, nodeResult) {
      node[_depth] = node[_depth] || 0
      if (seen.has(node.location))
        return []
      seen.add(node.location)
      if (node.edgesOut !== null && node.edgesOut !== undefined) {
        const children = [...node.edgesOut.values()].map(edge => {
          return { parent: node.name, name: edge.to.name, edgesOut: node.edgesOut, location: `${edge.to.location}`, [_depth]: node[_depth] + 1, parent_location: `${node.location}` }
        })
        return children
      }
      return []
    },
  })
  */
  getNode(actualTree)
  await writeFile(join(npm.prefix, 'importmap.json'), JSON.stringify(importmap, undefined, 2))
}

module.exports = Install
