
import type File from '../lib/File'


//
// Collects together resources required to build the model prompt
//

export type PromptBundle = {
  command:   string
  files:     File[]
  main_file: File
  file_tree: string
}

