import Block from "./block.js";
import Board from "./board.js";
import { Jewel } from "./jewel.js";
import SFX from "./sfx.js";

export default class FallingBlock extends Block {

    constructor(nextBlock: Block){
        super(2, -3)
        nextBlock.jewels.forEach(j => this.jewels.push(j))
    }

    getBottomRow() : number {
        return Math.ceil(this.row + this.jewels.length - 1)
    }

    rotate(sfx: SFX){
        sfx.playRotate()
        this.jewels = [this.jewels[2], this.jewels[0], this.jewels[1]]    
    }

    moveLeft(board: Board){
        if (this.col > 0) {
            if (board.matrix[this.getBottomRow()][this.col-1] === null){
                this.col--
            }
        }
    }

    moveRight(board: Board){
        const boardCols = board.matrix[0].length

        if (this.col < boardCols){
            if (board.matrix[this.getBottomRow()][this.col+1] === null){
                this.col++
            }
        } 
    }

    // ---- CPU STRATEGIES ----------

    getBottomJewel() : Jewel {
        return this.jewels[2]
    }
}