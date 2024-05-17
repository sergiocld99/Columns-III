import Block from "./block";
import Board from "../board";
import { Jewel } from "../jewel";
import SFX from "../sfx";
import NextBlock from "./nextBlock";

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

    rotate(sfx: SFX | null = null){
        if (sfx) sfx.playRotate()
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

    areBottomJewelsTheSame(): boolean {
        return this.jewels[2].equals(this.jewels[1])
    }

    isMagicStone(): boolean {
        return this.jewels[0].isMagicStoneType()
    }

    getAllCombinations(): FallingBlock[] {
        let arr: FallingBlock[] = [this]
        
        for (let i=1; i<3; i++){
            let aux = new NextBlock()
            aux.jewels = [...this.jewels]

            let b = new FallingBlock(aux)
            for (let j=0; j<i; j++) b.rotate()
            arr.push(b)
        }

        return arr
    }

    getRepeatedColor(): number {
        return this.getRepeatedJewel().color
    }

    getRepeatedJewel(): Jewel {
        let res = this.jewels[0]
        if (this.jewels[1].color === res.color) return res
        else return this.jewels[2]
    }

    private getUniqueColorCount(): number {
        let colors = new Set<number>
        this.jewels.forEach(j => colors.add(j.color))
        return colors.size
    }
}