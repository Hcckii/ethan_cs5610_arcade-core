//================== Constants ==================

export const BOARD_SIZE = 10;
export const size = { carrier: 5, battleship: 4, cruiser: 3, submarine: 3, destroyer: 2 };
export const allShips = Object.keys(size);
export const type = Object.fromEntries(allShips.map((name, i) => [name, i + 1]));
const PLAYERS = ["p1", "p2"];

// Cell values used in getPlayerView's myShots board
export const UNKNOWN = 0;
export const MISS = 1;
export const HIT = 2;

//================== Board helpers ==================

export function newBoard(n = BOARD_SIZE) {
    return Array.from({ length: n }, () => Array(n).fill(0));
}

// coord must be [x, y] with integers inside the board
function inBounds(coord, n) {
    if (!Array.isArray(coord) || coord.length !== 2) {
        return false;
    }
    const [x, y] = coord;
    return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < n && y < n;
}

// Check whether a single cell is inside the board and empty
export function canPlace(coord, board) {
    if (!inBounds(coord, board.length)) {
        return false;
    }
    const [x, y] = coord;
    return board[x][y] === 0;
}

//================== Ship functions ==================

function isValidShip(ship) {
    return (
        typeof ship === "object" &&
        ship !== null &&
        allShips.includes(ship.type) &&
        (ship.orientation === "ver" || ship.orientation === "hor") &&
        Number.isInteger(ship.row) &&
        Number.isInteger(ship.col)
    );
}

// All cells a ship occupies (assumes the ship is valid)
function shipCells(ship) {
    const dr = ship.orientation === "ver" ? 1 : 0;
    const dc = ship.orientation === "hor" ? 1 : 0;
    const len = size[ship.type];
    return Array.from({ length: len }, (_, i) => [ship.row + dr * i, ship.col + dc * i]);
}

// Return a new board with the ship placed, or null if it can't be placed
export function generateShip(ship, board) {
    if (!isValidShip(ship)) {
        return null;
    }
    const cells = shipCells(ship);
    if (!cells.every((cell) => canPlace(cell, board))) {
        return null;
    }
    const res = board.map((row) => [...row]);
    const shipID = type[ship.type];
    for (const [x, y] of cells) {
        res[x][y] = shipID;
    }
    return res;
}

export function rotate(ship) {
    return { ...ship, orientation: ship.orientation === "ver" ? "hor" : "ver" };
}

export function hasPlaced(ship, shipBoard) {
    const shipID = type[ship.type];
    return shipBoard.some((row) => row.includes(shipID));
}

export function removeShip(ship, shipBoard) {
    const shipID = type[ship.type];
    return shipBoard.map((row) => row.map((cell) => (cell === shipID ? 0 : cell)));
}

export function allPlaced(shipBoard) {
    return allShips.every((name) => hasPlaced({ type: name }, shipBoard));
}

//================== Fire functions ==================

// Return { board, hit, shipID }, or null if the coord is invalid or already fired
function fireAt(coord, fireBoard, shipsBoard) {
    if (!inBounds(coord, shipsBoard.length)) {
        return null;
    }
    const [x, y] = coord;
    if (fireBoard[x][y] !== 0) {
        return null;
    }
    const resBoard = fireBoard.map((row) => [...row]);
    resBoard[x][y] = 1;
    const shipID = shipsBoard[x][y];
    return { board: resBoard, hit: shipID > 0, shipID };
}

export function hasWon(shipsBoard, fireBoard) {
    return shipsBoard.every((row, x) => row.every((cell, y) => cell === 0 || fireBoard[x][y] > 0));
}

export function isSunk(shipsBoard, fireBoard, shipID) {
    return shipsBoard.every((row, x) => row.every((cell, y) => cell !== shipID || fireBoard[x][y] > 0));
}

//================== Game state ==================

export function playerIsValid(playerID) {
    return PLAYERS.includes(playerID);
}

function otherPlayer(playerID) {
    return playerID === "p1" ? "p2" : "p1";
}

export function createGame() {
    return {
        phase: "placement", // "placement" -> "ready" -> "finished"
        turn: "p1",
        winner: null,
        players: {
            p1: { ships: newBoard(), fire: newBoard(), ready: false },
            p2: { ships: newBoard(), fire: newBoard(), ready: false },
        },
    };
}

