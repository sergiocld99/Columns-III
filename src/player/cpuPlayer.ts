import BlockGenerator from "../block/blockGenerator.js";
import { ClearPredict } from "../clearPredict.js";
import { COLOR_VARIANTS_COUNT } from "../jewel.js";
import SFX from "../sfx.js";
import { randInt } from "../utils.js";
import Player from "./player.js";

export default class CpuPlayer extends Player {
    auxTicks = 0
    doNotMove = false
    targetCol = 0
    maxSpeed = 0.5
    timesRotated = 0

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator){
        super(document, preffix, sfx, blockGenerator, true)
    }

    reset(): void {
        super.reset()
        this.doNotMove = false
        this.targetCol = 0
        this.speed = 0.10
        this.timesRotated = 0
    }

    nextFallingBlock(): void {
        super.nextFallingBlock()
        this.doNotMove = false
        this.speed = 0.10
        this.timesRotated = 0

        // is player in risk?
        if (this.board.getColumnHeight(1) > this.board.rowCount - 3){
            this.targetCol = 5
            return
        } else if (this.board.getColumnHeight(3) > this.board.rowCount - 3) {
            this.targetCol = 0
            return
        } 
        
        // quick search
        if (this.fallingBlock.colorCount < 3){
            if (this.board.isColumnEmpty(2)){
                this.targetCol = 2
                return
            }  

            let targetColor = this.fallingBlock.getRepeatedColor()
            let topCell
            
            for (let c=0; c<this.board.colCount; c++){
                topCell = this.board.getTopCell(c)
                if (topCell && topCell.color === targetColor){
                    this.targetCol = c
                    return
                }
            }
        } 

        // build column candidates
        let candidates = new Set<number>
        for (let i=0; i<4; i++) candidates.add(randInt(this.board.colCount))
        candidates.delete(2)

        // find max height to avoid it
        let currentHeight: number
        let minHeight = this.board.rowCount   

        candidates.forEach(col => {
            currentHeight = this.board.getPonderedColumnHeight(col)
            if (currentHeight === 0 && this.fallingBlock.colorCount < 3){
                this.targetCol = col
                return
            }

            if (currentHeight < minHeight){
                minHeight = currentHeight
                this.targetCol = col
                //this.targetCol = col < 2 ? 5 : 0
            }
        })  
    }

    stepFalling(){
        super.stepFalling()
        this.auxTicks++

        if (this.auxTicks >= 7 && this.fallingBlock.row > -1 && !this.doNotMove){
            this.auxTicks = 0

            let currentCol = this.fallingBlock.col

            if (currentCol > this.targetCol) {
                this.fallingBlock.moveLeft(this.board)
                this.timesRotated = 0
            } else if (currentCol < this.targetCol) {
                this.fallingBlock.moveRight(this.board)
                this.timesRotated = 0
            }
        }

        if (this.auxTicks % 5 === 0){
            let topCell = this.board.getTopCell(this.fallingBlock.col)
            let bottom1 = this.fallingBlock.getBottomJewel()
            let bottom2 = this.fallingBlock.getMediumJewel()
            let fallingTop = this.fallingBlock.jewels[0]

            if (this.fallingBlock.isMagicStone()){
                this.speed = this.maxSpeed

                if (topCell?.mysterious){
                    if (!this.fallingBlock.getBottomJewel().isPushDownType())
                        this.fallingBlock.rotate(this.sfx)
                } else if (!topCell){
                    if (!this.fallingBlock.getBottomJewel().isPushUpType()) 
                        this.fallingBlock.rotate(this.sfx)
                } else {
                    if (!this.fallingBlock.getBottomJewel().isClearType())
                        this.fallingBlock.rotate(this.sfx)
                }
            } else if (this.board.canClear(bottom1, bottom2, fallingTop, this.fallingBlock.col)){
                this.doNotMove = true
                this.speed = this.maxSpeed
            } else {
                this.doNotMove = false

                if (this.board.isColumnEmpty(this.fallingBlock.col)){
                    this.speed = this.maxSpeed

                    if (this.fallingBlock.colorCount === 2 && !this.fallingBlock.areTopJewelsTheSame()){
                        this.fallingBlock.rotate(this.sfx)
                    }
                } else if (++this.timesRotated < 4) {
                    this.fallingBlock.rotate(this.sfx)
                }
            }
        }

        //super.loop()
    }
}