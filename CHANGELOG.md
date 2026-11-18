## 1.2.0

### Added
- Battleship game logic, exported under the `battleship` namespace: `import { battleship } from '@ethanhua/arcade-core'`.
- Game functions: `createGame`, `placeShip`, `randomPlacement`, `confirmReady`, `fire`, `getPlayerView`.
- Board helpers: `newBoard`, `generateShip`, `canPlace`, `rotate`, `hasPlaced`, `removeShip`, `allPlaced`, `hasWon`, `isSunk`, `randomShips`, `newCoords`, `shuffle`.

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