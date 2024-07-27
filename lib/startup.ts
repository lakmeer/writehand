import dotenv, { type DotenvParseOutput } from 'dotenv'
import { join } from 'path'
import { parseArgs } from 'util'

import Config   from './Config'
import FileTree from './FileTree'

export type Env = DotenvParseOutput


//
// Startup sequence
//

// Parse args
const { values } = parseArgs({
  args: Bun.argv,
  strict: true,
  allowPositionals: true,
  options: {
    root: {
      type: 'string',
    },
  },
})

// Set cwd
let root_path:string = (values.root) ? join(process.cwd(), values.root) : process.cwd()

// Read env
const env:Env = dotenv.config({ path: join(root_path, '.env') }).parsed ?? {}

// Build env and file tree
const config    = new Config(root_path, env)
const file_tree = new FileTree(root_path, config)

// Export state
export default {
  config,
  file_tree,
}
