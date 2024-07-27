
//
// Writehand
//

// TODO:
// [ ] Read env
// [ ] Read config file
//   [ ] KDL library
// [ ] Set up state
// [ ] Prepare models
// [ ] Validate setup
// [ ] Shift cwd if required
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


import state from './lib/startup.ts'

const work = state.file_tree.get_executable_pragmas()

console.log(work)
