
//
// Writehand
//

// TODO:
// [X] Read env
// [X] Shift cwd if required
// [ ] Read config file
//   [ ] KDL library
// [X] Set up state
// [X] Prepare models
// [ ] Validate setup
// [X] Compile filetree
//   [X] Crawl filesystem
//   [X] Build tree object
//   [X] Scan for pragmas
//   [X] Tag files with pragma flags
// [X] Produce list of executable pragmas
// [ ] Execute pragmas:
//   [ ] Parse flags
//   [X] Collect context
//   [ ] Compile prompt preamble
//     [ ] Context files
//     [ ] Always includes
//     [ ] Filetree
//   [ ] Submit
//   [ ] Integrate output into file content caches
//   [ ] Remove pragmas
//   [ ] Write output to disk
// [ ] Emit report


import { config, file_tree } from './lib/startup'

const work = file_tree.get_executable_pragmas()


// Prepare models

for (const pragma of work) {
  console.log('🟢 Executing pragma:', pragma)

  const model             = config.get_default_model()
  const originating_file  = file_tree.get_file(pragma.file)
  const context_tags      = originating_file?.context.tags ?? []
  const context_files     = file_tree.get_files_with_contexts(context_tags)
  const always_files      = file_tree.get_always_included_files(config)

  console.log(context_files.map(file => file.path))
  console.log(always_files.map(file => file.path))

  const files = [ ...context_files, ...always_files ]

  //model.compile_prompt_preamble(file_tree, files, context_files, context_tags, file_tree)


}
