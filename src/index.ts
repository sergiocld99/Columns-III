import Block from "./block.js";

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

let fallingBlock = new Block(2)

function drawNextBlock() {
    let block = new Block()
    block.draw(imgJewels, leftNextCtx, leftNextEl.width, leftNextEl.height)
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") fallingBlock.moveLeft()
    else if (e.key === "ArrowRight") fallingBlock.moveRight(6)
    else if (e.key === " ") fallingBlock.rotate()
    else console.log(e.key)
})

setInterval(drawNextBlock, 1000)

setInterval(() => {
    fallingBlock.row += 0.5
    if (fallingBlock.row > 10) fallingBlock = new Block(2)
}, 500)

setInterval(() => {
    fallingBlock.draw(imgJewels, leftBoardCtx, leftBoardEl.width, leftBoardEl.height)
}, 20)