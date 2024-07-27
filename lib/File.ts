import * as fs from 'node:fs'
import { is_text } from './utils'
import { SIGIL, PRAGMA_CONTEXT, PRAGMA_COMMAND, PRAGMA_QUERY } from './const'


// Types

type PragmaFlag = {
  name: 'model' | 'system'
  value: string
}

type Pragma = {
  type:   'command' | 'query' | 'context' | 'always' | 'never' | 'include'
  file:   string
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

export default class File {

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
    this.context  = { always: false, never:  false, tags:   [], }
    this.pragmas  = this.scan_pragmas(ignore_non_text)

    for (const pragma of this.pragmas) {
      switch (pragma.type) {
        case 'always':  this.context.always = true; break
        case 'never':   this.context.never  = true; break
        case 'context': this.context.tags = this.context.tags.concat(pragma.args); break
      }
    }
  }


  scan_pragmas (ignore_non_text:boolean) {
    if (!is_text(this.contents) && ignore_non_text) return []

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
        args.push(line.slice(1))
        break

      case PRAGMA_QUERY:   type = 'query'; break
      case PRAGMA_CONTEXT:
        const keyword = line.split(' ')[0]

        switch (keyword) {
          case '+always': type = 'always'; break
          case '+never':  type = 'never'; break
          case '+include':
            type = 'include';
            args = [ line.split(' ')[1] ]
            break
          default: 
            type = 'context'
            args = line.split(' ')[1].split(',').map(arg => arg.trim())
        }
        break

      default:
        throw `Unknown pragma type: ${line[0]}`
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

