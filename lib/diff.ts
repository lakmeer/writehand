
import { createPatch } from 'diff'


//
// Generate diff with optional colorization
//
// Adapted from https://github.com/LinusU/node-print-diff [MIT]
//

const GREEN = 42
const RED   = 41

const not_null = (line:string|null): line is string => line !== null

function rework (line:string, colorise = false):string|null {
  switch (line[0]) {
    case '+': return colorise ? `\u001b[${GREEN}m${line}\u001b[0m` : line
    case '-': return colorise ? `\u001b[${RED}m${line}\u001b[0m`   : line
    case ' ': return line
    case '@': return null
    case '\\': return null
    default: return null // TODO: should this be `line`?
  }
}

export function diff (actual:string, expected:string, colorise = false) {
  // TODO: Output whole file incl diffs, not just patch
  //  Might just require modifying `rework` tbh
  const patch = createPatch('string', actual, expected)
  const lines = patch.split('\n').slice(4).map((line) => rework(line, colorise)).filter(not_null)
  return lines.join('\n') + '\n'
}

export function diff_changes_only (actual:string, expected:string, colorise = false) {
  const patch = createPatch('string', actual, expected)
  const lines = patch.split('\n').slice(4).map((line) => rework(line, colorise)).filter(not_null)
  return lines.filter(line => line[0] !== '@').join('\n') + '\n'
}
