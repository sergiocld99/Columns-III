import Board from "../board";
import FallingBlock from "../block/fallingBlock";
import { MagicStoneJewels } from "../jewel";
import PlayerStatus from "./playerStatus";
import NextBlock from "../block/nextBlock";
import SFX from "../sfx";
import BlockGenerator from "../block/blockGenerator";
import MagicStone from "../block/magicStone";

export default abstract class Player {
    nextBlock: NextBlock
    fallingBlock: FallingBlock
    board: Board
    autoPush: boolean
    maxSpeed = 0.5
    poisoned = false

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
    status = PlayerStatus.WAITING
    timesInState = 0
    ticks = 0
    multiplier = 3
    lastArrowCount = 0
    currentBlockIndex = 0
    speed = 0.20

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator, autoPush: boolean) {
        this.nextBlock = blockGenerator.getCopy(this.currentBlockIndex)
        this.fallingBlock = new FallingBlock(this.nextBlock)
        //this.nextBlock = blockGenerator.getCopy(++this.currentBlockIndex)
        this.board = new Board(13, 6)
        this.sfx = sfx
        this.blockGenerator = blockGenerator
        this.autoPush = autoPush

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
            case PlayerStatus.FALLING_BLOCK:
                this.stepFalling()
                break
            case PlayerStatus.CLEARING:
                this.stepClearing()
                break
            case PlayerStatus.APPLYING_GRAVITY:
                this.stepGravity()
                break
            case PlayerStatus.PAUSE:
                break
        }
    }

    protected stepFalling() {
        if (this.board.jewelsOutside.length){
            this.sfx.playLose()
            this.pause()
        }

        this.fallingBlock.row += this.speed

        if (this.fallingBlock.row > this.board.getLastEmptyRow(this.fallingBlock.col) - 2) {
            this.fallingBlock.row -= this.speed

            let success = this.board.placeBlock(this.fallingBlock)

            if (success) {
                this.status = PlayerStatus.CLEARING
                this.timesInState = 0
                this.multiplier = 3

                // check if it's magic stone
                if (this.fallingBlock.isMagicStone()){
                    switch (this.fallingBlock.getBottomJewel().color){
                        case MagicStoneJewels.PUSH_UP:
                            // push opponent
                            this.pushOpponentUsingArrow()
                            break
                        case MagicStoneJewels.CLEAR:
                            // clear
                            let topCell = this.board.getTopCell(this.fallingBlock.col)
                            if (topCell) this.board.clearColor(topCell.color)
                            this.multiplier = 0
                            break
                        case MagicStoneJewels.PUSH_DOWN:
                            // push down
                            this.board.removeColumn(this.fallingBlock.col)
                            this.sfx.playNormalPush()
                            break
                    }
                }

            } else {
                this.sfx.playLose()
                this.pause()
            }

            //this.nextFallingBlock()
        }
    }

    private stepClearing() {
        if (this.timesInState === 0) {
            let recheck = this.board.checkEverything()

            if (recheck) {
                this.sfx.playClear(Math.ceil(this.multiplier / 4))
            } else {

                this.status = PlayerStatus.FALLING_BLOCK
                this.nextFallingBlock()

                // push
                if (this.shouldPush()){
                    setTimeout(() => this.pushOpponent(), 250)
                }

                // arrow generation
                if (this.clearCount >= this.lastArrowCount + 20){
                    this.sfx.playMagicStone()
                    this.lastArrowCount = this.clearCount
                    this.nextBlock = new MagicStone()
                }

                // poison if multiplier if clearing chain was at least 3
                if (this.multiplier > 11){
                    setTimeout(() => {
                        this.sfx.playPoisoned()
                        this.opponent?.poison()
                    }, 500)
                }
            }
        } else if (this.timesInState >= 15) {
            this.status = PlayerStatus.APPLYING_GRAVITY
        }

        this.timesInState++
    }

    private stepGravity() {
        if (this.multiplier > 0){
            let clears = this.board.currentClearCount
            this.updateBlueScore(clears * this.multiplier * (Math.floor(this.blueScore / 30) + 1))
            this.clearCount += clears
            this.whiteEl.innerHTML = this.clearCount.toString()
            this.multiplier += 4
        }   
        
        if (this.board.clearPending()){
            // there are no jewels outside
            this.status = PlayerStatus.CLEARING
            this.timesInState = 0

        } else {
            this.sfx.playLose()
            this.pause()
        }
    }

    // ---- EFFECTS -----------------------------

    public breakFallingBlock(): void {
        if (this.status === PlayerStatus.FALLING_BLOCK){
            if (this.fallingBlock.isMagicStone()){
                console.log("Magic Stone broken")
            }

            this.nextFallingBlock()
            this.sfx.playBreak()
        }
    }

    protected abstract shouldPush(): boolean

    private pushOpponentUsingArrow(){
        if (!this.opponent) return
        this.sfx.playNormalPush()

        // add one mysterious jewel in each column
        for (let c=0; c<this.board.colCount; c++){
            this.opponent.board.poisonColumn(c)
        }

        // always at the end!
        this.opponent.breakFallingBlock()
    }

    protected pushOpponent() {
        if (!this.opponent || this.blueScore < 10 || this.status != PlayerStatus.FALLING_BLOCK) return

        let count = Math.floor(this.blueScore / 10)
        if (count >= 3) this.sfx.playBigPush()
        else this.sfx.playNormalPush()

        // random
        let attemptsLeft = 100
        let added = 0

        while (this.blueScore >= 10 && --attemptsLeft > 0) {
            let randomIndex = Math.floor(Math.random() * this.board.colCount)
            added += this.opponent.board.poisonColumn(randomIndex)
            if (added >= 2) {
                this.updateBlueScore(-10)
                added = 0
            }
        }

        // always at the end!
        this.opponent.breakFallingBlock()
    }

    protected poison(){
        this.poisoned = true
        setTimeout(() => {
            this.poisoned = false
        }, 12000)
    }

    // -------------------------------------

    nextFallingBlock(){
        this.fallingBlock = new FallingBlock(this.nextBlock)
        this.nextBlock = this.blockGenerator.getCopy(++this.currentBlockIndex)
    }

    isScared(): boolean {
        return this.poisoned || this.board.hasJewelsInRow(2,1)
    }

    drawNextBlock(imgJewels: HTMLImageElement[]) {
        this.nextCtx.clearRect(0, 0, this.nextEl.width, this.nextEl.height)
        this.nextBlock.draw(imgJewels, this.nextCtx, this.poisoned)
    }

    drawBoard(imgJewels: HTMLImageElement[]) {
        this.ticks++
        this.board.draw(imgJewels, this.boardCtx, this.ticks, this.poisoned)

        if (this.status === PlayerStatus.FALLING_BLOCK)
            this.fallingBlock.draw(imgJewels, this.boardCtx, this.poisoned)
    }

    clearBoardCtx(){
        this.boardCtx.clearRect(0, 0, this.boardEl.width, this.boardEl.height)
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
        this.status = PlayerStatus.WAITING
        this.currentBlockIndex = 0
        this.nextBlock = this.blockGenerator.getCopy(this.currentBlockIndex)
        this.nextFallingBlock()
        this.timesInState = 0
        this.ticks = 0
        this.multiplier = 3
        this.poisoned = false
    }

    pause(){
        this.status = PlayerStatus.PAUSE
        if (this.opponent && this.opponent.status != PlayerStatus.PAUSE){
            this.opponent.pause()
        }
    }
}