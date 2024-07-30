
//
// Writehand
//

// TODO:
// [X] Read env
// [X] Shift cwd if required
// [X] Read config file
//   [X] KDL library
// [X] Set up state
// [X] Prepare models
//   [X] Prototype Anthronic API provider
// [ ] Validate setup
// [X] Compile filetree
//   [X] Crawl filesystem
//   [X] Build tree object
//   [X] Scan for pragmas
//   [X] Tag files with pragma flags
// [X] Produce list of executable pragmas
// [-] Execute pragmas:
//   [ ] Parse flags
//   [X] Collect context
//   [X] Compile prompt preamble
//     [X] Context files
//     [X] Always includes
//     [X] Filetree
//   [ ] Submit
//   [ ] Integrate output into file content caches
//   [ ] Remove pragmas
//   [ ] Write output to temp File objects
//   [ ] Compare and generate diffs
//   [ ] Delete temp files
// [ ] Emit report

import type { PromptBundle } from './types'

import { config, file_tree } from './lib/startup'

const work = file_tree.get_executable_pragmas()


// Prepare models

for (const pragma of work) {
  const model             = config.get_default_model()
  const originating_file  = file_tree.get_file(pragma.file)
  const context_tags      = originating_file?.context.tags ?? []
  const context_files     = file_tree.get_files_with_contexts(context_tags)
  const always_files      = file_tree.get_always_included_files(config)

  if (!originating_file) throw "Main file not found"
  if (!model)            throw "Model not found"

  const bundle:PromptBundle = {
    command:   pragma.args[0],
    main_file: originating_file,
    file_tree: file_tree.format_filelist_as_tree(),
    files:     [ ...context_files, ...always_files ]
  }

  model.compile_prompt_preamble(bundle)

}

