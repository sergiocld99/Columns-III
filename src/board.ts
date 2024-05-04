import Block from "./block.js";
import { Jewel } from "./jewel.js";

type Cell = Jewel | null
type Position = [number, number]

export default class Board {
    matrix: Cell[][]
    toClear: Position[] = []

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

    placeBlock(block: Block): boolean {
        let r = Math.floor(block.row)
        
        for (let i=0; i<3; i++){
            if (r+i < 0) return false
            this.matrix[r+i][block.col] = block.jewels[i]
        }

        return true
    }

    // ---- AFTER BLOCK PLACED ----------------------------

    /**
     * 
     * @param cols array of columns to check
     * @param rows array of rows to check
     * @returns should check again
     */
    check(cols: number[], rows: number[]) : boolean {
        cols.forEach(c => this.checkColumn(c))
        rows.forEach(r => this.checkRow(r))
        
        let checkAgain = this.toClear.length > 0
        this.toClear.forEach(pos => this.matrix[pos[0]][pos[1]] = null)
        this.toClear = []
        this.applyGravityEverywhere()

        return checkAgain
    }

    checkEverything() : boolean {
        const colsCount = this.matrix[0].length
        const rowsCount = this.matrix.length
        
        for (let c=0; c<colsCount; c++){
            this.checkColumn(c)
        }

        for (let r=0; r<rowsCount; r++){
            this.checkRow(r)
        }

        let checkAgain = this.toClear.length > 0
        this.toClear.forEach(pos => this.matrix[pos[0]][pos[1]] = null)
        this.toClear = []
        this.applyGravityEverywhere()

        return checkAgain
    }

    checkColumn(col: number) {
        let lastJewel = this.matrix[this.matrix.length-1][col]
        if (!lastJewel) return

        let currentJewel: Cell
        let jewelsInRow = 1
        let r

        for (r=this.matrix.length-2; r>=0; r--){
            currentJewel = this.matrix[r][col]

            // if cell is empty, finish checking
            if (!currentJewel) break
            
            // compare to previous jewel
            if (lastJewel.equals(currentJewel)) jewelsInRow++
            else {
                // clear jewels if there are at least 3 in row
                if (jewelsInRow >= 3) this.clearColumn(col, r+1, jewelsInRow)

                lastJewel = currentJewel
                jewelsInRow = 1
            }
            
        }

        // final checking
        if (jewelsInRow >= 3){
            this.clearColumn(col, r+1, jewelsInRow)
        }
    }

    checkRow(r: number){
        let row: Cell[] = this.matrix[r]
        let lastJewel: Cell = row[0]
        let jewelsInRow = lastJewel ? 1 : 0
        let currentJewel
        let c: number

        for (c=1; c<row.length; c++){
            currentJewel = row[c]
            
            if (!currentJewel){
                // cell is empty
                if (jewelsInRow >= 3) this.clearRow(r,c-jewelsInRow,jewelsInRow)
                jewelsInRow = 0
                lastJewel = null
            } else if (!lastJewel){
                // cell is not empty, but previous was
                jewelsInRow++
                lastJewel = currentJewel
            } else if (currentJewel.equals(lastJewel)){
                // jewel same than previous
                jewelsInRow++
            } else {
                // jewel different than previous
                if (jewelsInRow >= 3) this.clearRow(r, c-jewelsInRow, jewelsInRow)
                jewelsInRow = 1
                lastJewel = currentJewel
            }
        }

        // final checking
        if (jewelsInRow >= 3){
            this.clearRow(r, c-jewelsInRow, jewelsInRow)
        }
    }

    clearColumn(col: number, topRow: number, count: number){
        // clear jewels
        for (let i=0; i<count; i++){
            //this.matrix[topRow+i][col] = null
            this.toClear.push([topRow+i, col])
        }

        // apply gravity
        //this.applyGravity(col, topRow-1, count)
    }

    clearRow(row: number, firstCol: number, count: number){
        // clear jewels
        for (let c=firstCol; c<firstCol+count; c++){
            //this.matrix[row][c] = null
            //this.applyGravity(c, row-1, 1)
            this.toClear.push([row, c])
        }
    }

    applyGravity(col: number, bottomRow: number, spaces: number){
        let src: Cell

        for (let r=bottomRow; r>=0; r--){
            src = this.matrix[r][col]
            this.matrix[r][col] = null
            this.matrix[r+spaces][col] = src
        }
    }

    applyGravityEverywhere(){
        const cols = this.matrix[0].length
        const bottomRow = this.matrix.length - 1

        for (let c=0; c<cols; c++){
            let spaces = 0
            let temp: Cell
            
            for (let r=bottomRow; r>=0; r--){
                if (this.matrix[r][c] === null) spaces++
                else if (spaces > 0){
                    // apply gravity to jewel
                    temp = this.matrix[r][c]
                    this.matrix[r+spaces][c] = temp
                    this.matrix[r][c] = null
                }
            }
        }
    }

    // ----------------------------------------------------

    draw(imgJewels: HTMLImageElement[], ctx: CanvasRenderingContext2D){
        this.matrix.forEach((row, y) => {
            row.forEach((jw, x) => {
                if (jw) {
                    jw.draw(imgJewels, ctx, y, x)
                }
            })
        })
    }

    reset(){
        this.matrix.forEach(row => {
            for (let c=0; c<row.length; c++){
                row[c] = null
            }
        })
    }
}