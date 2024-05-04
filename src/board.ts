import Block from "./block.js";
import { Jewel } from "./jewel.js";

type Cell = Jewel | null
type Position = [number, number]

export default class Board {
    matrix: Cell[][]
    toClear: Position[] = []
    rowCount: number
    colCount: number

    constructor(rows: number, cols: number){
        this.rowCount = rows
        this.colCount = cols

        this.matrix = Array(rows)
        for (let i=0; i<rows; i++){
            this.matrix[i] = Array(cols).fill(null)
        }
    }

    getLastEmptyRow(col: number): number {
        let row = this.rowCount - 1

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

    clearPending() {
        this.toClear.forEach(pos => this.matrix[pos[0]][pos[1]] = null)
        this.toClear = []
        this.applyGravityEverywhere()
    }

    checkEverything() : boolean {        
        for (let c=0; c<this.colCount; c++){
            this.checkColumn(c)
            this.checkDescendingDiagonal(0,c)
            this.checkAscendingDiagonal(this.rowCount-1,c)
        }

        for (let r=0; r<this.rowCount; r++) this.checkRow(r)
        for (let r=1; r<this.rowCount; r++) this.checkDescendingDiagonal(r,0)
        for (let r=this.rowCount-2; r>=0; r--) this.checkAscendingDiagonal(r,0)

        this.toClear.forEach(pos => this.matrix[pos[0]][pos[1]]!.clearing = true)
        return this.toClear.length > 0
    }

    checkColumn(col: number) {
        let lastJewel = this.matrix[this.rowCount-1][col]
        if (!lastJewel) return

        let currentJewel: Cell
        let jewelsInRow = 1
        let r

        for (r=this.rowCount-2; r>=0; r--){
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
        let currentJewel: Cell
        let c: number

        for (c=1; c<this.colCount; c++){
            currentJewel = row[c]
            
            if (currentJewel === null){
                // cell is empty
                if (jewelsInRow >= 3) this.clearRow(r,c-jewelsInRow,jewelsInRow)
                jewelsInRow = 0
            } else if (lastJewel === null || currentJewel.equals(lastJewel)){
                // cell is not empty, but previous was
                // or jewel color is the same than previous
                jewelsInRow++
            } else {
                // jewel different than previous
                if (jewelsInRow >= 3) this.clearRow(r, c-jewelsInRow, jewelsInRow)
                jewelsInRow = 1
            }

            lastJewel = currentJewel
        }

        // final checking
        if (jewelsInRow >= 3){
            this.clearRow(r, c-jewelsInRow, jewelsInRow)
        }
    }

    checkDescendingDiagonal(r: number, c: number){
        let lastJewel = this.matrix[r][c]
        let jewelsInRow = lastJewel ? 1 : 0
        let currentJewel: Cell
        r++
        c++

        while (r < this.rowCount && c < this.colCount){
            currentJewel = this.matrix[r][c]

            if (currentJewel === null){
                if (jewelsInRow >= 3) this.clearDescendingDiagonal(r-jewelsInRow, c-jewelsInRow, jewelsInRow)
                jewelsInRow = 0
            } else if (lastJewel === null || currentJewel.equals(lastJewel)){
                jewelsInRow++
            } else {
                if (jewelsInRow >= 3) this.clearDescendingDiagonal(r-jewelsInRow, c-jewelsInRow, jewelsInRow)
                jewelsInRow = 1
            }

            lastJewel = currentJewel
            r++
            c++
        }

        // final checking
        if (jewelsInRow >= 3){
            this.clearDescendingDiagonal(r-jewelsInRow, c-jewelsInRow, jewelsInRow)
        }
    }

    checkAscendingDiagonal(r: number, c: number){
        let lastJewel = this.matrix[r][c]
        let jewelsInRow = lastJewel ? 1 : 0
        let currentJewel: Cell
        r--
        c++

        while (r >= 0 && c < this.colCount){
            currentJewel = this.matrix[r][c]

            if (currentJewel === null){
                if (jewelsInRow >= 3) this.clearAscendingDiagonal(r+jewelsInRow, c-jewelsInRow, jewelsInRow)
                jewelsInRow = 0
            } else if (lastJewel === null || currentJewel.equals(lastJewel)){
                jewelsInRow++
            } else {
                if (jewelsInRow >= 3) this.clearAscendingDiagonal(r+jewelsInRow, c-jewelsInRow, jewelsInRow)
                jewelsInRow = 1
            }

            lastJewel = currentJewel
            r--
            c++
        }

        // final checking
        if (jewelsInRow >= 3){
            this.clearAscendingDiagonal(r+jewelsInRow, c-jewelsInRow, jewelsInRow)
        }
    }

    clearColumn(col: number, topRow: number, count: number){
        for (let i=0; i<count; i++){
            this.toClear.push([topRow+i, col])
        }
    }

    clearRow(row: number, firstCol: number, count: number){
        for (let c=firstCol; c<firstCol+count; c++){
            this.toClear.push([row, c])
        }
    }

    clearDescendingDiagonal(rowStart: number, colStart: number, count: number){
        for (let i=0; i<count; i++){
            this.toClear.push([rowStart+i, colStart+i])
        }
    }

    clearAscendingDiagonal(rowStart: number, colStart: number, count: number){
        for (let i=0; i<count; i++){
            this.toClear.push([rowStart-i, colStart+i])
        }
    }

    applyGravityEverywhere(){
        const bottomRow = this.rowCount - 1

        for (let c=0; c<this.colCount; c++){
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

    draw(imgJewels: HTMLImageElement[], ctx: CanvasRenderingContext2D, ticks: number){
        this.matrix.forEach((row, y) => {
            row.forEach((jw, x) => {
                if (jw && (ticks % 10 < 5 || jw.clearing === false)) {
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

        this.toClear = []
    }

    // ---- CPU STRATEGIES ----------------

    getTopCell(col: number) : Cell {
        let res = null
        let r = 0

        while (res === null && r < this.rowCount){
            res = this.matrix[r][col]
            r++
        }

        return res
    }
}