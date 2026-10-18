import{move, spawn, hasMoves, score, display}from './index.js';


//------------Move test--------------
console.log("-------------Move Test-------------")
const arr2d=[
    [2,2,2,0],
    [0,2,0,2],
    [2,2,4,2],
    [0,0,0,0]];
const arr2d1=[
    [2,4,2,4],
    [4,2,4,2],
    [2,4,2,4],
    [4,2,4,2]
]

const left = move(arr2d, 'left');

const right = move(arr2d, 'right');

const up = move(arr2d, 'up');

const down = move(arr2d, 'down');
console.log("-------------left-------------");
display(arr2d, left);
console.log("-------------right-------------");
display(arr2d, right);
console.log("-------------up-------------");
display(arr2d, up);
console.log("-------------down-------------");
display(arr2d, down);
console.log("-------------board1, board2-------------");
display(arr2d, arr2d1);
console.log("-------------HasMoves board1-------------");
console.log(hasMoves(arr2d));
console.log("-------------HasMoves board2-------------");
console.log(hasMoves(arr2d1));

//-------------Spawn test----------------
console.log("-------------Spawn Test-------------")
display(arr2d, spawn(arr2d));
//-------------Score test----------------
console.log("-------------Score Test-------------")
display(arr2d, left);
console.log("score of board1 after move to left:", score(arr2d, 'left'));



