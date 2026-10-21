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

### `score(board, direction)`

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

## Design notes

- `score` takes a direction because a board alone doesn't record which tiles were just merged, so the points can't be calculated from the board by itself.
- New tiles are 2 or 4 with a 50/50 chance.
- No function modifies the board passed in; each returns a new board. `spawn` is random by default, but becomes predictable when you pass a fixed `rng`.