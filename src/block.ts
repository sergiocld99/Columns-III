// Block of 3 jewels
import { Jewel } from "./jewel.js";

export default abstract class Block {
    jewels: Jewel[] = []
    row: number
    col: number

    constructor(col : number, row : number){
        this.row = row
        this.col = col
    }

    draw(imgJewels: HTMLImageElement[], ctx: CanvasRenderingContext2D){
        this.jewels.forEach((jw, i) => {
            jw.draw(imgJewels, ctx, this.row+i, this.col)
        })
    }

    getColors(): number[] {
        return [this.jewels[0].color, this.jewels[1].color, this.jewels[2].color]
    }
}