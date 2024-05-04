import Block from "./block.js";
import Board from "./board.js";
import CpuPlayer from "./cpuPlayer.js";
import FallingBlock from "./fallingBlock.js";
import NextBlock from "./nextBlock.js";
import Player from "./player.js";

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


let imgJewels: HTMLImageElement[] = Array(6)
for (let i=0; i<imgJewels.length; i++) 
    imgJewels[i] = document.getElementById(`st5-${i+1}`) as HTMLImageElement


// SETUP FOR PLAYER 1
let player1 = new Player(document, "left")
player1.drawNextBlock(imgJewels)

// SETUP FOR PLAYER 2
let player2 = new CpuPlayer(document, "right", 3)
player2.drawNextBlock(imgJewels)

// LOOPS
let ticks = 0

setInterval(() => {
    player1.loop()
    player2.loop()
}, 200)

setInterval(() => {
    player1.drawNextBlock(imgJewels)
    player1.drawBoard(imgJewels)

    player2.drawNextBlock(imgJewels)
    player2.drawBoard(imgJewels)
}, 20)
