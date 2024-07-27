
import fs from 'node:fs'


//
// Domainless Helper Function
//

export const is_a_file = (path:string) => fs.statSync(path).isFile()
export const is_a_dir  = (path:string) => fs.statSync(path).isDirectory()

