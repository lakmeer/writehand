import { Eta } from 'eta'
import { query, type Document } from 'kdljs'
import type { PromptBundle } from '../../types'
import { code_block } from '../utils'
import * as Highlight from 'cli-highlight'


//
// Base Model Provider
//
// Probably will never be ued directly, just here to define required methods
// and config values for use by Writehand.
//
// TODO: Move Eta templater to a singleton provider so it can be configured and cached
//

export default class ModelProvider {

  #config:    Document             // KDL config
  #key_memo:  Record<string, any>  // caches queries to the KDL config

  system:     string      // The system prompt
  temp:       number      // Model temperature
  max_tokens: number      // Max tokens (in response)
  is_default: boolean     // Is this the default model

  constructor (config:Document) {
    this.#config = config
    this.#key_memo = {}
    this.is_default = false
  }

  get_kdl_key<T> (q:string, multiple:boolean = false):T|undefined {
    if (this.#key_memo[q]) return this.#key_memo[q]
    const hits = query(this.#config, q)
    if (hits.length === 0) return undefined
    this.#key_memo[q] = multiple ? hits[0].values : hits[0].values[0]
    return this.#key_memo[q] as T
  }

  apply_defaults () {
    throw 'ModelProvider: `apply_defaults` not implemented'
  }

  apply_config () {
    throw 'ModelProvider: `apply_config` not implemented'
  }

  enforce_requirements () {
    throw 'ModelProvider: `enforce_requirements` not implemented'
  }

  template_render (template:string, data:Record<string, any>):string {
    const eta = new Eta({ useWith: true, rmWhitespace: false, autoEscape: false })
    return eta.renderString(template.trim(), data)
  }

  compile_prompt_preamble (bundle:PromptBundle) {
    return this.template_render(PROMPT_TEMPLATE, bundle)
  }
}


const PROMPT_TEMPLATE = `
Please complete the provided task by outputting modified versions of any of the
supplied files, or entirely new files. Mark note the start of each file like
this: \`### /path/to/filename.ext\` and use markdown code blocks to surround
code.

## Task description
Please <%= command %>


## Project structure
<%= file_tree %>


## Main Source File
This file is the focus of the work that needs to be done.

### <%= main_file.path %>

\`\`\`
<%= main_file.contents %>
\`\`\`


## Auxilliary files
These files may provide useful reference for completing the task.

<% for (const file of files) { %>
### <%= file.path %>

\`\`\`
<%= file.contents %>
\`\`\`

<% } %>

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sollicitudin quam
eget libero pulvinar id condimentum velit sollicitudin. Proin cursus
scelerisque dui ac condimentum. Nullam quis tellus leo. Morbi consectetur,
lectus a blandit tincidunt, tortor augue tincidunt nisi, sit amet rhoncus
tortor velit eu felis. 
`

