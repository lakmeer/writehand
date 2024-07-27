
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { parse as parse_kdl } from 'kdljs'
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
  parse:      ReturnType<typeof parse_kdl>

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
    this.parse  = parse_kdl(this.source)


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

