import Board from "./board.js";
import FallingBlock from "./fallingBlock.js";
import { COLOR_VARIANTS_COUNT } from "./jewel.js";
import NextBlock from "./nextBlock.js";

export default class Player {
    nextBlock: NextBlock
    fallingBlock: FallingBlock
    board: Board
    maxColors: number

    // HTML elements
    statsEl: HTMLDivElement
    boardEl: HTMLCanvasElement
    nextEl: HTMLCanvasElement

    // context
    boardCtx: CanvasRenderingContext2D
    nextCtx: CanvasRenderingContext2D

    constructor(document: Document, preffix: string, maxColors = COLOR_VARIANTS_COUNT){
        this.maxColors = maxColors
        this.fallingBlock = new FallingBlock(new NextBlock(maxColors))
        this.nextBlock = new NextBlock(maxColors)
        this.board = new Board(13,6)

        // HTML references
        this.statsEl = document.getElementById(`${preffix}_stats`) as HTMLDivElement
        this.nextEl = this.statsEl.getElementsByClassName("next-board")[0] as HTMLCanvasElement
        this.nextCtx = this.nextEl.getContext("2d")!

        this.boardEl = document.getElementById(`${preffix}_board`) as HTMLCanvasElement
        this.boardCtx = this.boardEl.getContext("2d")!

        // KEY LISTENER
        document.addEventListener("keydown", e => {
            if (e.key === "ArrowLeft") this.fallingBlock.moveLeft(this.board)
            else if (e.key === "ArrowRight") this.fallingBlock.moveRight(this.board)
            else if (e.key === " ") this.fallingBlock.rotate()
            else console.log(e.key)
        })
    }

    loop(){
        this.fallingBlock.row += 0.5

        if (this.fallingBlock.row > this.board.getLastEmptyRow(this.fallingBlock.col) - 2) {
            this.fallingBlock.row -= 0.5

            let success = this.board.placeBlock(this.fallingBlock)
            
            if (!success) {
                this.board.reset()
            } else {
                this.board.check(
                    [this.fallingBlock.col],
                    [
                        this.fallingBlock.row,
                        this.fallingBlock.row+1,
                        this.fallingBlock.row+2
                    ]
                )
                
                //this.board.checkColumn(this.fallingBlock.col)
                //this.board.checkRow(this.fallingBlock.row)
                //this.board.checkRow(this.fallingBlock.row+1)
                //this.board.checkRow(this.fallingBlock.row+2)
            }

            this.fallingBlock = new FallingBlock(this.nextBlock)
            this.nextBlock = new NextBlock(this.maxColors)
        }
    }

    drawNextBlock(imgJewels: HTMLImageElement[]) {
        this.nextCtx.clearRect(0,0, this.nextEl.width, this.nextEl.height)
        this.nextBlock.draw(imgJewels, this.nextCtx)
    }

    drawBoard(imgJewels: HTMLImageElement[]){
        this.boardCtx.clearRect(0,0, this.boardEl.width, this.boardEl.height)
        this.board.draw(imgJewels, this.boardCtx)
        this.fallingBlock.draw(imgJewels, this.boardCtx)
    }
}