import Config from './Config'
import File   from './File'

import * as fs from 'node:fs'
import ignore from 'ignore'
import { join } from 'node:path'
import { diff } from './diff'
import { is_a_file, is_a_dir, is_text } from './utils'



//
// FileTree
//
// Maintains a directory structure from the given root path.
// Optionally takes a list of exclusions, and reads the gitignore file if present.
//
// TODO: Should excluded files still be listed by the tree?
//

export default class FileTree {

  root_path: string
  excludes:  string[]
  all:       string[]
  tree:      string
  dirs:      string[]
  files:     File[]


  constructor (root_path:string, config:Config) {
    this.root_path = root_path
    this.excludes = config.generate_exclude_list()

    this.all = fs.readdirSync(this.root_path, { encoding: 'utf-8', recursive: true })
      .filter(ignore().add(this.excludes).createFilter())
      .map(path => join(this.root_path, path))

    this.tree  = this.format_filelist_as_tree()
    this.dirs  = this.all.filter(is_a_dir).map(path => path.replace(root_path, ''))
    this.files = this.all.filter(is_a_file).map(path => new File(root_path, path, config.FileRules.exclude_non_text))

    if (config.FileRules.exclude_non_text) {
      this.files = this.files.filter(file => is_text(file.contents))
    }
  }


  format_filelist_as_tree () {
    const tree: Record<string, any> = {};

    this.all.toSorted().map(path => path.replace(this.root_path, '')).forEach(path => {
      const parts = path.split('/').filter(Boolean);
      let current = tree;

      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = (index === parts.length - 1) ? null : {};
        }
        current = current[part];
      });
    });

    function renderTree(tree: Record<string, any>, prefix = ''): string {
      const entries = Object.entries(tree);
      const lastIndex = entries.length - 1;

      return entries.map(([key, value], index) => {
        const isLast = index === lastIndex;
        const connector = isLast ? '└─ ' : '├─ ';
        const nextPrefix = prefix + (isLast ? '   ' : '│  ');

        if (value === null) {
          return `${prefix}${connector}${key}`;
        } else {
          return `${prefix}${connector}${key}/\n${renderTree(value, nextPrefix)}`;
        }
      }).join('\n');
    }

    return `/\n${renderTree(tree)}`;
  }


  get_executable_pragmas () {
    return this.files.flatMap(file => file.pragmas).filter(pragma => pragma.type === 'command')
  }


  get_file (path:string) {
    return this.files.find(file => file.path === path)
  }


  get_files_with_contexts (tags:string[]) {
    return this.files.filter(file => file.context.tags.some(tag => tags.includes(tag)))
  }


  get_always_included_files (config:Config):File[] {
    // Files tagged '+always' via pragma
    const matching_files = this.files.filter(file => file.context.always)

    // Files included by name in FileRules
    for (const filename of config.FileRules.include) {
      const path = join(this.root_path, filename).replace(this.root_path, '')
      const file = this.get_file(path)
      if (file) matching_files.push(file)
    }

    return matching_files.filter(file => file !== null)
  }

}

