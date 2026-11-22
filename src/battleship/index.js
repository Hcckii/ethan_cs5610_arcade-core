export const BOARD_SIZE = 10;
export const SHIPS = { carrier: 5, battleship: 4, cruiser: 3, submarine: 3, destroyer: 2 };
export const SHIP_NAMES = Object.keys(SHIPS);

const MAX_ATTEMPTS_PER_SHIP = 1000;

//==================== Board basics ====================

export function createEmptyBoard() {
    return Array.from({ length: BOARD_SIZE }, () =>
        Array.from({ length: BOARD_SIZE }, () => ({ ship: null, shot: null }))
    );
}

export function isInBounds(x, y) {
    return Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE;
}

//==================== Ship placement ====================

function isShipShape(ship) {
    return (
        typeof ship === "object" &&
        ship !== null &&
        SHIP_NAMES.includes(ship.name) &&
        (ship.direction === "horizontal" || ship.direction === "vertical") &&
        Number.isInteger(ship.x) &&
        Number.isInteger(ship.y)
    );
}

export function shipCells(ship) {
    const dx = ship.direction === "horizontal" ? 1 : 0;
    const dy = ship.direction === "vertical" ? 1 : 0;
    return Array.from({ length: SHIPS[ship.name] }, (_, i) => [ship.x + dx * i, ship.y + dy * i]);
}

export function hasShip(board, name) {
    return board.some((row) => row.some((cell) => cell.ship === name));
}

export function canPlaceShip(board, ship) {
    if (!isShipShape(ship) || hasShip(board, ship.name)) {
        return false;
    }
    return shipCells(ship).every(([x, y]) => isInBounds(x, y) && board[y][x].ship === null);
}

export function placeShip(board, ship) {
    if (!canPlaceShip(board, ship)) {
        return null;
    }
    const res = board.map((row) => [...row]);
    for (const [x, y] of shipCells(ship)) {
        res[y][x] = { ...res[y][x], ship: ship.name };
    }
    return res;
}

export function createRandomBoard(random = Math.random) {
    let board = createEmptyBoard();
    for (const name of SHIP_NAMES) {
        let placed = null;
        for (let attempt = 0; placed === null && attempt < MAX_ATTEMPTS_PER_SHIP; attempt++) {
            const ship = {
                name,
                x: Math.floor(random() * BOARD_SIZE),
                y: Math.floor(random() * BOARD_SIZE),
                direction: random() < 0.5 ? "horizontal" : "vertical",
            };
            placed = placeShip(board, ship);
        }
        if (placed === null) {
            throw new Error(`Could not place the ${name} with the given random function`);
        }
        board = placed;
    }
    return board;
}

//==================== Shots ====================

export function isValidShot(board, x, y) {
    return isInBounds(x, y) && board[y][x].shot === null;
}

export function updateBoard(board, x, y) {
    if (!isValidShot(board, x, y)) {
        throw new Error(`Invalid shot at (${x}, ${y})`);
    }
    const cell = board[y][x];
    const res = board.map((row, rowIndex) => (rowIndex === y ? [...row] : row));
    res[y][x] = { ...cell, shot: cell.ship !== null ? "hit" : "miss" };
    return res;
}

//==================== Results ====================

export function isShipSunk(board, name) {
    if (!hasShip(board, name)) {
        return false;
    }
    return board.every((row) => row.every((cell) => cell.ship !== name || cell.shot === "hit"));
}


export function getSunkShips(board) {
    return SHIP_NAMES.filter((name) => isShipSunk(board, name));
}

export function isGameComplete(board) {
    return board.every((row) => row.every((cell) => cell.ship === null || cell.shot === "hit"));
}

export function hideShips(board) {
    const sunk = getSunkShips(board);
    return board.map((row) =>
        row.map((cell) => ({
            ship: cell.ship !== null && sunk.includes(cell.ship) ? cell.ship : null,
            shot: cell.shot,
        }))
    );
}