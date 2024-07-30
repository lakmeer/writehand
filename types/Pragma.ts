
// Pragma structure

export type Pragma = {
  type:   'command' | 'query' | 'context' | 'always' | 'never' | 'include'
  file:   string
  text:   string
  args:   string[]
  flags:  PragmaFlag[]
  line:   number
  length: number // number of lines covered
}

export type PragmaFlag = {
  name: 'model' | 'system'
  value: string
}

