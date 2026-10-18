# arcade-core

Pure game logic for 2048. runs in plain Node.js or any browser.

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

Using a 4x4 matrix for the game board, start with 2 or 4 and filled with 0 (empty) for the rest of the spots.

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
- `rng`:a function Math.random as default
- Returns: a new board with new spawned number. The original board is not modified.
- Throws an error if there's no empty spot available.

### `hasMoves(board)`

A function that checks if there's a valid move can be made.
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

- I added direction into score is because we couldn't calculate score directly from a single board without making any moves.
- the percentage of spawning 2 or 4 on a random spot is 50/50.
- all the function are pure, meaning it will return a copy instead of modify the original board.