import Block from "./block.js";
import Board from "../board.js";
import { Jewel } from "../jewel.js";
import SFX from "../sfx.js";

export default class FallingBlock extends Block {
    colorCount: number

    constructor(nextBlock: Block){
        super(2, -3)
        nextBlock.jewels.forEach(j => this.jewels.push(j))
        this.colorCount = this.getUniqueColorCount()
    }

    getBottomRow() : number {
        return Math.ceil(this.row + this.jewels.length - 1)
    }

    rotate(sfx: SFX){
        sfx.playRotate()
        this.jewels = [this.jewels[2], this.jewels[0], this.jewels[1]]    
    }

    moveLeft(board: Board): boolean {
        if (this.col > 0) {
            if (board.matrix[this.getBottomRow()][this.col-1] === null){
                this.col--
                return true
            }
        }

        return false
    }

    moveRight(board: Board): boolean {
        const boardCols = board.matrix[0].length

        if (this.col < boardCols){
            if (board.matrix[this.getBottomRow()][this.col+1] === null){
                this.col++
                return true
            }
        } 

        return false
    }

    // ---- CPU STRATEGIES ----------

    getMediumJewel() : Jewel {
        return this.jewels[1]
    }

    getBottomJewel() : Jewel {
        return this.jewels[2]
    }

    areTopJewelsTheSame(): boolean {
        return this.jewels[0].equals(this.jewels[1])
    }

    isMagicStone(): boolean {
        return this.jewels[0].isMagicStoneType()
    }

    private getUniqueColorCount(): number {
        let colors = new Set<number>
        this.jewels.forEach(j => colors.add(j.color))
        return colors.size
    }
}