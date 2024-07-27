
import { createPatch } from 'diff'


//
// Generate diff with optional colorization
//
// Adapted from https://github.com/LinusU/node-print-diff [MIT]
//

const GREEN = 42
const RED = 41

function rework (line, colorise = false) {
  switch (line[0]) {
    case '+': return colorise ? `\u001b[${GREEN}m${line}\u001b[0m` : line
    case '-': return colorise ? `\u001b[${RED}m${line}\u001b[0m`   : line
    case ' ': return line
    case '@': return null
    case '\\': return null
  }
}

const not_null = (line) => line !== null

export function diff (actual, expected, colorise = false) {
  const patch = createPatch('string', actual, expected)
  const lines = patch.split('\n').slice(4).map((line) => rework(line, colorise)).filter(not_null)
  return lines.join('\n') + '\n'
}

export function diff_changes_only (actual, expected, colorise = false) {
  const patch = createPatch('string', actual, expected)
  const lines = patch.split('\n').slice(4).map((line) => rework(line, colorise)).filter(not_null)
  return lines.filter(line => line[0] !== '@').join('\n') + '\n'
}
