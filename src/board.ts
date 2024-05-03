import Block from "./block.js";
import { Jewel } from "./jewel.js";

export default class Board {
    matrix: Jewel[][]

    constructor(rows: number, cols: number){
        this.matrix = Array(rows)
        for (let i=0; i<rows; i++){
            this.matrix[i] = Array(cols).fill(null)
        }
    }

    getLastEmptyRow(col: number): number {
        let row = this.matrix.length - 1

        while (row >= 0 && this.matrix[row][col]) row--
        return row
    }

    placeBlock(block: Block){
        let r = Math.floor(block.row)
        
        for (let i=0; i<3; i++){
            if (r+i < 0) continue
            this.matrix[r+i][block.col] = block.jewels[i]
        }
    }

    draw(imgJewels: HTMLImageElement[], ctx: CanvasRenderingContext2D){
        this.matrix.forEach((row, y) => {
            row.forEach((jw, x) => {
                if (jw) {
                    jw.draw(imgJewels, ctx, y, x)
                }
            })
        })
    }
}