## 2.0.0

### Changed (breaking)
- The Battleship API was rewritten to match Project 3. A board is now a single 10x10 array of `{ ship, shot }` cells that holds a player's fleet and the shots fired at it. The earlier 1.2.x Battleship functions (`createGame`, `placeShip(game, ...)`, `fire`, `getPlayerView`, and others) were removed.

### Added
- `createRandomBoard(random)`, `isValidShot(board, x, y)`, `updateBoard(board, x, y)`, `isGameComplete(board)`.
- Helpers: `createEmptyBoard`, `isInBounds`, `placeShip`, `canPlaceShip`, `shipCells`, `hasShip`, `isShipSunk`, `getSunkShips`, `hideShips`.

### Unchanged
- 2048 functions and how you import them.

## 1.2.0

### Added
- Battleship game logic, exported under the `battleship` namespace: `import { battleship } from '@ethanhua/arcade-core'`.
- Game functions: `createGame`, `placeShip`, `randomPlacement`, `confirmReady`, `fire`, `getPlayerView`.
- Board helpers: `newBoard`, `generateShip`, `canPlace`, `rotate`, `hasPlaced`, `removeShip`, `allPlaced`, `hasWon`, `isSunk`, `newShips`, `newCoords`, `shuffle`.

### Changed
- 2048 source moved to `src/2048/`. The 2048 API and how you import it are unchanged.
- Published files now include the whole `src/` folder.

## 1.1.0

### Added
- Tile-based API for animation: `moveTiles`, `scoreTiles`, `spawnTile`, `tilesToBoard`.
  Each tile keeps a stable `id` so a UI can animate it moving across the board.
- `areSameBoard(board1, board2)` and `hasWon(board)`, moved from the app because they are game rules.

### Changed
- New tiles are now 2 with 90% probability and 4 with 10%, matching the original game.