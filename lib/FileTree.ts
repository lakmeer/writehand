import Config from './Config.ts'

import * as fs from 'node:fs'
import ignore from 'ignore'
import { join } from 'node:path'
import { diff } from './diff'
import { isText } from 'istextorbinary'
import { is_a_file, is_a_dir } from './utils.ts'

import { SIGIL, PRAGMA_CONTEXT, PRAGMA_COMMAND, PRAGMA_QUERY } from './const.ts'


// Types

type PragmaFlag = {
  name: 'model' | 'system'
  value: string
}

type Pragma = {
  type:   'command' | 'query' | 'context' | 'always' | 'never' | 'include'
  text:   string
  args:   string[]
  flags:  PragmaFlag[]
  line:   number
  length: number // number of lines covered
}


//
// File
//
// TODO: don't store contents in memory; scan them at startup and record
//    relevant information, but then throw the buffer away. Re-read it if
//    the program actually needs it.
//

class File {
  path: string
  contents: string
  pragmas: Pragma[]
  context: {
    always: boolean
    never:  boolean
    tags:   string[]
  }

  constructor (root_path:string, path:string, ignore_non_text:boolean) {
    this.path     = path.replace(root_path, '')
    this.contents = fs.readFileSync(path, 'utf-8')
    this.pragmas  = this.scan_pragmas(ignore_non_text)
  }

  scan_pragmas (ignore_non_text:boolean) {
    if (!isText(null, this.contents) && ignore_non_text) return []

    const pragmas: Pragma[] = []
    const lines = this.contents.split('\n')

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      if (line.includes(SIGIL)) {
        pragmas.push(this.parse_pragma(line, i))
      }
    }

    return pragmas
  }

  parse_pragma (line:string, number:number): Pragma {

    line = line.split(SIGIL)[1].trim()

    let type:Pragma['type']
    let args:string[]      = []
    let flags:PragmaFlag[] = []

    // TODO: flags

    switch (line[0]) {
      case PRAGMA_COMMAND: 
        type = 'command';
        args = line.slice(1)
        break

      case PRAGMA_QUERY:   type = 'query'; break
      case PRAGMA_CONTEXT:
        const keyword = line.split(' ')[0]

        switch (keyword) {
          case '+always': type = 'always'; break
          case '+never':  type = 'never'; break
          case '+include':
            type = 'include';
            args = line.split(' ')[1]
            break
          default: 
            type = 'context'
            args = line.split(' ')[1].split(',').map(arg => arg.trim())
        }
        break
    }

    const pragma:Pragma = {
      file: this.path,
      text: line,
      type,
      args,
      flags,
      line: number,
      length: 1,
    }

    return pragma
  }
}


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
  files:     File[]

  constructor (root_path:string, config:Config) {
    this.root_path = root_path
    this.excludes = config.generate_exclude_list()

    this.all = fs.readdirSync(this.root_path, { recursive: true })
      .filter(ignore().add(this.excludes).createFilter())
      .map(path => join(this.root_path, path))

    this.tree  = this.format_filelist_as_tree()
    this.dirs  = this.all.filter(is_a_dir).map(path => path.replace(root_path, ''))
    this.files = this.all.filter(is_a_file).map(path => new File(root_path, path, config.FileRules.exclude_non_text))

    if (config.FileRules.exclude_non_text) {
      this.files = this.files.filter(file => isText(null, file.contents))
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

}

