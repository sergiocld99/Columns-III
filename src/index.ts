import BlockGenerator from "./block/blockGenerator.js";
import PlayerStatus from "./player/playerStatus.js";
import CpuPlayer from "./player/cpuPlayer.js";
import ManualPlayer from "./player/manualPlayer.js";
import SFX from "./sfx.js";
import { randInt } from "./utils.js";
import Match from "./match/match.js";
import Sphinx from "./player/enemies/sphinx.js";
import Mommy from "./player/enemies/mommy.js";
import { MatchStatus } from "./match/matchStatus.js";

let imgJewels: HTMLImageElement[] = []

function loadImgJewels(stage: number) {
    imgJewels = Array(6)

    for (let i=0; i<imgJewels.length; i++) 
        imgJewels[i] = document.getElementById(`st${stage < 4 ? 1 : stage}-${i+1}`) as HTMLImageElement
    
    imgJewels.push(document.getElementById('mysterious') as HTMLImageElement)
    
    // magic stone
    for (let i=0; i<3; i++){
        imgJewels.push(document.getElementById(`ms-${i+1}`) as HTMLImageElement)
    }
}


// COMMON SETUP
const sfx = new SFX(randInt(5)+1)
const blockGenerator = new BlockGenerator([0, 3, 4, 5, 1])
loadImgJewels(sfx.stage)

// SETUP FOR PLAYER 1
let player1 = new Sphinx(document, "left", sfx, blockGenerator)
player1.drawNextBlock(imgJewels)

// SETUP FOR PLAYER 2
let player2 = new Sphinx(document, "right", sfx, blockGenerator)
player2.drawNextBlock(imgJewels)

// SET OPPONENTS
player1.opponent = player2
player2.opponent = player1

const match = new Match(sfx, player1, player2)
setTimeout(() => match.start(), 1000)

// LOOPS
setInterval(() => {
    player1.loop()
    player2.loop()

    if (player1.status === PlayerStatus.PAUSE){
        match.status = MatchStatus.ENDED
    }
}, 30)

setInterval(() => {
    player1.drawNextBlock(imgJewels)
    player1.drawBoard(imgJewels)

    player2.drawNextBlock(imgJewels)
    player2.drawBoard(imgJewels)
}, 20)

document.addEventListener("keydown", e => {
    if (e.key === "Enter"){
        if (player1.status === PlayerStatus.PAUSE){
            sfx.nextStage()
            loadImgJewels(sfx.stage)
            blockGenerator.reset()
            match.reset()
        }
    }
})