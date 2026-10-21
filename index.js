//-----------------------Merging logics-------------------------
function removeZero(arr){
    return arr.filter(n=>n!==0);
}

function colToRow(arr2d, idx){ // convert a column of a 2d array into row for merge/padding, idx is the position of the column
    const n = arr2d.length;
    const res = [];
    for(let i=0; i<n; i++){
        const cur = arr2d[i][idx];
        res.push(cur);
    }
    return res;
}

function rowToCol(src, dest, idx){ // return a 2d array of converted row to column, idx is the position of an element array in a 2d array
    const n = src.length;
    for(let i=0; i<n; i++){
        dest[i][idx] = src[i];
    }
    return dest;
}

function padRight(arr,n){
    const res = [...arr];
    const m = n - arr.length;
    for(let i=0; i<m; i++){
        res.push(0);
    }
    return res;
}

function mergeToLeft(arr){
    let points = 0;
    const res = [];
    let i = 0;
    while(i<arr.length){
        if(i+1<arr.length&&arr[i]===arr[i+1]){
            let point = arr[i]*2;
            res.push(point);
            points += point;
            i+=2;
        }
        else{
            res.push(arr[i]);
            i++;
        }
    }
    return {result:res, total:points};
}

//-----------------------Move logic-------------------------
function slide(board, direction){
    let points = 0;
    const validKeys = ['left', 'right', 'up', 'down'];
    const n = board.length; //the length of grid
    const res = board.map(row=>[...row]);
    if(!validKeys.includes(direction)){
        throw new Error(`Invalid direction: ${direction}`);
    }
    for(let i=0; i<n; i++){
        let arr = [];
        if(direction==='up'||direction==='down'){
            arr = colToRow(board, i);
        }else if(direction==='left'||direction==='right'){
            arr = board[i];
        }
        const rawData = removeZero(arr);
        let cur = [];
        if(direction==='left'||direction==='up'){
            const {result, total} = mergeToLeft(rawData);
            points += total;
            cur = padRight(result, n);
        }
        else if(direction==='right'||direction==='down'){
            const {result, total} = mergeToLeft(rawData.reverse());
            points += total;
            cur = padRight(result, n).reverse();
        }

        if(direction==='left'||direction==='right'){
            res[i] = cur;
        }else if(direction==='up'||direction==='down'){
            rowToCol(cur, res, i);
        }
    }
    return {result:res, total:points};
}

export function move(board, direction){
    return slide(board, direction).result;
}
//-----------------------HasMoves logics-------------------------

function compare(board1, board2){
    const n = board1.length;
    for(let i=0; i<n; i++){
        for(let j=0; j<n; j++){
            if(board1[i][j]!==board2[i][j]){
                return true;
            }
        }
    }
    return false;
}

export function hasMoves(board){
    return compare(board, move(board, 'left'))
    ||compare(board, move(board, 'right'))
    ||compare(board, move(board, 'up'))
    ||compare(board, move(board, 'down'));
}

//-----------------------Spawn logics-------------------------

function spaces(board){
    const available = [];
    const n = board.length;
    for(let i=0; i<n; i++){
        for(let j=0; j<n; j++){
            if(board[i][j]===0){
                available.push([i, j]);
            }
        }
    }
    return available;
}

export function spawn(board, rng=Math.random){
    const res = board.map(row=>[...row]);
    const canSpawn = spaces(res);
    if(canSpawn.length===0){
        throw new Error("The board is full");
    }
    const n = canSpawn.length;
    const randSpot = Math.floor(rng()*n);
    const value = rng()<0.9 ? 2:4;
    const[i, j] = canSpawn[randSpot];
    res[i][j] = value;
    return res;
}

const board=Array.from({length:4}, ()=>Array(4).fill(0));
console.log(spawn(board));
//-----------------------Score function-------------------------

export function score(board, direction){
    return slide(board, direction).total;
}

//-----------------------Display function-------------------------
export function display(og, res){
    console.log('--------------------------------')
    for(let i=0; i<og.length; i++){
        console.log(og[i], '->', res[i]);
    }
    console.log('--------------------------------')
}

//---------------------------------------------------------------------------------------

// const arr2d=[
// [2,2,2,0],
// [0,2,0,2],
// [2,2,4,2],
// [0,0,0,0]];
// console.log(score(arr2d, 'left'));

//---------------------------------------------------------------------------------------

// const left = mergeResult2d(arr2d, 'left');
// const right = mergeResult2d(arr2d, 'right');
// const up = mergeResult2d(arr2d, 'up');
// const down = mergeResult2d(arr2d, 'down');

// display(arr2d, left);
// display(arr2d, right);
// display(arr2d, up);
// display(arr2d, down);
//--------------------------------- Tile Objects ----------------------------------------
function new_tile(){
    const tiles = [];
    const n = 4;
    let count = 0;
    for(let i=0; i<n; i++){
        const row = [];
        for(let j=0; j<n; j++){
            const tile = {"id":count, "value":2, "row":i, "col":j};
            row.push(tile);
            count++;
        }
        tiles.push(row);
    }
    return tiles;
}

function mergeTilesToLeft(tiles){ //merge 2 tiles with same values from 'tiles', reassign id/col and return a new list of tiles + points earned
    const res = [];
    let points = 0;
    let i = 0;
    let j = 0;
    let id = tiles[0].id;
    while(i<tiles.length){
        if(i+1<tiles.length&&tiles[i].value===tiles[i+1].value){
            const point = tiles[i].value*2;
            const merged_tile = {...tiles[i], "value":point, "id":id+j, "col":j};
            res.push(merged_tile);
            points += point;
            j++;
            i+=2;
        }
        else{
            const new_tile = {...tiles[i], "id":id+j, "col":j};
            res.push(new_tile);
            j++;
            i++;
        }
    }
    return {result:res, total:points};
}

function padRightTiles(tiles){ //take a tiles.result from merged tiles (without 0) and adding new tile with value 0 on the right
    console.log(`Tiles:${tiles}`);
    const n = 4;
    const m = tiles.length;
    const id = tiles[0].id;
    const row = tiles[0].row;
    for(let i=m; i<n; i++){
        const tile = {"id":id+i, "value":0, "row":row, "col":i}
        tiles.push(tile);
    }
    return tiles;
}

// const tiles = new_tile();

// const tile = tiles[2];
// console.log(tile);

// const mergedTiles = mergeTilesToLeft(tile).result;
// console.log(mergedTiles);

// const paddedTiles = padRightTiles(mergedTiles);
// console.log(paddedTiles);

// console.log(mergeTilesToLeft(tile).result);