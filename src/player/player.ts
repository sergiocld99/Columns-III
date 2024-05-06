import Board from "../board.js";
import FallingBlock from "../block/fallingBlock.js";
import { COLOR_VARIANTS_COUNT } from "../jewel.js";
import MatchStatus from "../matchStatus.js";
import NextBlock from "../block/nextBlock.js";
import SFX from "../sfx.js";
import BlockGenerator from "../block/blockGenerator.js";

export default class Player {
    nextBlock: NextBlock
    fallingBlock: FallingBlock
    board: Board

    // references
    opponent: Player | null = null
    sfx: SFX
    blockGenerator: BlockGenerator

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
    lastArrowCount = 0
    currentBlockIndex = 0

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator) {
        this.fallingBlock = new FallingBlock(blockGenerator.getCopy(this.currentBlockIndex))
        this.nextBlock = blockGenerator.getCopy(++this.currentBlockIndex)
        this.board = new Board(13, 6)
        this.sfx = sfx
        this.blockGenerator = blockGenerator

        // HTML references
        this.statsEl = document.getElementById(`${preffix}_stats`) as HTMLDivElement
        this.blueEl = this.statsEl.getElementsByClassName("blue-score")[0] as HTMLParagraphElement
        this.whiteEl = this.statsEl.getElementsByClassName("white-score")[0] as HTMLParagraphElement
        this.nextEl = this.statsEl.getElementsByClassName("next-board")[0] as HTMLCanvasElement
        this.nextCtx = this.nextEl.getContext("2d")!

        this.boardEl = document.getElementById(`${preffix}_board`) as HTMLCanvasElement
        this.boardCtx = this.boardEl.getContext("2d")!
    }

    loop() {
        switch (this.status) {
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

    protected stepFalling() {
        this.fallingBlock.row += 0.25

        if (this.fallingBlock.row > this.board.getLastEmptyRow(this.fallingBlock.col) - 2) {
            this.fallingBlock.row -= 0.25

            let success = this.board.placeBlock(this.fallingBlock)

            if (success) {
                this.status = MatchStatus.CLEARING
                this.timesInState = 0
                this.multiplier = 3
            } else {
                this.pause()
            }

            this.nextFallingBlock()
        }
    }

    private stepClearing() {
        if (this.timesInState === 0) {
            let recheck = this.board.checkEverything()

            if (recheck) {
                this.sfx.playClear(Math.ceil(this.multiplier / 4))
            } else {
                this.status = MatchStatus.FALLING_BLOCK

                // push
                if (this.multiplier >= 7 && this.shouldPush()){
                // if (this.multiplier < 7 && this.blueScore >= 10) {
                    setTimeout(() => this.poisonOpponent(), 250)
                }

                // arrow generation
                if (this.clearCount >= this.lastArrowCount + 20){
                    this.sfx.playSummonArrow()
                    this.lastArrowCount = this.clearCount
                    this.board.clearMysterious()
                    //this.board.clearColor(this.fallingBlock.jewels[2].color)
                }
            }
        } else if (this.timesInState >= 4) {
            this.status = MatchStatus.APPLYING_GRAVITY
        }

        this.timesInState++
    }

    private stepGravity() {
        let clears = this.board.currentClearCount
        this.updateBlueScore(clears * this.multiplier * (Math.floor(this.blueScore / 30) + 1))

        this.board.clearPending()
        this.status = MatchStatus.CLEARING
        this.timesInState = 0
        this.multiplier += 4

        this.clearCount += clears
        this.whiteEl.innerHTML = this.clearCount.toString()
    }

    // ---- EFFECTS -----------------------------

    private shouldPush(): boolean {
        if (this.blueScore < 10) return false
        return this.blueScore >= 30 || this.blueScore % 10 < 3
    }

    private poisonOpponent() {
        if (!this.opponent) return

        // break falling block
        if (this.opponent.status === MatchStatus.FALLING_BLOCK){
            this.opponent.nextFallingBlock()
            this.sfx.playBreak()
        }

        let count = Math.floor(this.blueScore / 10)
        if (count >= 3) this.sfx.playBigPush()
        else this.sfx.playNormalPush()

        // random
        let attemptsLeft = 100

        while (this.blueScore >= 10 && --attemptsLeft > 0) {
            let randomIndex = Math.floor(Math.random() * this.board.colCount)
            let added = this.opponent.board.poisonColumn(randomIndex)
            if (added) this.updateBlueScore(-added * 10)
        }
    }

    nextFallingBlock(){
        this.fallingBlock = new FallingBlock(this.nextBlock)
        this.nextBlock = this.blockGenerator.getCopy(++this.currentBlockIndex)
    }

    drawNextBlock(imgJewels: HTMLImageElement[]) {
        this.nextCtx.clearRect(0, 0, this.nextEl.width, this.nextEl.height)
        this.nextBlock.draw(imgJewels, this.nextCtx)
    }

    drawBoard(imgJewels: HTMLImageElement[]) {
        this.ticks++

        this.boardCtx.clearRect(0, 0, this.boardEl.width, this.boardEl.height)
        this.board.draw(imgJewels, this.boardCtx, this.ticks)
        this.fallingBlock.draw(imgJewels, this.boardCtx)
    }

    updateBlueScore(diff: number) {
        this.blueScore += diff
        this.blueEl.innerHTML = this.blueScore.toString()

        if (this.blueScore >= 30) this.blueEl.style.color = "red"
        else this.blueEl.style.color = "aqua"
    }

    clearBlueScore() {
        this.blueScore = 0
        this.blueEl.innerHTML = this.blueScore.toString()
    }

    reset() {
        this.board.reset()
        this.blueScore = 0
        this.clearCount = 0
        this.lastArrowCount = 0
        this.blueEl.innerHTML = this.blueScore.toString()
        this.whiteEl.innerHTML = this.clearCount.toString()
        this.status = MatchStatus.FALLING_BLOCK
        this.timesInState = 0
        this.ticks = 0

        this.opponent?.reset()
    }

    pause(){
        this.status = MatchStatus.PAUSE
        this.opponent?.pause()
    }
}