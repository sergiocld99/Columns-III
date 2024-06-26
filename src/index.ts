import BlockGenerator from "./block/blockGenerator";
import PlayerStatus from "./player/playerStatus";
import SFX from "./sfx";
import { randInt } from "./utils";
import Match from "./match/match";
import { MatchStatus } from "./match/matchStatus";
import ManualPlayer from "./player/manualPlayer";
import Mommy from "./player/enemies/mommy";
import Sphinx from "./player/enemies/sphinx";
import Witch from "./player/enemies/witch";
import Scorpion from "./player/enemies/scorpion";
import Spider from "./player/enemies/spider";

let imgJewels: HTMLImageElement[] = []

function loadImgJewels(stage: number) {
    imgJewels = Array(6)

    // normal jewels
    for (let j=0; j<6; j++){
        let img = new Image()
        img.src = `jewels/st${stage < 4 ? 1 : stage}-${j+1}.png`
        imgJewels[j] = img
    }

    imgJewels.push(document.getElementById('mysterious') as HTMLImageElement)
    
    // magic stone
    for (let i=0; i<3; i++){
        let img = new Image()
        img.src = `jewels/ms-${i+1}.png`
        imgJewels.push(img)
    }

    // black and white jewels
    for (let j=0; j<6; j++){
        let img = new Image()
        img.src = `jewels/st${stage < 4 ? 1 : stage}-${j+1}-bw.png`
        imgJewels.push(img)
    }
}

// Player 2 GFX
const characterCanvas = document.getElementsByClassName("enemy-box")[0] as HTMLCanvasElement
const characterCtx = characterCanvas.getContext("2d")!
const sphinxImgs = Array(3)

for (let i=0; i<sphinxImgs.length; i++) {
    let img = new Image()
    img.src = `gfx/sphinx-${i+1}.png`
    sphinxImgs[i] = img
}

// COMMON SETUP
const sfx = new SFX(randInt(5)+1)
const blockGenerator = new BlockGenerator([0, 3, 4, 5, 1])
loadImgJewels(sfx.stage)

// SETUP FOR PLAYER 1
let player1 = new Sphinx(document, "left", sfx, blockGenerator, 0)
player1.drawNextBlock(imgJewels)

// SETUP FOR PLAYER 2
let player2 = new Sphinx(document, "right", sfx, blockGenerator, 1)
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
    player1.clearBoardCtx()
    player1.drawBoard(imgJewels)

    player2.drawNextBlock(imgJewels)
    player2.clearBoardCtx()
    player2.drawBoard(imgJewels)
}, 20)

let characterTick = 0

setInterval(() => {
    characterCtx.clearRect(0,0,characterCanvas.width, characterCanvas.height)
    characterTick = (characterTick+1) % 2
    let resource: HTMLImageElement

    if (player2.isScared() && player1.board.matrix[0][2] === null){
        resource = characterTick ? sphinxImgs[1] : sphinxImgs[0]
    } else {
        resource = player1.isScared() ? sphinxImgs[2] : sphinxImgs[0]
    }

    characterCtx.drawImage(resource, 0, 0, 231, 231, 0, 0, 150, 150)

    // time
    const timeEl = document.getElementById("match-time") as HTMLParagraphElement
    timeEl.innerHTML = match.getTime()
}, 250)

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