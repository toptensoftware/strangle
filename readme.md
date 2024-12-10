# strangle

Source code line mapping utility

## Installation

```
npm install --save toptensoftware/strangle
```

## Usage

Call `strangle`, passing the string and an optional
starting position:

```js
import { strangle } from "@toptensoftware/strangle"

let s = strangle(text: string, pos?: integer);
```

The returned object holds the passed string and manages a current position.

Use the following methods to work with the string:

* **save(): object** Returns an object capturing the internal state

* **restore(state: object): void** Restores a previously saved state

* **find(value: string | RegExp): Match | undefined** Finds the next occurance of a string or regular 
  expression, moving the current position to the match.  Returns the RegExp match object 
  or `undefined`.  If passed a regular expression it must have the `g` flag.

* **match(value: string | RegExp): Match | undefined** Checks if the text at the current position matches
  the passed string or regular expression, returning the match or `undefined`.  If
  passed a regular expression it must have the `y` flag

* **read(value: string | RegExp): Match | undefined** Same a `match` except it moves the position to 
  after the match.

* **readChar(): string | undefined** Reads a single character, advancing the current position by 1 place.  
  Returns `undefined` if at end of string

* **readWhitespace(): string | undefined** Reads any whitespace at the current position, moving over it
  and returning the whitespace, or `undefined` if none.

* **readIdentifier(): string | undefined** Reads an identifier, returning it or `undefined`.

* **readString(): string | undefined** Reads a single or double quoted string with simple escape patterns
  decoded (Handles `\\`, `\'`, `\"`, `\t`, `\r`, `\n` and `\0`).

* **readNested(pairs: string): string | undefined** Reads a nested expression.  Pairs should be the nesting 
  characters to be matched, default is `(){}[]""''`.  When including string delimiters
  the strings are parsed using `readString()` instead of simple pair matching.

* **readToEndOfLine(): string** Reads everything up to the end of the current line

* **readLineEnd(): string | undefined** Reads a line end character sequence at the current position.  

* **readToNextLine(): string** Reads everything up to the start of the next line (including line end)

* **readInteger(): number: undefined** Reads an integer value

* **readFloat(): number : undefined** Reads a floating point value

* **readBoolean(): boolean | undefined** Reads boolean literal value (`true` or `false`)

* **moveToStartOfLine(): void** Moves the current position to the start of the current line

* **moveToEndOfLine(): void** Moves the current position to the end of the current line

* **moveToNextLine(): void** Moves the current position to the start of the next line

* **moveToStartOfLineWS(): void** Moves the current position to the start of the current line, but only
  by skipping white space

* **moveToEndOfLineWS(): void** Moves the current position to the end of the current line, but only
  by skipping white space

* **moveToNextLineWS(): void** Moves the current position to the start of the next line, but only
  by skipping white space

* **substring(start: number, end: number): string** Extracts a sub-string

* **token: any** Returns the same value as the last `read***` function returned

* **tail: string** Returns everything from the current position to the end of the string

* **head: string** Returns everything from the start of the string to the current position

* **current: string** Returns the character at the current position

* **pos: number** Returns the current position as an index from the start of the string (read-write)

* **bof: boolean** Returns true if the current position is the start of the string

* **eof: boolean** Returns true if the current position is the end of the string

* **bol: boolean** Returns true if the current position is at the start of a line

* **eol: boolean** Returns true if the current position is at the end of a line



## Other Functions

Some of the functionality is also available without creating a `strangle` instance:

* **escapeRegExp(str: string)** - escapes a string to 
make it safe for use in a regular expression

* **find_bol(str: string, from: number): number** Find the beginning of the line

* **find_eol(str: string, from: number): number** Find the end of the line

* **find_bol_ws(str: string, from: number): number** Find the beginning of the line, only skipping whitespace

* **find_eol_ws(str: string, from: number): number** Find the end of the line, only skipping whitespace

* **skip_eol(str: string, from: number): number** Skip over line end character(s)

* **find_next_line_ws(str: string, from: number): number** Find the start of the next line
