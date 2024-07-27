# Writehand

A toolchain-agnostic, practical AI workflow for coding.

## Notes

- Program is invoked on the project root
- Config via `writehand.yml`
- Works with local models when available
- Comments in source code can contain various pragmas which invoke specific behaviours in the AI
- Editor plugin binds a few hotkeys to the program
  - Invoke
  - Accept
  - Reject

### Todos and Ideas

- A 'suggest' mode that just reads the whole codebase and proposes fixes or refactors


## Command Pragmas

### !(task description)

Perform a task. Results will occur in whichever files are relevant, or newly
created files. The pragma comment will be removed.

    // >> !write some tests to cover this function

    // >> !suggest a function that computes the area of a circle

    function areaOfCircle (radius) {
      return Math.PI * radius * radius;
    }

## Query Pragmas

### ?(question)

Query pragmas will only result in comments being added to source files.
Pragma line will be replaced with the answer using `// <<` format..

    // >> ?What is the purpose of this code?

    // << This code is used to authenticate the user using
    // << a middleware pattern

## Pragma Modifiers

### --option (value)

Applied to an existing pragma (doesn't count as a pragma by itself). Overrides
a config option for the duration that the pragma is being executed. Any config
supported by `writehand.yml` can be overwritten this way.

    // >> !write some tests to cover this function --model gpt-3

    // >> !suggest a function that computes the area of a circle --temp 0.8


## Config Pragmas

### +context
Any file with a command pragma will automatically include other files with
matching `+context` as reference in the prompt, and help the model navigate
relevant parts of the codebase.

    // >> +context Authentication, Login
    // >> +context Database

### +always
This file will always be included as context.

### +never
This file will never be included as context.

### +include
When this file is being considered as context, fetches another specific file
either by relative path, or a url which will be downloaded and cached. Supports
globbing when local. Shorthand `@` represents the root of the project.

    // >> +include ./utils.js
    // >> +include https://raw.githubusercontent.com/.../utils.js
    // >> +include @/src/components/**/*.jsx

## Configuration Options

Config is placed at the project root in `writehand.yml`. When the program is
invoked, it will walk up the filesystem until it finds a config file, and then
consider that location to be the root of the project.

### Models

Supplies configuration for AI models. Different models can be applied to
different tasks.

```
Model "codex" {
    provider "OpenAI" {
        url "https://api.openai.com/v1/engines/davinci-codex/completions"
        key $OPENAI_API_KEY
    }
    temp 0.8
    max_tokens 1024
}

Model "claude" {
    provider "Anthropic" {
        url "https://api.anthropic.com/v1/complete"
        key $ANTHROPIC_API_KEY
        model_name "claude-3-5-sonnet-20240620"
    }
    system "You are an expert in web development with a specialty in Typescript and Svelte"
    temp 0.8
    max_tokens 1024
}


FileRules {
    respect_gitignore true  // default true - use the gitignore if it exists
    exclude_non_text true   // default true - guesses to ignore for images etc
    exclude_dotfiles true   // default true - ignore files starting with a dot
    exclude "node_modules" ".sveltekit"      // manual excludes
    include "package.json" "tsconfig.json"   // manual includes
}

```
