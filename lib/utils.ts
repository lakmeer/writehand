
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
