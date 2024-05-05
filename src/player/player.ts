import Board from "../board.js";
import FallingBlock from "../fallingBlock.js";
import { COLOR_VARIANTS_COUNT } from "../jewel.js";
import MatchStatus from "../matchStatus.js";
import NextBlock from "../nextBlock.js";
import SFX from "../sfx.js";

export default class Player {
    nextBlock: NextBlock
    fallingBlock: FallingBlock
    board: Board
    colors: number[]

    // references
    opponent: Player | null  = null
    sfx: SFX

    // HTML elements
    statsEl: HTMLDivElement
    boardEl: HTMLCanvasElement
    nextEl: HTMLCanvasElement
    blueEl: HTMLParagraphElement
    whiteEl: HTMLParagraphElement

    // context
    boardCtx: CanvasRenderingContext2D
    nextCtx: CanvasRenderingContext2D

    // match status
    blueScore = 0
    clearCount = 0
    status = MatchStatus.FALLING_BLOCK
    timesInState = 0
    ticks = 0
    multiplier = 3

    constructor(document: Document, preffix: string, colors: number[], sfx: SFX){
        this.colors = colors
        this.fallingBlock = new FallingBlock(new NextBlock(colors))
        this.nextBlock = new NextBlock(colors)
        this.board = new Board(13,6)
        this.sfx = sfx

        // HTML references
        this.statsEl = document.getElementById(`${preffix}_stats`) as HTMLDivElement
        this.blueEl = this.statsEl.getElementsByClassName("blue-score")[0] as HTMLParagraphElement
        this.whiteEl = this.statsEl.getElementsByClassName("white-score")[0] as HTMLParagraphElement
        this.nextEl = this.statsEl.getElementsByClassName("next-board")[0] as HTMLCanvasElement
        this.nextCtx = this.nextEl.getContext("2d")!

        this.boardEl = document.getElementById(`${preffix}_board`) as HTMLCanvasElement
        this.boardCtx = this.boardEl.getContext("2d")!
    }

    loop(){
        switch(this.status){
            case MatchStatus.FALLING_BLOCK:
                this.stepFalling()
                break
            case MatchStatus.CLEARING:
                this.stepClearing()
                break
            case MatchStatus.APPLYING_GRAVITY:
                this.stepGravity()
                break
            case MatchStatus.PAUSE:
                break
        }
    }

    private stepFalling(){
        this.fallingBlock.row += 0.25

        if (this.fallingBlock.row > this.board.getLastEmptyRow(this.fallingBlock.col) - 2) {
            this.fallingBlock.row -= 0.25

            let success = this.board.placeBlock(this.fallingBlock)
            
            if (success) {
                this.status = MatchStatus.CLEARING
                this.timesInState = 0
                this.multiplier = 3
            } else {
                this.reset()
            }

            this.fallingBlock = new FallingBlock(this.nextBlock)
            this.nextBlock = new NextBlock(this.colors)
        }
    }

    private stepClearing(){
        if (this.timesInState === 0){
            let recheck = this.board.checkEverything()
            
            if (recheck){
                this.sfx.playClear(Math.ceil(this.multiplier / 4))
            } else {
                this.status = MatchStatus.FALLING_BLOCK

                if (this.multiplier > 7 && this.opponent){
                    let count = Math.floor(this.blueScore / 10)
                    let targetIndex = (this.opponent.fallingBlock.col + 3) % this.board.colCount

                    for (let i=0; i<count; i++) {
                        let added = this.opponent.board.poisonColumn(targetIndex)
                        if (added) this.updateBlueScore(-added * 10)
                    }

                    // random
                    while(this.blueScore >= 10){
                        let randomIndex = Math.floor(Math.random() * this.board.colCount)
                        let added = this.opponent.board.poisonColumn(randomIndex)
                        if (added) this.updateBlueScore(-added * 10)
                    }
                }
            }
        } else if (this.timesInState >= 4){
            this.status = MatchStatus.APPLYING_GRAVITY
        }

        this.timesInState++
    }

    private stepGravity(){
        let clears = Math.floor(this.board.toClear.length / 3) + (this.board.toClear.length % 3)
        this.updateBlueScore(clears * this.multiplier)
        
        this.board.clearPending()
        this.status = MatchStatus.CLEARING
        this.timesInState = 0
        this.multiplier += 4

        this.clearCount += clears
        this.whiteEl.innerHTML = this.clearCount.toString()
    }

    // ---- EFFECTS -----------------------------

    drawNextBlock(imgJewels: HTMLImageElement[]) {
        this.nextCtx.clearRect(0,0, this.nextEl.width, this.nextEl.height)
        this.nextBlock.draw(imgJewels, this.nextCtx)
    }

    drawBoard(imgJewels: HTMLImageElement[]){
        this.ticks++

        this.boardCtx.clearRect(0,0, this.boardEl.width, this.boardEl.height)
        this.board.draw(imgJewels, this.boardCtx, this.ticks)
        this.fallingBlock.draw(imgJewels, this.boardCtx)
    }

    updateBlueScore(diff: number){
        this.blueScore += diff
        this.blueEl.innerHTML = this.blueScore.toString()

        if (this.blueScore >= 30) this.blueEl.style.color = "red"
        else this.blueEl.style.color = "aqua"
    }

    clearBlueScore(){
        this.blueScore = 0
        this.blueEl.innerHTML = this.blueScore.toString()
    }

    reset(){
        this.board.reset()
        this.blueScore = 0
        this.clearCount = 0
        this.blueEl.innerHTML = this.blueScore.toString()
        this.whiteEl.innerHTML = this.clearCount.toString()
        this.status = MatchStatus.FALLING_BLOCK
        this.timesInState = 0
        this.ticks = 0

        this.opponent?.board?.reset()
    }
}