// Block of 3 jewels
import { Jewel } from "../jewel";

export default abstract class Block {
    jewels: Jewel[] = []
    row: number
    col: number

    constructor(col : number, row : number){
        this.row = row
        this.col = col
    }

    draw(imgJewels: HTMLImageElement[], ctx: CanvasRenderingContext2D, bw: boolean){
        this.jewels.forEach((jw, i) => {
            jw.draw(imgJewels, ctx, this.row+i, this.col, bw)
        })
    }

    getColors(): number[] {
        return [this.jewels[0].color, this.jewels[1].color, this.jewels[2].color]
    }

    getMedianColor(): number {
        let sorted = this.jewels.sort((a,b) => a.color - b.color)
        return sorted[1].color
    }
}