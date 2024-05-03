import Block from "./block.js";
import Board from "./board.js";
import FallingBlock from "./fallingBlock.js";
import NextBlock from "./nextBlock.js";

function playMusic(name: string, initialSecs = 0) {
    const bgm = new Audio(`bgm/${name}.bgm`);
    bgm.currentTime = initialSecs
    bgm.play();

    let interv = window.setInterval(() => {
        if (bgm.currentTime > bgm.duration - 1){
            playMusic(name)
            clearInterval(interv)
        }
    }, 1000)
}

setTimeout(() => {
    playMusic('track19')
}, 3000);


// test images
const leftStatsEl = document.getElementById("left_stats") as HTMLDivElement
const leftNextEl = leftStatsEl.getElementsByClassName("next-board")[0] as HTMLCanvasElement
const leftNextCtx = leftNextEl.getContext("2d")!

let imgJewels: HTMLImageElement[] = Array(6)
for (let i=0; i<imgJewels.length; i++) 
    imgJewels[i] = document.getElementById(`st5-${i+1}`) as HTMLImageElement

// player board
const leftBoardEl = document.getElementById("left_board") as HTMLCanvasElement
const leftBoardCtx = leftBoardEl.getContext("2d")!

function drawNextBlock() {
    leftNextCtx.clearRect(0,0, leftNextEl.width, leftNextEl.height)
    nextBlock.draw(imgJewels, leftNextCtx)
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") fallingBlock.moveLeft()
    else if (e.key === "ArrowRight") fallingBlock.moveRight(6)
    else if (e.key === " ") fallingBlock.rotate()
    else console.log(e.key)
})

// SETUP
let nextBlock = new NextBlock()
let fallingBlock = new FallingBlock(nextBlock)

nextBlock = new NextBlock()
let board = new Board(13,6)
drawNextBlock()

// LOOPS
setInterval(() => {
    fallingBlock.row += 0.5

    if (fallingBlock.row > board.getLastEmptyRow(fallingBlock.col) - 2) {
        fallingBlock.row -= 0.5
        
        board.placeBlock(fallingBlock)
        board.checkColumn(fallingBlock.col)
        board.checkRow(fallingBlock.row)
        board.checkRow(fallingBlock.row+1)
        board.checkRow(fallingBlock.row+2)
        fallingBlock = new FallingBlock(nextBlock)
        nextBlock = new NextBlock()
        drawNextBlock()
    }
}, 200)

setInterval(() => {
    leftBoardCtx.clearRect(0,0, leftBoardEl.width, leftBoardEl.height)

    // draw
    board.draw(imgJewels, leftBoardCtx)
    fallingBlock.draw(imgJewels, leftBoardCtx)
}, 20)

