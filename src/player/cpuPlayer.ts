import BlockGenerator from "../block/blockGenerator.js";
import { ClearPredict } from "../clearPredict.js";
import { COLOR_VARIANTS_COUNT, Jewel, MagicStoneJewels } from "../jewel.js";
import SFX from "../sfx.js";
import { randInt } from "../utils.js";
import Player from "./player.js";

export default abstract class CpuPlayer extends Player {
    auxTicks = 0
    doNotMove = false
    targetCol = 0
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
        this.inRisk = false
    }

    nextFallingBlock(): void {
        super.nextFallingBlock()
        this.slowDown()
        this.doNotMove = false
        this.timesRotated = 0
        this.targetCol = -1

        // is player in risk?
        if (this.board.getColumnHeight(1) > this.board.rowCount - 3){
            this.targetCol = 5
            this.inRisk = true
            return
        } else if (this.board.getColumnHeight(3) > this.board.rowCount - 3) {
            this.targetCol = 0
            this.inRisk = true
            return
        } else if (this.fallingBlock.isMagicStone()){
            this.inRisk = false
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
                if (topCell && topCell.color === targetColor && this.board.matrix[2][c] === null){
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

            if (currentHeight < minHeight && this.board.matrix[2][col] === null){
                minHeight = currentHeight
                this.targetCol = col
                //this.targetCol = col < 2 ? 5 : 0
            }
        })  

        // still no luck...
        if (this.targetCol === -1){
            this.inRisk = true
            this.targetCol = this.board.getLowestColumn()
            console.log(this.getName(), "is about to lose...")
            setTimeout(() => this.pushOpponent(), 500)
        }
    }

    stepFalling(){
        super.stepFalling()
        this.auxTicks++

        if (this.auxTicks >= 7 && this.fallingBlock.row > -2 && !this.doNotMove){
            this.auxTicks = 0

            let currentCol = this.fallingBlock.col

            if (currentCol > this.targetCol) {
                if (currentCol != 1 || this.board.matrix[2][0] === null){
                    this.fallingBlock.moveLeft(this.board)
                    this.timesRotated = 0
                }
            } else if (currentCol < this.targetCol) {
                if (currentCol === 3 && this.board.matrix[2][4]){
                    console.log("Column 4 avoided for", this.getName())
                } else {
                    this.fallingBlock.moveRight(this.board)
                    this.timesRotated = 0
                    
                }

            }
        }

        if (this.auxTicks % 5 === 0){
            let topCell = this.board.getTopCell(this.fallingBlock.col)

            if (this.fallingBlock.isMagicStone()){
                if (topCell && !topCell.mysterious) this.doNotMove = true
                this.speedUp()
                let target = this.manageMagicStone(topCell)
                if (this.fallingBlock.getBottomJewel().color != target) this.fallingBlock.rotate(this.sfx)
            } else if (this.board.canClear(this.fallingBlock)){
                this.doNotMove = true
                this.speedUp()
            } else {
                this.doNotMove = false
                if (this.board.isColumnEmpty(this.fallingBlock.col)) this.speedUp()
                else this.slowDown()
                
                if (++this.timesRotated < 4) {
                    this.fallingBlock.rotate(this.sfx)
                } else if (this.fallingBlock.colorCount === 2 && !this.fallingBlock.areTopJewelsTheSame()){
                    this.fallingBlock.rotate(this.sfx)
                }
            }
        }
    }

    private speedUp(){
        if (this.fallingBlock.row > this.getMinRowForSpeeding()){
            this.speed = this.maxSpeed
        }
    }

    private slowDown(){
        this.speed = 0.10
    }

    protected pushOpponent(): void {
        if (this.blueScore >= 20) this.inRisk = false
        super.pushOpponent()
    }

    protected abstract manageMagicStone(topCell: Jewel | null): MagicStoneJewels
    protected abstract getMinRowForSpeeding(): number
    protected abstract getName(): string
}