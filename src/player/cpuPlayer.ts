import BlockGenerator from "../block/blockGenerator.js";
import { COLOR_VARIANTS_COUNT } from "../jewel.js";
import SFX from "../sfx.js";
import { randInt } from "../utils.js";
import Player from "./player.js";

export default class CpuPlayer extends Player {
    auxTicks = 0
    doNotMove = false
    targetCol = 0

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator){
        super(document, preffix, sfx, blockGenerator, true)
    }

    reset(): void {
        super.reset()
        this.doNotMove = false
        this.targetCol = 0
    }

    nextFallingBlock(): void {
        super.nextFallingBlock()
        this.doNotMove = false

        // is player in risk?
        if (this.board.getColumnHeight(1) > this.board.rowCount - 3){
            this.targetCol = 5
            this.speed = 0.10
            return
        } else if (this.board.getColumnHeight(3) > this.board.rowCount - 3) {
            this.targetCol = 0
            this.speed = 0.10
            return
        } else {
            this.speed = 0.20
        }

        // build column candidates
        let candidates = new Set<number>
        for (let i=0; i<4; i++) candidates.add(randInt(this.board.colCount))
        candidates.delete(2)

        // get block type
        let colorCount = this.fallingBlock.colorCount
        let currentHeight: number

        if (colorCount === 3){
            // find max height to avoid it
            let maxHeight = 0   
    
            candidates.forEach(col => {
                currentHeight = this.board.getColumnHeight(col)
                if (currentHeight > maxHeight){
                    maxHeight = currentHeight
                    this.targetCol = col < 2 ? 5 : 0
                }
            })
        } else {
            if (this.board.getColumnHeight(2) === 0){
                this.targetCol = 2
                return
            }

            let minHeight = this.board.rowCount

            candidates.forEach(col => {
                currentHeight = this.board.getColumnHeight(col)
                if (currentHeight < minHeight){
                    minHeight = currentHeight
                    this.targetCol = col
                }
            })
        }

        
        
    }

    stepFalling(){
        super.stepFalling()
        this.auxTicks++

        if (this.auxTicks >= 7 && this.fallingBlock.row > -1 && !this.doNotMove){
            this.auxTicks = 0

            let currentCol = this.fallingBlock.col
            let success = true

            if (currentCol === this.targetCol) this.doNotMove = true
            else if (currentCol > this.targetCol) success = this.fallingBlock.moveLeft(this.board)
            else success = this.fallingBlock.moveRight(this.board)
        }

        if (this.auxTicks % 5 === 0){
            //let topCell = this.board.getTopCell(this.fallingBlock.col)
            let bottom1 = this.fallingBlock.getBottomJewel()
            let bottom2 = this.fallingBlock.getMediumJewel()

            if (this.board.canClear(bottom1, bottom2, this.fallingBlock.col)){
                this.doNotMove = true
            } else {
                if (this.board.isColumnEmpty(this.fallingBlock.col)){
                    if (this.fallingBlock.colorCount === 2 && !this.fallingBlock.areTopJewelsTheSame()){
                        this.fallingBlock.rotate(this.sfx)
                    }
                } else {
                    this.fallingBlock.rotate(this.sfx)
                }
            }
        }

        //super.loop()
    }
}