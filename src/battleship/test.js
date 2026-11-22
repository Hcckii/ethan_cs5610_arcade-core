import {
    BOARD_SIZE,
    SHIPS,
    SHIP_NAMES,
    createEmptyBoard,
    createRandomBoard,
    placeShip,
    shipCells,
    isValidShot,
    updateBoard,
    isShipSunk,
    getSunkShips,
    isGameComplete,
    hideShips,
} from "./index.js";

let failed = 0;
function check(label, condition) {
    if (!condition) {
        failed++;
    }
    console.log(`${condition ? "PASS" : "FAIL"} - ${label}`);
}

function seededRandom(seed) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function countCells(board, predicate) {
    return board.flat().filter(predicate).length;
}


function isStraightLine(cells) {
    const xs = cells.map(([x]) => x);
    const ys = cells.map(([, y]) => y);
    const sameRow = ys.every((y) => y === ys[0]);
    const sameCol = xs.every((x) => x === xs[0]);
    const along = sameRow ? xs : ys;
    const sorted = [...along].sort((a, b) => a - b);
    return (sameRow || sameCol) && sorted.every((v, i) => i === 0 || v === sorted[i - 1] + 1);
}

function cellsOf(board, name) {
    const res = [];
    board.forEach((row, y) => row.forEach((cell, x) => cell.ship === name && res.push([x, y])));
    return res;
}

//==================== createEmptyBoard ====================

const empty = createEmptyBoard();
check("empty board is 10x10", empty.length === BOARD_SIZE && empty.every((row) => row.length === BOARD_SIZE));
check("empty board has no ships and no shots", countCells(empty, (c) => c.ship === null && c.shot === null) === 100);

//==================== createRandomBoard ====================

for (let seed = 1; seed <= 50; seed++) {
    const board = createRandomBoard(seededRandom(seed));
    const ok =
        countCells(board, (c) => c.ship !== null) === 17 &&
        SHIP_NAMES.every((name) => {
            const cells = cellsOf(board, name);
            return cells.length === SHIPS[name] && isStraightLine(cells);
        });
    if (!ok) {
        check(`random board with seed ${seed} has all five ships in straight lines`, false);
    }
}
check("50 random boards all have five ships, 17 cells, in straight lines", true);

check(
    "the same seed always gives the same board",
    JSON.stringify(createRandomBoard(seededRandom(42))) === JSON.stringify(createRandomBoard(seededRandom(42)))
);
check("default random still works", countCells(createRandomBoard(), (c) => c.ship !== null) === 17);

let threw = false;
try {
    createRandomBoard(() => 0);
} catch {
    threw = true;
}
check("a random function that can't place every ship throws instead of looping forever", threw);

//==================== placeShip ====================

const carrier = { name: "carrier", x: 0, y: 0, direction: "horizontal" };
const withCarrier = placeShip(empty, carrier);
check("placeShip returns a new board", withCarrier !== null && withCarrier !== empty);
check("placeShip does not modify the original board", empty[0][0].ship === null);
check("carrier covers (0,0) to (4,0)", shipCells(carrier).every(([x, y]) => withCarrier[y][x].ship === "carrier"));
check("cannot place the same ship twice", placeShip(withCarrier, { ...carrier, y: 5 }) === null);
check(
    "cannot overlap another ship",
    placeShip(withCarrier, { name: "destroyer", x: 2, y: 0, direction: "vertical" }) === null
);
check("cannot extend off the board", placeShip(empty, { ...carrier, x: 8 }) === null);
check("unknown ship name is rejected", placeShip(empty, { ...carrier, name: "boat" }) === null);

//==================== isValidShot and updateBoard ====================

let board = createEmptyBoard();
board = placeShip(board, { name: "destroyer", x: 3, y: 3, direction: "vertical" }); // (3,3) and (3,4)

check("fresh square is a valid shot", isValidShot(board, 0, 0));
check("out of bounds is not a valid shot", !isValidShot(board, 10, 0) && !isValidShot(board, -1, 0));
check("non-integer is not a valid shot", !isValidShot(board, 1.5, 0) && !isValidShot(board, "3", 3));

const missed = updateBoard(board, 0, 0);
check("updateBoard records a miss on water", missed[0][0].shot === "miss");
check("updateBoard does not modify the original board", board[0][0].shot === null);
check("a fired square is no longer a valid shot", !isValidShot(missed, 0, 0));

let threwOnRepeat = false;
try {
    updateBoard(missed, 0, 0);
} catch {
    threwOnRepeat = true;
}
check("updateBoard throws on a repeat shot", threwOnRepeat);

const hit1 = updateBoard(missed, 3, 3);
check("updateBoard records a hit on a ship", hit1[3][3].shot === "hit");
check("destroyer is not sunk after one hit", !isShipSunk(hit1, "destroyer"));

const hit2 = updateBoard(hit1, 3, 4);
check("destroyer is sunk after both hits", isShipSunk(hit2, "destroyer"));
check("getSunkShips lists the destroyer", JSON.stringify(getSunkShips(hit2)) === JSON.stringify(["destroyer"]));
check("a ship that isn't on the board is not sunk", !isShipSunk(hit2, "carrier"));

//==================== isGameComplete ====================

check("game is not complete on a fresh random board", !isGameComplete(createRandomBoard(seededRandom(7))));
check("game is complete once every ship cell is hit", isGameComplete(hit2));

let full = createRandomBoard(seededRandom(9));
for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
        if (full[y][x].ship !== null) {
            check("game is not complete before the last hit", !isGameComplete(full));
            full = updateBoard(full, x, y);
        }
    }
}
check("game is complete after hitting all 17 ship cells", isGameComplete(full));

//==================== hideShips ====================

let partly = createEmptyBoard();
partly = placeShip(partly, { name: "destroyer", x: 0, y: 0, direction: "horizontal" });
partly = placeShip(partly, { name: "cruiser", x: 0, y: 2, direction: "horizontal" });
partly = updateBoard(partly, 0, 0);
partly = updateBoard(partly, 1, 0); 
partly = updateBoard(partly, 0, 2); 
partly = updateBoard(partly, 9, 9);

const hidden = hideShips(partly);
check("hidden board keeps every shot", hidden[0][0].shot === "hit" && hidden[2][0].shot === "hit" && hidden[9][9].shot === "miss");
check("hidden board shows the sunk destroyer", hidden[0][0].ship === "destroyer" && hidden[0][1].ship === "destroyer");
check("hidden board does not reveal the cruiser that isn't sunk", hidden.flat().every((c) => c.ship !== "cruiser"));
check("hideShips does not modify the original board", partly[2][1].ship === "cruiser");

console.log(failed === 0 ? "\nAll battleship tests passed" : `\n${failed} battleship test(s) failed`);
process.exitCode = failed > 0 ? 1 : 0;