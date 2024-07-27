import { join } from 'path'
import { parseArgs } from 'util'

import Config   from './Config.ts'
import FileTree from './FileTree.ts'


//
// Startup sequence
//

// Parse args
const { values } = parseArgs({
  args: Bun.argv,
  options: {
    root: {
      type: 'string',
    },
  },
  strict: true,
  allowPositionals: true
})

// Set cwd
let root_path = (values.root) ? join(process.cwd(), values.root) : process.cwd()

// Read env
const env = require('dotenv').config({ path: join(root_path, '.env') }).parsed

// Build env and file tree
const config    = new Config(root_path, env)
const file_tree = new FileTree(root_path, config)

// Export state
export default {
  config,
  file_tree,
}