// Place or move a ship. An invalid position removes the ship from the board.
export function placeShip(game, playerID, ship) {
    if (!playerIsValid(playerID)) {
        return { error: "Invalid player" };
    }
    if (game.phase !== "placement") {
        return { error: "Cannot place ship right now" };
    }
    if (typeof ship !== "object" || ship === null || !allShips.includes(ship.type)) {
        return { error: "Invalid ship" };
    }

    const me = game.players[playerID];
    if (me.ready) {
        return { error: "You are already ready" };
    }

    const cleared = removeShip(ship, me.ships);
    const placed = generateShip(ship, cleared);

    const newPlayers = {
        ...game.players,
        [playerID]: { ...me, ships: placed !== null ? placed : cleared },
    };

    return {
        game: { ...game, players: newPlayers },
        placed: placed !== null,
    };
}

export function confirmReady(game, playerID) {
    if (!playerIsValid(playerID)) {
        return { error: "Invalid player" };
    }
    if (game.phase !== "placement") {
        return { error: "Cannot get ready right now" };
    }

    const me = game.players[playerID];
    if (me.ready) {
        return { error: "You are already ready" };
    }
    if (!allPlaced(me.ships)) {
        return { error: "Place all ships first" };
    }

    const newPlayers = {
        ...game.players,
        [playerID]: { ...me, ready: true },
    };
    const bothReady = PLAYERS.every((id) => newPlayers[id].ready);

    return {
        game: {
            ...game,
            players: newPlayers,
            phase: bothReady ? "ready" : "placement",
        },
    };
}

export function fire(game, playerID, coord) {
    if (!playerIsValid(playerID)) {
        return { error: "Invalid player" };
    }
    if (game.phase === "finished") {
        return { error: "The game has finished" };
    }
    if (game.phase !== "ready") {
        return { error: "Players are not ready" };
    }
    if (game.turn !== playerID) {
        return { error: "Not your turn" };
    }

    const enemyID = otherPlayer(playerID);
    const me = game.players[playerID];
    const enemy = game.players[enemyID];

    const fireAttempt = fireAt(coord, me.fire, enemy.ships);
    if (fireAttempt === null) {
        return { error: "Invalid coord" };
    }

    const win = hasWon(enemy.ships, fireAttempt.board);
    const sunk = fireAttempt.hit && isSunk(enemy.ships, fireAttempt.board, fireAttempt.shipID);

    const newGame = {
        ...game,
        phase: win ? "finished" : game.phase,
        turn: win ? playerID : enemyID,
        winner: win ? playerID : null,
        players: {
            ...game.players,
            [playerID]: { ...me, fire: fireAttempt.board },
        },
    };

    return { game: newGame, hit: fireAttempt.hit, shipID: fireAttempt.shipID, sunk };
}

export function getPlayerView(game, playerID) {
    if (!playerIsValid(playerID)) {
        return { error: "Invalid player" };
    }
    const me = game.players[playerID];
    const enemy = game.players[otherPlayer(playerID)];
    const myShots = me.fire.map((row, x) =>
        row.map((cell, y) => (cell === 0 ? UNKNOWN : enemy.ships[x][y] > 0 ? HIT : MISS))
    );

    // hasPlaced is needed: an unplaced ship has no cells, so isSunk would be true for it
    const enemySunk = allShips.filter(
        (name) => hasPlaced({ type: name }, enemy.ships) && isSunk(enemy.ships, me.fire, type[name])
    );

    return {
        playerID,
        phase: game.phase,
        turn: game.turn,
        winner: game.winner,
        ready: me.ready,
        enemyReady: enemy.ready,
        myShips: me.ships,
        unplaced: allShips.filter((name) => !hasPlaced({ type: name }, me.ships)),
        enemyShots: enemy.fire,
        myShots,
        enemySunk,
    };
}

//================== Random helpers ==================

export function newCoords(n = BOARD_SIZE) {
    const res = [];
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            res.push([i, j]);
        }
    }
    return res;
}

// Fisher-Yates shuffle
export function shuffle(arr) {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
}

function randCoord() {
    return [Math.floor(Math.random() * BOARD_SIZE), Math.floor(Math.random() * BOARD_SIZE)];
}

// Randomly place all ships. Returns { board, ships }
export function randomShips(board) {
    let resBoard = board.map((row) => [...row]);
    const ships = [];
    while (ships.length < allShips.length) {
        const [x, y] = randCoord();
        const ship = {
            row: x,
            col: y,
            type: allShips[ships.length],
            orientation: Math.random() < 0.5 ? "ver" : "hor",
        };
        const next = generateShip(ship, resBoard);
        if (next !== null) {
            resBoard = next;
            ships.push(ship);
        }
    }
    return { board: resBoard, ships };
}