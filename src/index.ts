import BlockGenerator from "./block/blockGenerator.js";
import MatchStatus from "./matchStatus.js";
import CpuPlayer from "./player/cpuPlayer.js";
import ManualPlayer from "./player/manualPlayer.js";
import SFX from "./sfx.js";
import { randInt } from "./utils.js";

const STAGE = randInt(3) + 3

setTimeout(() => {
    sfx.playBgm()
}, 3000);


let imgJewels: HTMLImageElement[] = Array(6)
for (let i=0; i<imgJewels.length; i++) 
    imgJewels[i] = document.getElementById(`st${STAGE < 4 ? 1 : STAGE}-${i+1}`) as HTMLImageElement

imgJewels.push(document.getElementById('mysterious') as HTMLImageElement)

// COMMON SETUP
const sfx = new SFX(STAGE)
const blockGenerator = new BlockGenerator([0, 3, 4, 5])

// SETUP FOR PLAYER 1
let player1 = new ManualPlayer(document, "left", sfx, blockGenerator)
player1.drawNextBlock(imgJewels)

// SETUP FOR PLAYER 2
let player2 = new CpuPlayer(document, "right", sfx, blockGenerator)
player2.drawNextBlock(imgJewels)

// SET OPPONENTS
player1.opponent = player2
player2.opponent = player1

// LOOPS
setInterval(() => {
    player1.loop()
    player2.loop()
}, 50)

setInterval(() => {
    player1.drawNextBlock(imgJewels)
    player1.drawBoard(imgJewels)

    player2.drawNextBlock(imgJewels)
    player2.drawBoard(imgJewels)
}, 20)

document.addEventListener("keydown", e => {
    if (e.key === "Enter"){
        if (player1.status === MatchStatus.PAUSE){
            player1.reset()
        }
    }
})