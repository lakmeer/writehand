
import fs from 'node:fs'
import { isText } from 'istextorbinary'


//
// Domainless Helper Function
//

export const is_a_file = (path:string) => fs.statSync(path).isFile()
export const is_a_dir  = (path:string) => fs.statSync(path).isDirectory()
export const is_text   = (src:string) => isText(null, src as unknown as Buffer) // works, but is not typed

export const parse_gitignore = (path:string):string[] => {
  if (!fs.existsSync(path)) return []

  return fs.readFileSync(path, 'utf8').split('\n')
    .filter((line) => !line.startsWith('#'))
    .map((line) => line.trim())
    .filter((line) => line !== '')
}

export const align_margin = (str:string) => {
  const lines = str.split('\n')
  while (lines[0].trim() === '') lines.shift()
  const margin = lines[0].search(/\S/)
  const rx = new RegExp(`^\\s{1,${margin}}`)
  return lines.map((line) => line.replace(rx, '')).join('\n').trim();
}

export const code_block = (str:string) => '```\n' + str + '\n```\n'
