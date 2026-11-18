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

A two-player Battleship game. All Battleship functions are exported under the `battleship` namespace, so names like `hasWon` don't conflict with the 2048 functions.

## Usage

```javascript
import { battleship } from '@ethanhua/arcade-core';

let game = battleship.createGame();

// Each player places all 5 ships (or uses randomPlacement)
const res = battleship.placeShip(game, 'p1', {
  row: 0,
  col: 0,
  type: 'carrier',
  orientation: 'hor'
});
game = res.game;

// ...place the other ships for both players, then:
game = battleship.confirmReady(game, 'p1').game;
game = battleship.confirmReady(game, 'p2').game;

// Players take turns firing
const shot = battleship.fire(game, 'p1', [3, 5]);
if (shot.error) {
  console.log(shot.error);
} else {
  game = shot.game;
  console.log(shot.hit, shot.sunk);
}

// Send only what one player is allowed to see
const view = battleship.getPlayerView(game, 'p1');
```

## Game flow

```
createGame()
    │
    ▼
phase: "placement" ── placeShip / randomPlacement (each player) ──┐
    │                                                             │
    │  confirmReady (both players)                                │
    ▼                                                             │
phase: "ready" ── fire (players take turns) ──────────────────────┘
    │
    │  all enemy ships sunk
    ▼
phase: "finished"  (winner is set)
```

## Formats

### Boards

Every board is a 10×10 array of arrays of numbers, indexed as `board[row][col]`. Row 0 is the top, col 0 is the left.

- **Ships board**: `0` is empty water, `1`–`5` is the id of the ship in that cell.
- **Fire board**: `0` means not fired yet, `1` means fired.

### Ships

| Name | Size | Id |
|---|---|---|
| `carrier` | 5 | 1 |
| `battleship` | 4 | 2 |
| `cruiser` | 3 | 3 |
| `submarine` | 3 | 4 |
| `destroyer` | 2 | 5 |

A ship is described by its starting cell, type, and orientation:

```javascript
{ row: 2, col: 3, type: 'cruiser', orientation: 'hor' }
// occupies [2, 3], [2, 4], [2, 5]
```

- `orientation`: `'hor'` extends to the right (col increases), `'ver'` extends downward (row increases).

### Coordinates

A coordinate is `[row, col]`, both integers from 0 to 9.

### Game state

```javascript
{
  phase: 'placement',   // 'placement' | 'ready' | 'finished'
  turn: 'p1',           // whose turn it is: 'p1' | 'p2'
  winner: null,         // null until the game is finished
  players: {
    p1: { ships, fire, ready },   // fire: p1's shots on p2's board
    p2: { ships, fire, ready }
  }
}
```

The game state is a plain object, so it can be stored in a database or sent as JSON directly.

## Game API

All game functions return a new game and never modify the one passed in. On failure they return `{ error: string }` instead.

### `createGame()`

Creates a new game.
- Returns: a game state in the `'placement'` phase with empty boards.

### `placeShip(game, playerID, ship)`

Places a ship on the player's board, or moves it if it's already placed.
- `game`: the current game state
- `playerID`: `'p1'` or `'p2'`
- `ship`: a ship object
- Returns: `{ game, placed }`. `placed` is `false` if the position was invalid (out of bounds or overlapping another ship). In that case the ship is removed from the board, so the UI can return it to the ship tray.
- Errors: invalid player, not in the placement phase, invalid ship type, or the player is already ready.

### `randomPlacement(game, playerID)`

Clears the player's board and places all 5 ships randomly.
- `game`: the current game state
- `playerID`: `'p1'` or `'p2'`
- Returns: `{ game }`
- Errors: invalid player, not in the placement phase, or the player is already ready.

### `confirmReady(game, playerID)`

Marks a player as ready. Ships can't be moved after this. When both players are ready, the phase changes to `'ready'`.
- `game`: the current game state
- `playerID`: `'p1'` or `'p2'`
- Returns: `{ game }`
- Errors: invalid player, not in the placement phase, already ready, or not all ships are placed.

### `fire(game, playerID, coord)`

Fires at the enemy's board. The turn passes to the other player unless this shot wins the game.
- `game`: the current game state
- `playerID`: `'p1'` or `'p2'`
- `coord`: `[row, col]`
- Returns: `{ game, hit, shipID, sunk }`
  - `hit`: whether a ship was hit
  - `shipID`: the id of the ship that was hit, or `0` on a miss
  - `sunk`: whether this shot sank that ship
- Errors: invalid player, game not started or already finished, not this player's turn, or the coordinate is invalid or already fired at.

### `getPlayerView(game, playerID)`

Returns only what one player is allowed to see. Enemy ship positions are never included. Use this for anything sent to a client.
- `game`: the current game state
- `playerID`: `'p1'` or `'p2'`
- Returns:

| Field | Description |
|---|---|
| `playerID`, `phase`, `turn`, `winner` | Copied from the game state |
| `ready`, `enemyReady` | Ready status of both players |
| `myShips` | This player's ships board |
| `unplaced` | Names of ships not yet on the board |
| `enemyShots` | The enemy's fire board (where they fired on this player) |
| `myShots` | This player's shots: `UNKNOWN` (0), `MISS` (1), or `HIT` (2) |
| `enemySunk` | Names of enemy ships this player has sunk |

## Helper API

These work on a single board and are used by the game functions. They're also useful in a UI, for example to preview whether a dragged ship can be dropped.

| Function | Description |
|---|---|
| `newBoard()` | A new 10×10 board filled with `0` |
| `generateShip(ship, board)` | A new board with the ship placed, or `null` if it can't be placed |
| `canPlace(coord, board)` | Whether a single cell is inside the board and empty |
| `rotate(ship)` | A new ship object with the other orientation |
| `hasPlaced(ship, board)` | Whether this type of ship is on the board |
| `removeShip(ship, board)` | A new board with this type of ship removed |
| `allPlaced(board)` | Whether all 5 ships are on the board |
| `hasWon(shipsBoard, fireBoard)` | Whether every ship cell has been fired at |
| `isSunk(shipsBoard, fireBoard, shipID)` | Whether every cell of that ship has been fired at |
| `newShips(board)` | Randomly places all ships. Returns `{ board, ships }` |
| `newCoords()` | All 100 coordinates |
| `shuffle(arr)` | A new array in random order (Fisher–Yates) |

## Constants

| Name | Value |
|---|---|
| `BOARD_SIZE` | `10` |
| `size` | Ship name → size, e.g. `size.carrier` is `5` |
| `allShips` | Ship names in id order |
| `type` | Ship name → id, e.g. `type.carrier` is `1` |
| `UNKNOWN`, `MISS`, `HIT` | `0`, `1`, `2`, the cell values in `myShots` |

## Design notes

- The game is meant to be run on a server. The server holds the full game state and calls these functions; clients only receive `getPlayerView` and send what they want to do (a ship to place, a cell to fire at). A client never decides whether a shot hit.
- Hits, sunk ships, and the winner are all calculated from the boards instead of being stored separately, so the state can't disagree with itself.
- Ship ids are unique even for ships of the same size (cruiser and submarine), which is what makes it possible to tell which ship was hit and sunk from the board alone.
- Display labels like A–J and 1–10 are not part of the board. The UI converts `[row, col]` into labels when drawing.