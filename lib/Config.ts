
import { readFileSync } from 'fs'
import { join } from 'path'
import parse from 'parse-gitignore'

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

type ModelSpec = {}

type FileRulesSpec = {
  respect_gitignore:  boolean
  exclude_non_text:   boolean
  exclude_dotfiles:   boolean
  exclude:            string[]
  include:            string[]
}

export default class Config {

  root_path: string

  Model: Record<string, ModelSpec>

  FileRules: FileRulesSpec

  constructor (root_path: string) {
    this.root_path = root_path

    // TODO: Parse KDL
    // TODO: Convert to known structure

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

  generate_exclude_list () {
    const excludes = new Set()

    DEFAULT_EXCLUDES.forEach(excludes.add, excludes)
    this.FileRules.exclude.forEach(excludes.add, excludes)

    if (this.FileRules.respect_gitignore) {
      parse(join(this.root_path, '.gitignore')).patterns.forEach(excludes.add, excludes)
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

