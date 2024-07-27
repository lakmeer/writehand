
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { parse as parse_kdl, type Node as KDLNode } from 'kdljs'
import { parse_gitignore } from './utils'

import type { Env } from './startup'


const DEFAULT_EXCLUDES = [
  '.git',
  '.gitignore',
  '.DS_Store',
  '.vscode',
  'node_modules',
  'vendor',
  'tmp',
  'temp',
]


// Types

namespace Spec {
  export type Model = {}

  export type FileRules = {
    respect_gitignore:  boolean
    exclude_non_text:   boolean
    exclude_dotfiles:   boolean
    exclude:            string[]
    include:            string[]
  }
}


// Helpers

function fill_envars (source:string, env:Env) {
  return source.replaceAll(/\$([_A-Z0-9]+)/g, (_, key) => {
    if (env[key]) {
      return `"${env[key]}"`
    } else {
      throw `Config file requires environment variable $${key}, but it was not found.`
    }
  })
}



//
// Config
//
// Keeps track of preferences established by writehand.kdl
//
//
// Accepted nodes:
//
// - Model
// - FileRules
//

export default class Config {

  root_path:  string
  file_path:  string
  source:     string
  parse:      KDLNode[]

  // Config object
  Model:      Record<string, Spec.Model>
  FileRules:  Spec.FileRules


  constructor (root_path:string, env:Env) {
    this.root_path = root_path
    this.file_path = join(this.root_path, 'writehand.kdl')

    if (!existsSync(this.file_path)) {
      throw `No writehand.kdl file found in root path ${this.root_path}`
    }

    this.source = fill_envars(readFileSync(this.file_path, 'utf8'), env)

    // Apply default config
    this.Model = {
      default: {}
    }

    this.FileRules = {
      respect_gitignore: true,
      exclude_non_text: true,
      exclude_dotfiles: true,
      exclude: [],
      include: [],
    }

    // Apply discovered config
    const kdl_doc = parse_kdl(this.source)
    if (kdl_doc.errors.length) throw `Error parsing writehand.kdl: ${kdl_doc.errors.join('\n')}`
    this.parse = kdl_doc.output as KDLNode[]
    this.apply_config_file()
  }


  apply_config_file () {
    this.parse.forEach((node:KDLNode) => {

      switch (node.name) {
        case 'Model':
          this.Model[node.name] = {}
          break

        case 'FileRules':
          node.children.forEach((child:KDLNode) => {
            let key = child.name
            let value

            switch (key) {
              case 'respect_gitignore': value = child.values[0] as boolean; break
              case 'exclude_non_text':  value = child.values[0] as boolean; break
              case 'exclude_dotfiles':  value = child.values[0] as boolean; break
              case 'exclude':           value = child.values as string[]; break
              case 'include':           value = child.values as string[]; break

              default: throw `Unknown node type in writehand.kdl: ${child.name}`
            }

            // @ts-ignore: Can't be bothered jumping required hoops
            this.FileRules[key] = value
          })

          break

        default:
          throw `Unknown node type in writehand.kdl: ${node.name}`
      }
    })
  }

  generate_exclude_list ():string[] {
    const excludes = new Set<string>()

    DEFAULT_EXCLUDES.forEach(excludes.add, excludes)
    this.FileRules.exclude.forEach(excludes.add, excludes)

    if (this.FileRules.respect_gitignore) {
      parse_gitignore(join(this.root_path, '.gitignore')).forEach(excludes.add, excludes)
    }

    if (this.FileRules.exclude_dotfiles) {
      excludes.add('.*')
    }

    // Exact matches from the manual includes will remove the exclusion from the set.
    // Otherwise, add it to the set with '!' so that it becomes an unignore rule.
    this.FileRules.include.forEach((include:string) => {
      if (excludes.has(include)) {
        excludes.delete(include)
      } else {
        excludes.add('!' + include)
      }
    })

    return Array.from(excludes)
  }
}

