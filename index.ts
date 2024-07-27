
//
// Writehand
//

// TODO:
// [X] Read env
// [X] Shift cwd if required
// [ ] Read config file
//   [ ] KDL library
// [X] Set up state
// [ ] Prepare models
// [ ] Validate setup
// [ ] Compile filetree
//   [ ] Crawl filesystem
//   [ ] Build tree object
//   [ ] Scan for pragmas
//   [ ] Tag files with pragma flags
// [ ] Produce list of executable pragmas
// [ ] Execute pragmas:
//   [ ] Parse flags
//   [ ] Collect context
//   [ ] Compile prompt preamble
//     [ ] Context files
//     [ ] Always includes
//     [ ] Filetree
//   [ ] Submit
//   [ ] Integrate output into file content caches
//   [ ] Remove pragmas
//   [ ] Write output to disk
// [ ] Emit report


import state from './lib/startup'

const work = state.file_tree.get_executable_pragmas()


// Prepare models


console.log(work)
