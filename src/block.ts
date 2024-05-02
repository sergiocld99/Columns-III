// Block of 3 jewels

import { Jewel, COLOR_VARIANTS_COUNT } from "./jewel.js";
import { randInt } from "./utils.js";

export default class Block {
    jewels: Jewel[] = []
    row = 0
    col: number

    constructor(col = 0, nextBlock: Block | null = null){
        if (nextBlock){
            nextBlock.jewels.forEach(j => this.jewels.push(j))
        } else {
            for (let i=0; i<3; i++) this.jewels.push(new Jewel(randInt(COLOR_VARIANTS_COUNT)))
        }

        this.col = col
    }

    draw(imgJewels: HTMLImageElement[], ctx: CanvasRenderingContext2D, w: number, h: number){
        ctx.clearRect(0,0,w,h)

        this.jewels.forEach((jw, i) => {
            jw.draw(imgJewels, ctx, this.row+i, this.col)
        })
    }

    rotate(){
        this.jewels = [this.jewels[2], this.jewels[0], this.jewels[1]]    
    }

    moveLeft(){
        if (this.col > 0) this.col--
    }

    moveRight(boardCols: number){
        if (this.col < boardCols-1) this.col++
    }
}