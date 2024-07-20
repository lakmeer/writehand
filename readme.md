# Writehand

An agnostic, practical AI workflow for coding.

## Notes

- Program is invoked on the project root
- Config via `writehand.yml`
- Works with local models
- Comments in source code can contain various pragmas which invoke specific behaviours in the AI


## Command Pragmes

### !

Perform any task. Results will occur in whichever files are relevant, or
create new files. The comment will be removed.

    // >> !write some tests to cover this function

    // >> !suggest a function that computes the area of a circle

    function areaOfCircle (radius) {
      return Math.PI * radius * radius;
    }

## Query Pragmas

### ?

Query pragmas will only result in comments being added to source files.
Pragma line will be replaced with the answer using `// <<` format..

    // >> ? What is the purpose of this code?

    // << This code is used to authenticate the user using
    // << a middleware pattern


## Context Pragmas

### +context
Any file with a command pragma will automatically include other files with
matching `+context` as reference in the prompt.

    // >> +context Authenticaion, Login

### +always
This file will always be included as context.

### +never
This file will never be included as context.
