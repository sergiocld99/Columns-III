import BlockGenerator from "../block/blockGenerator";
import { ClearPredict } from "../clearPredict";
import { COLOR_VARIANTS_COUNT, Jewel, MagicStoneJewels } from "../jewel";
import SFX from "../sfx";
import { randInt } from "../utils";
import Player from "./player";

export default abstract class CpuPlayer extends Player {
    auxTicks = 0
    doNotMove = false
    targetCol = -1
    timesRotated = 0
    side: number

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator, side: number){
        super(document, preffix, sfx, blockGenerator, true)
        this.side = side
    }

    reset(): void {
        super.reset()
        this.doNotMove = false
        this.targetCol = -1
        this.speed = 0.10
        this.timesRotated = 0
    }

    nextFallingBlock(): void {
        super.nextFallingBlock()
        this.slowDown()
        this.doNotMove = false
        this.timesRotated = 0
        this.targetCol = -1
        
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
                if (topCell && topCell.color === targetColor && this.board.matrix[1][c] === null){
                    this.targetCol = c
                    return
                }
            }
        } else {
            // for each jewel
            for(let i=0; i<3; i++){
                let candidate = this.board.findTargetColumn(this.fallingBlock.jewels[i])
                if (candidate) {
                    this.targetCol = candidate
                    return
                }
            }
        }

        // build column candidates
        let median = this.fallingBlock.getMedianColor()
        //let 
        let candidates = this.board.stats.getMaxColumnOccurrences(median)

        // clear prediction
        let combinations = this.fallingBlock.getAllCombinations()

        for (let i=0; i<candidates.length; i++){
            for (let j=0; j<combinations.length; j++){
                let predict = this.board.predictClear(combinations[j], candidates[i])
                // do not target col 5 if col 4 height is maximum
                if (predict && !(i === 5 && this.board.matrix[4][0])) {
                    this.targetCol = candidates[i]
                    if (this.side) console.log("Can clear in column", candidates[i])
                    return
                }
            }
        }

        // find max height to avoid it
        candidates = [0,1,5,4,3,2]
        let currentHeight: number
        let minHeight = this.board.rowCount   

        candidates.forEach(col => {
            currentHeight = this.board.getColumnHeight(col)

            if (currentHeight < minHeight && this.board.matrix[2][col] === null){
                if (this.fallingBlock.colorCount === 2 && this.board.getTopCellsSameColor(col)){
                     //console.log("Not choosing column", col)
                } else {
                    minHeight = currentHeight
                    this.targetCol = col
                }   
            }
        })  

        // still no luck...
        if (this.targetCol === -1){
            this.targetCol = this.board.getLowestColumn()
            setTimeout(() => this.pushOpponent(), 500)
        }
    }

    stepFalling(){
        super.stepFalling()
        this.auxTicks++

        if (this.auxTicks >= 5 && this.fallingBlock.row > -2.5 && !this.doNotMove){
            this.auxTicks = 0

            let currentCol = this.fallingBlock.col

            if (currentCol > this.targetCol) {
                if (currentCol != 1 || this.board.matrix[2][0] === null){
                    this.fallingBlock.moveLeft(this.board)
                    this.timesRotated = 0
                }
            } else if (currentCol < this.targetCol) {
                // if (currentCol === 3 && this.board.matrix[2][4]){
                //     console.log("Column 4 avoided for", this.getName())
                // } else {
                    this.fallingBlock.moveRight(this.board)
                    this.timesRotated = 0
                    
                // }
            } else {
                this.doNotMove = true
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
                if (this.fallingBlock.colorCount === 2 && topCell?.equals(this.fallingBlock.getRepeatedJewel())){
                    if (this.fallingBlock.areBottomJewelsTheSame()){
                        this.doNotMove = true
                        this.speedUp()
                    } else this.fallingBlock.rotate()
                } else {
                    this.doNotMove = true
                    this.speedUp()
                }
            } else {
                this.doNotMove = false
                if (this.board.isColumnEmpty(this.fallingBlock.col)) this.speedUp()
                else this.slowDown()
                
                if (++this.timesRotated < 4) {
                    this.fallingBlock.rotate(this.sfx)
                } else if (this.fallingBlock.colorCount === 2 && !this.fallingBlock.areTopJewelsTheSame()){
                    this.fallingBlock.rotate(this.sfx)
                } else {
                    this.speedUp()
                }
            }
        }
    }

    private speedUp(){
        if (this.fallingBlock.row > this.getMinRowForSpeeding()){
            this.speed = this.maxSpeed / (this.poisoned ? 2 : 1)
        }
    }

    private slowDown(){
        this.speed = 0.10
    }

    drawBoard(imgJewels: HTMLImageElement[]): void {
        // show target col
        if (this.sfx.stage < 4 && this.targetCol >= 0){
            this.boardCtx.fillStyle = "#0B170F"
            this.boardCtx.fillRect(50*this.targetCol,0,50,13*50)
        }

        super.drawBoard(imgJewels)
    }

    protected abstract manageMagicStone(topCell: Jewel | null): MagicStoneJewels
    protected abstract getMinRowForSpeeding(): number
    protected abstract getName(): string
}