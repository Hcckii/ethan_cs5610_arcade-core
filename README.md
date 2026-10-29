## 1.1.0

### Added
- Tile-based API for animation: `moveTiles`, `scoreTiles`, `spawnTile`, `tilesToBoard`.
  Each tile keeps a stable `id` so a UI can animate it moving across the board.
- `areSameBoard(board1, board2)` and `hasWon(board)`, moved from the app because they are game rules.

### Changed
- New tiles are now 2 with 90% probability and 4 with 10%, matching the original game.

# arcade-core

Pure game logic for 2048. Runs in plain Node.js or any browser.

## Installation

```bash
npm install @ethanhua/arcade-core
```

## Usage

```javascript
import { move, spawn, hasMoves, score } from '@ethanhua/arcade-core';

const board = [
  [2, 2, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0]
];

const next = move(board, 'left');
console.log(next[0]); // [4, 0, 0, 0]
```

## Board format

A board is a 4×4 array of arrays of numbers. `0` means an empty cell; any other number is a tile value.

## API

### `move(board, direction)`

Slides all tiles in the given direction and merges equal neighbours once each.
- `board`: a 4×4 array of numbers
- `direction`: `'left'`, `'right'`, `'up'`, or `'down'`
- Returns: a new board merged to given direction. The original board is not modified.
- Throws an error if `direction` is not one of the four values.

### `spawn(board, rng)`

Randomly spawn a 2 or 4 on any empty spot of the board.
- `board`: a 4×4 array of numbers
- `rng` (optional): a function that returns a number between 0 and 1. Defaults to `Math.random`. Pass your own to get predictable results (e.g. for testing).
- Returns: a new board with new spawned number. The original board is not modified.
- Throws an error if there's no empty spot available.

### `hasMoves(board)`

A function that checks whether any move can still be made.
- `board`: a 4×4 array of numbers
- Returns: true if a move can be made from any valid directions or false otherwise.

### `hasWon(board)`

A function that checks if there's a number in the board equals or greater than 2048
- `board`: a 4×4 array of numbers
- Returns: true if there exists a number equals or greater than 2048, false otherwise.

### `score(board, direction)`

A function that calculates the points earned from the given board merged to given direction
- `board`: a 4×4 array of numbers before move to any direction
- `direction`: `'left'`, `'right'`, `'up'`, or `'down'`
- Returns: an integer indicating the score earned out of the given direction, the score is calculated from adding the merged numbers.
- Throws an error if `direction` is not one of the four values.
example:
```
        board                       
    [2, 2, 0, 0]         
    [0, 0, 0, 0]          
    [0, 0, 0, 0]          
    [0, 0, 0, 0]   
       
    direction:'left'
    [4, 0, 0, 0]
    [0, 0, 0, 0]            
    [0, 0, 0, 0]
    [0, 0, 0, 0]

score earned: 4 (merged 2 and 2)
```

### `areSameBoard(board1, board2)`

A function that checks whether the two given boards are the same.
- `board1, board2`: a 4×4 array of numbers before move to any direction.
- Returns: true if both board1 and board2 are the same, false otherwise.

### `moveTiles(tiles, direction)`

Slides all tiles in the given direction and merges equal neighbours once each.
- `tiles`: an array of tile objects
- `direction`: `'left'`, `'right'`, `'up'`, or `'down'`
- Returns: a new array of tiles merged to given direction. The original array is not modified.
- Throws an error if `direction` is not one of the four values.

### `spawnTile(tiles, id, rng)`

Randomly spawn a 2 or 4 on any empty spot of the board.
- `tiles`: an array of tile objects.
- `id`: an unique id pass in for the new spawned tile to keep track of it's location.
- `rng` (optional): a function that returns a number between 0 and 1. Defaults to `Math.random`. Pass your own to get predictable results (e.g. for testing).
- Returns: a new array with new spawned tile object. The original array is not modified.
- Throws an error if there's no empty spot available.

### `scoreTiles(tiles, direction)`

A function that calculates the points earned from the given board merged to given direction
- `tiles`: an array of tile objects
- `direction`: `'left'`, `'right'`, `'up'`, or `'down'`
- Returns: an integer indicating the score earned out of the given direction, the score is calculated from adding the merged numbers.
- Throws an error if `direction` is not one of the four values.

### `tilesToBoard(tiles)`

A function that converts tile objects into a 4x4 array of numbers.
- `tiles`: an array of tile objects.
- Returns: a 4x4 array of numbers converted from tile objects.

## Design notes

- `score` takes a direction because a board alone doesn't record which tiles were just merged, so the points can't be calculated from the board by itself.
- New tiles are 2 or 4 with a 90/10 chance.
- No function modifies the board passed in; each returns a new board. `spawn` is random by default, but becomes predictable when you pass a fixed `rng`.
- Added tiles functions distinct from board functions for transaction animation later be made in Svelte project.

