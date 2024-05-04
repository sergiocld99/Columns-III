import MatchStatus from "./matchStatus.js";
import CpuPlayer from "./player/cpuPlayer.js";
import ManualPlayer from "./player/manualPlayer.js";

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
let player1 = new CpuPlayer(document, "left", [0, 2, 4])
player1.drawNextBlock(imgJewels)

// SETUP FOR PLAYER 2
let player2 = new CpuPlayer(document, "right", [1, 3, 5])
player2.drawNextBlock(imgJewels)

// SET OPPONENTS
player1.opponent = player2
player2.opponent = player1

// LOOPS
setInterval(() => {
    player1.loop()
    player2.loop()
}, 100)

setInterval(() => {
    player1.drawNextBlock(imgJewels)
    player1.drawBoard(imgJewels)

    player2.drawNextBlock(imgJewels)
    player2.drawBoard(imgJewels)
}, 20)
