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

export function areSameBoard(board1, board2){
    const n = board1.length;
    for(let i=0; i<n; i++){
        for(let j=0; j<n; j++){
            if(board1[i][j]!==board2[i][j]){
                return false;
            }
        }
    }
    return true;
}

export function hasWon(board){
    return board.some(row => row.some(cell => cell >= 2048));
}

export function hasMoves(board){
    return !areSameBoard(board, move(board, 'left'))
    || !areSameBoard(board, move(board, 'right'))
    || !areSameBoard(board, move(board, 'up'))
    || !areSameBoard(board, move(board, 'down'));
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
    const n = canSpawn.length;
    if(n===0){
        throw new Error("The board is full");
    }
    const randSpot = Math.floor(rng()*n);
    const value = rng()<0.9 ? 2:4;
    const[i, j] = canSpawn[randSpot];
    res[i][j] = value;
    return res;
}

//-----------------------Score function-------------------------

export function score(board, direction){
    return slide(board, direction).total;
}

//-----------------------Display function-------------------------
function display(og, res){
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
        if(i%2==0){
            for(let j=0; j<n; j++){
                const tile = {"id":count, "value":2, "row":i, "col":j};
                tiles.push(tile);
                count++;
            }
        }
    }
    return tiles;
}

function mergeTilesToLeft(tiles){ 
    const res = [];
    let points = 0;
    let i = 0;
    while(i<tiles.length){
        if(i+1<tiles.length&&tiles[i].value===tiles[i+1].value){
            const point = tiles[i].value*2;
            const tile = {...tiles[i], "value":point};
            res.push(tile);
            points += point;
            i+=2;
        }
        else{
            res.push(tiles[i]);
            i++;
        }
    }
    return {result:res, total:points};
}

export function tilesToBoard(tiles){
    const res = Array.from({length:4}, ()=>Array(4).fill(0));
    for(const tile of tiles){
        res[tile.row][tile.col] = tile.value;
    }
    return res;
}

export function spawnTile(tiles, id, rng=Math.random){
    const emptySpot = spaces(tilesToBoard(tiles));
    const n = emptySpot.length;
    if(n===0){
        throw new Error("The board is full");
    }
    const randSpot = Math.floor(rng()*n);
    const [row, col] = emptySpot[randSpot];
    const value = rng()<0.9 ? 2 : 4;
    const tile = {id, value, row, col};
    return [...tiles, tile];
}

function slideTiles(tiles, direction){
    let points = 0;
    const n = 4;
    const res = [];
    const validKeys = ["left", "right", "up", "down"];
    if(!validKeys.includes(direction)){
        throw new Error(`Not a valid direction ${direction}`);
    }
    for(let i=0; i<n; i++){
        let line = [];
        if(direction==="left"||direction==="right"){
            line = tiles.filter((t)=>t.row===i);
            if(direction==="left"){
                line.sort((a, b)=>a.col-b.col); 
            }
            else if(direction==="right"){
                line.sort((a, b)=>b.col-a.col);  
            }
        }
        else if(direction==="up"||direction==="down"){
            line = tiles.filter((t)=>t.col===i);
            if(direction==="up"){
                line.sort((a, b)=>a.row-b.row);
            }
            else if(direction==="down"){
                line.sort((a, b)=>b.row-a.row);
            }
        }

        const merged = mergeTilesToLeft(line);
        const placed = merged.result.map((tile, k)=>{
            if(direction==="left")return{...tile, col:k};
            if(direction==="right")return{...tile, col:3-k};
            if(direction==="up")return{...tile, row:k};
            if(direction==="down")return{...tile, row:3-k}
        });
        points += merged.total;
        res.push(...placed);
    }
    return {result:res, total:points};
}

export function moveTiles(tiles, direction){
    return slideTiles(tiles, direction).result;
}

export function scoreTiles(tiles, direction){
    return slideTiles(tiles, direction).total;
}

// const tiles = [{"id":0, "value":2, "row":0, "col":0}, {"id":1, "value":2, "row":0, "col":1}, {"id":2, "value":2, "row":0, "col":2}, {"id":3, "value":2, "row":0, "col":3}, ];
const tiles = new_tile();
console.log(tiles);
console.log(moveTiles(tiles, "up"), scoreTiles(tiles, "up"));
console.log(moveTiles(tiles, "down"));
console.log(moveTiles(tiles, "left"));
console.log(moveTiles(tiles, "right"));