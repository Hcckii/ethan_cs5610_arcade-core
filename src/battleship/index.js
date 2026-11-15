//------------------ Initialize functioins --------------------------

function newBoard(){
    const n = 10;
    const board = Array.from({length:n}, ()=>Array(n).fill(0));
    return board;
}


export const size = {"carrier":5, "battleship":4, "cruiser":3, "submarine":3, "destroyer":2};
export const allShips = Object.keys(size);
export const type = Object.fromEntries(allShips.map((name, i)=>[name, i+1]));

function newCoords(n){
    const res = [];
    for(let i=0; i<n; i++){
        for(let j=0; j<n; j++){
            res.push([i, j]);
        }
    }
    return res;
}

//------------------ Ships functions -------------------

function shipCells(ship){
    if(ship.orientation!=="ver" && ship.orientation!=="hor"){
        return null;
    }
    const dr = ship.orientation === "ver" ? 1:0;
    const dc = ship.orientation === "hor" ? 1:0;
    const len = size[ship.type];
    const res = Array.from({length:len}, (_, i)=>[ship.row+(dr*i), ship.col+(dc*i)]);
    return res;
}
export function generateShip(ship, board){
    if(ship.orientation!=="ver" && ship.orientation!=="hor"){
        return null;
    }
    const cells = shipCells(ship);
    if(!cells.every((cell)=>canPlace(cell, board))){
        return null;
    }
    const res = board.map((row)=>[...row]);
    const shipType = type[ship.type];
    for(const [x, y] of cells){
        res[x][y] = shipType;
    }
    return res;
}
function newShips(board){
    let resBoard = board.map((row)=>[...row]);
    const ships = [];
    while(ships.length<Object.keys(type).length){
        const [x, y] = randCoord();
        const orientation = Math.random() < 0.5? "ver": "hor";
        const ship = {"row":x, "col":y, "type":allShips[ships.length], "orientation":orientation};
        const b = generateShip(ship, resBoard);
        if(b!==null){
            resBoard = b;
            ships.push(ship)
        }
    }
    return {board:resBoard, ships};
}
//------------------ Check wether we can place a ship at the given coordinate -------------------
export function canPlace(coord, board){
    const n = board.length;
    const [x, y] = coord;

    if(x<0 || y<0 || x>n-1 || y>n-1 || board[x][y]!==0){
        return false;
    }
    return true;
}
//-------------------------- Rotate the ship object ---------------------------
function rotate(ship){
    const res = {...ship, "orientation":ship.orientation==="ver"?"hor":"ver"};
    return res;
}

//------------------------- Fire at the given coordinate on the board, return the fire records and hit result ------------------
function fireAt(coord, fireBoard, shipsBoard){
    const [x, y] = coord;
    const n = shipsBoard.length-1;
    if(x<0 || y<0 || x>n || y>n || fireBoard[x][y]!==0){
        return null;
    }
    let id = 0;
    let hasHit = false;
    const resBoard = fireBoard.map((row)=>[...row]);
    resBoard[x][y] = 1;
    if(shipsBoard[x][y]>0){
        hasHit = true;
        id = shipsBoard[x][y];
    }
    return {board:resBoard, hit:hasHit, shipID:id};
}

function hasWon(shipsBoard, fireBoard){
    return shipsBoard.every((row, x)=>row.every((cell, y)=>cell===0 || fireBoard[x][y]>0));
}

function isSunk(shipsBoard, fireBoard, shipID){
    return shipsBoard.every((row, x)=>row.every((cell, y)=>cell!==shipID || fireBoard[x][y]>0));
}

//-------------------- Generate random functions ------------------------
function shuffle(arr){
    const res = [...arr];
    for(let i=res.length-1; i>0; i--){
        const j = Math.floor(Math.random()*(i+1));
        [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
}

function randCoord(){
    const randX = Math.floor(Math.random()*10);
    const randY = Math.floor(Math.random()*10);
    return [randX, randY];
}

//-------------- Testing function -----------------

function autoHit(shipsBoard, fireBoard){
    let fireRes = fireBoard.map((row)=>[...row]);
    const coord = newCoords(10);
    const order = shuffle(coord);
    for(const o of order){
        if(hasWon(shipsBoard, fireRes)){
            break;
        }
        const [x, y] = o;
        const hitAttempt = fireAt([x, y], fireRes, shipsBoard);
        if(hitAttempt!==null){
            fireRes = hitAttempt.board;
            if(hitAttempt.hit){
                console.log(`Hit enemy ${allShips[hitAttempt.shipID-1]} at [${x},${y}]`)
                if(isSunk(shipsBoard, fireRes, hitAttempt.shipID)){
                    console.table(shipsBoard);
                    console.table(fireRes);
                    console.log(`Enemy ${allShips[hitAttempt.shipID-1]} has been sunk`);
                }
            }
        }
    }
}


function playerView(fireBoard){
    console.table(fireBoard);
}

function deepCopyBoard(board){
    return board.map((row)=>[...row]);
}

function main(){
    let count1 = 0;
    let count2 = 0;
    const b1 = newBoard();
    const b2 = newBoard();
    const fire1 = newBoard();
    const fire2 = newBoard();
    const p1 = newShips(b1);
    const p2 = newShips(b2);
    let start1 = true;
    let start2 = false;
    let res1 = deepCopyBoard(fire1);
    let res2 = deepCopyBoard(fire2);
    const o1 = shuffle(newCoords(10));
    const o2 = shuffle(newCoords(10));
    let remain1 = p1.ships;
    let remain2 = p2.ships;
    while(!hasWon(p1.board, res2)&&!hasWon(p2.board, res1)){
        if(start1){
            const[x, y] = o1.pop();
            const hitAttempt = fireAt([x, y], res1, p2.board);
            res1 = hitAttempt.board;
            if(hitAttempt.hit){
                console.log(`P1 fire at [${x},${y}], P1 hit the target!`)
                if(isSunk(p2.board, res1, hitAttempt.shipID)){
                    console.log(`P1 has sunk p2's ${allShips[hitAttempt.shipID-1]}!`);
                    remain2 = remain2.filter((ship)=>ship.type!=`${allShips[hitAttempt.shipID-1]}`);
                }
            }
            start1 = false;
            start2 = true;
            count1++;
        }
        else if(start2){
            const[x, y] = o2.pop();
            const hitAttempt = fireAt([x, y], res2, p1.board);
            res2 = hitAttempt.board;
            if(hitAttempt.hit){
                console.log(`P2 fire at [${x},${y}], P2 hit the target!`)
                if(isSunk(p1.board, res2, hitAttempt.shipID)){
                    console.log(`P2 has sunk p1's ${allShips[hitAttempt.shipID-1]}!`);
                    remain1 = remain1.filter((ship)=>ship.type!==`${allShips[hitAttempt.shipID-1]}`);
                }
            }
            start2 = false;
            start1 = true;
            count2++;
        }
    }

    remain1.length===0?console.log("P2 Won!"):console.log("P1 Won!");
    console.log("----------------- RESULT FOR P1 ------------------")
    console.log(`Tries:${count1}`);
    console.log("P2 SHIPS:")
    console.table(p2.board);
    console.log("P1 Fires:")
    console.table(res1);
    console.log("----------------- RESULT FOR P2 ------------------")
    console.log(`Tries:${count2}`);
    console.log("P1 SHIPS:")
    console.table(p1.board);
    console.log("P2 Fires:")
    console.table(res2);



}
main();





// const board = newBoard();
// const fireBoard = newBoard();
// const b1 = newShips(board);
// autoHit(b1.board, board);