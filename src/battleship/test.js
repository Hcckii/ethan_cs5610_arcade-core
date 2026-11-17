import {
    allShips,
    createGame,
    placeShip,
    confirmReady,
    fire,
    getPlayerView,
    randomShips,
    newBoard,
    newCoords,
    shuffle,
} from "./index.js";

function check(label, condition) {
    console.log(`${condition ? "PASS" : "FAIL"} - ${label}`);
}

//---------------- Placement ----------------

const empty = createGame();
check("cannot fire during placement", fire(empty, "p1", [0, 0]).error === "Players are not ready");
check("cannot ready before placing all ships", confirmReady(empty, "p1").error === "Place all ships first");
check("invalid player is rejected", placeShip(empty, "p3", { type: "carrier" }).error === "Invalid player");
check("invalid ship type is rejected", placeShip(empty, "p1", { type: "boat" }).error === "Invalid ship");

const carrier = { row: 0, col: 0, type: "carrier", orientation: "hor" };
const g1 = placeShip(empty, "p1", carrier).game;

const moved = placeShip(g1, "p1", { ...carrier, col: 1 });
check("moving a ship onto its own old cells works", moved.placed === true);
check("only one carrier after moving", moved.game.players.p1.ships.flat().filter((c) => c === 1).length === 5);

const dropped = placeShip(g1, "p1", { ...carrier, col: 8 });
check("invalid drop returns placed: false", dropped.placed === false);
check("invalid drop removes the ship", dropped.game.players.p1.ships.flat().every((c) => c === 0));

check("original game is not modified", g1.players.p1.ships[0][0] === 1);

//---------------- Ready ----------------

let game = createGame();
for (const id of ["p1", "p2"]) {
    const { ships } = randomShips(newBoard());
    for (const ship of ships) {
        game = placeShip(game, id, ship).game;
    }
}

game = confirmReady(game, "p1").game;
check("still placement after one player is ready", game.phase === "placement");
check("cannot move ships after ready", placeShip(game, "p1", carrier).error === "You are already ready");

game = confirmReady(game, "p2").game;
check("phase is ready after both players", game.phase === "ready");

//---------------- Fire ----------------

check("p2 cannot fire on p1's turn", fire(game, "p2", [0, 0]).error === "Not your turn");
check("out of bounds coord is rejected", fire(game, "p1", [10, 0]).error === "Invalid coord");
check("non-integer coord is rejected", fire(game, "p1", [1.5, 0]).error === "Invalid coord");

let t = fire(game, "p1", [0, 0]).game;
t = fire(t, "p2", [0, 0]).game;
check("cannot fire at the same cell twice", fire(t, "p1", [0, 0]).error === "Invalid coord");

//---------------- Full game ----------------

const orders = { p1: shuffle(newCoords()), p2: shuffle(newCoords()) };
const shots = { p1: 0, p2: 0 };

while (game.phase !== "finished") {
    const id = game.turn;
    const res = fire(game, id, orders[id].pop());
    if (res.error) {
        console.log("Unexpected error:", res.error);
        break;
    }
    game = res.game;
    shots[id]++;
    if (res.sunk) {
        console.log(`  ${id} sunk the enemy's ${allShips[res.shipID - 1]}`);
    }
}

check("game has a winner", game.winner !== null);
check("cannot fire after the game finished", fire(game, game.winner, [0, 0]).error === "The game has finished");

const view = getPlayerView(game, game.winner);
check("view does not contain the full players object", !("players" in view));
check("winner sees all 5 enemy ships sunk", view.enemySunk.length === 5);
check("view during placement reports no sunk ships", getPlayerView(createGame(), "p1").enemySunk.length === 0);

console.log(`Winner: ${game.winner}, shots: p1 = ${shots.p1}, p2 = ${shots.p2}`);