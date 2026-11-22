# arcade-core

Pure game logic for 2048 and Battleship. Runs in plain Node.js or any browser.

## Installation

```bash
npm install @ethanhua/arcade-core
```

## Contents

- [2048](#2048)
- [Battleship](#battleship)

---

# 2048

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

---

# Battleship

Pure Battleship logic, exported under the `battleship` namespace so names don't clash with the 2048 functions.

```javascript
import { battleship } from '@ethanhua/arcade-core';

let board = battleship.createRandomBoard();

if (battleship.isValidShot(board, 3, 5)) {
  board = battleship.updateBoard(board, 3, 5);
}

console.log(board[5][3].shot); // "hit" or "miss"
console.log(battleship.isGameComplete(board)); // false
```

## Board format

A board is a 10×10 array indexed as `board[y][x]`: `y` is the row (0 at the top) and `x` is the column (0 on the left).

Each cell is `{ ship, shot }`:
- `ship`: the ship's name (`"carrier"`, `"battleship"`, `"cruiser"`, `"submarine"`, `"destroyer"`), or `null` for water
- `shot`: `null` if not fired at yet, otherwise `"hit"` or `"miss"`

A board holds one player's fleet together with every shot the opponent has fired at it.

## Ships

| Name | Size |
|---|---|
| `carrier` | 5 |
| `battleship` | 4 |
| `cruiser` | 3 |
| `submarine` | 3 |
| `destroyer` | 2 |

A ship being placed is described as `{ name, x, y, direction }`, where `(x, y)` is its first cell and `direction` is `"horizontal"` (extends right) or `"vertical"` (extends down).

## API

### `createRandomBoard(random = Math.random)`

Returns a new board with all five ships placed randomly, horizontally or vertically, with no overlaps and nothing off the board.
- `random` (optional): a function returning a number from 0 up to 1. Pass your own to get the same board every time (e.g. for testing).
- Throws an error if the given `random` function can never place every ship (for example `() => 0`), instead of looping forever.

### `isValidShot(board, x, y)`

- Returns: `true` if `(x, y)` is on the board and hasn't been fired at yet, otherwise `false`. Non-integer coordinates are not valid.

### `updateBoard(board, x, y)`

- Returns: a NEW board with the shot recorded as `"hit"` (a ship was there) or `"miss"`. The original board is not modified.
- Throws an error if the shot is not valid, so check `isValidShot` first.

### `isGameComplete(board)`

- Returns: `true` when no ships remain afloat, i.e. every ship cell has been hit.

### Other helpers

| Function | Description |
|---|---|
| `createEmptyBoard()` | A 10×10 board with no ships and no shots |
| `isInBounds(x, y)` | Whether `x` and `y` are integers from 0 to 9 |
| `placeShip(board, ship)` | A NEW board with the ship placed, or `null` if it overlaps, goes off the board, or is already placed |
| `canPlaceShip(board, ship)` | Whether `placeShip` would succeed |
| `shipCells(ship)` | The `[x, y]` cells a ship covers |
| `hasShip(board, name)` | Whether that ship is on the board |
| `isShipSunk(board, name)` | Whether every cell of that ship has been hit |
| `getSunkShips(board)` | Names of all sunk ships |
| `hideShips(board)` | What the opponent may see: every shot, but only ships that are already sunk |

### Constants

| Name | Value |
|---|---|
| `BOARD_SIZE` | `10` |
| `SHIPS` | Ship name → size |
| `SHIP_NAMES` | The five ship names |

## Design notes

- No function modifies a board passed in; each returns a new board. `updateBoard` only copies the row that changes and shares the other rows, which is safe because boards are never modified in place.
- `createRandomBoard` takes the random function as a parameter, just like `spawn` in 2048, so it can be tested with predictable results.
- `isValidShot` and `isGameComplete` are used by both the backend (to enforce the rules) and the frontend (to disable squares that were already fired at, and to show the end of the game).