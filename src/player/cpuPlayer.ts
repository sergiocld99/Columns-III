import BlockGenerator from "../block/blockGenerator.js";
import { COLOR_VARIANTS_COUNT } from "../jewel.js";
import SFX from "../sfx.js";
import { randInt } from "../utils.js";
import Player from "./player.js";

export default class CpuPlayer extends Player {
    auxTicks = 0
    doNotMove = false
    targetCol = 0

    constructor(document: Document, preffix: string, colors: number[], sfx: SFX, blockGenerator: BlockGenerator){
        super(document, preffix, colors, sfx, blockGenerator)
    }

    nextFallingBlock(): void {
        super.nextFallingBlock()
        this.doNotMove = false

        // build column candidates
        let candidates = new Set<number>
        for (let i=0; i<4; i++) candidates.add(randInt(this.board.colCount))
        candidates.delete(2)

        // get block type
        let colorCount = this.fallingBlock.getUniqueColorCount()
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

    loop(){
        this.auxTicks++

        if (this.auxTicks >= 7 && this.fallingBlock.row > -1 && !this.doNotMove){
            this.auxTicks = 0

            let currentCol = this.fallingBlock.col
            if (currentCol === this.targetCol) this.doNotMove = true
            else if (currentCol > this.targetCol) this.fallingBlock.moveLeft(this.board)
            else this.fallingBlock.moveRight(this.board)

            // if (Math.random() < 0.5 && this.fallingBlock.col < 3){
            //     this.fallingBlock.moveLeft(this.board)
            // } else if (this.fallingBlock.col > 1) {
            //     this.fallingBlock.moveRight(this.board)
            // }
        }

        if (this.auxTicks % 5 === 0){
            let topCell = this.board.getTopCell(this.fallingBlock.col)

            if (topCell){
                if (this.fallingBlock.getBottomJewel().equals(topCell)){
                    //if (this.fallingBlock.col != 2) this.doNotMove = true
                } else {
                    //this.doNotMove = false
                    this.fallingBlock.rotate(this.sfx)
                }
            } else {
                //this.doNotMove = true

                if (!this.fallingBlock.areTopJewelsTheSame()){
                    this.fallingBlock.rotate(this.sfx)
                }
            }

            // final check
            let bottom1 = this.fallingBlock.getBottomJewel()
            let bottom2 = this.fallingBlock.getMediumJewel()

            if (this.board.canClear(bottom1, bottom2, this.fallingBlock.col)){
                this.doNotMove = true
            }
        }

        super.loop()
    }
}