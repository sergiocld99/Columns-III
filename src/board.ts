import Block from "./block/block.js";
import { Jewel } from "./jewel.js";

type Cell = Jewel | null
type Position = [number, number]

export default class Board {
    matrix: Cell[][]
    toClear: Position[] = []
    currentClearCount = 0
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
        let r = Math.round(block.row)
        
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
        this.currentClearCount = 0
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

        this.currentClearCount += (count - 2)
    }

    clearRow(row: number, firstCol: number, count: number){
        for (let c=firstCol; c<firstCol+count; c++){
            this.toClear.push([row, c])
        }

        this.currentClearCount += (count - 2)
    }

    clearDescendingDiagonal(rowStart: number, colStart: number, count: number){
        for (let i=0; i<count; i++){
            this.toClear.push([rowStart+i, colStart+i])
        }

        this.currentClearCount += (count - 2)
    }

    clearAscendingDiagonal(rowStart: number, colStart: number, count: number){
        for (let i=0; i<count; i++){
            this.toClear.push([rowStart-i, colStart+i])
        }

        this.currentClearCount += (count - 2)
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

    getColumnHeight(col: number): number {
        let h = 0;
        let r = this.rowCount-1;

        // count occupied cells
        while (r >=0 && this.matrix[r][col]){
            r--
            h++
        }

        return h
    }

    isColumnEmpty(col: number): boolean {
        return this.matrix[this.rowCount-1][col] === null
    }

    getTopCell(col: number) : Cell {
        let res = null
        let r = 0

        while (res === null && r < this.rowCount){
            res = this.matrix[r][col]
            r++
        }

        return res
    }

    canClear(bottom1: Jewel, bottom2: Jewel, col: number): boolean {
        let r = 0

        while (r < this.rowCount && this.matrix[r][col] === null) r++

        if (r === this.rowCount - 1){
            // column height is 1
            let top = this.matrix[r][col]!
            if (bottom2.color === bottom1.color && bottom1.color === top.color) return true
        } else if ((r+1) < this.rowCount){
            // column height is greater than 1
            let top1 = this.matrix[r][col]!
            let top2 = this.matrix[r+1][col]!

            if (bottom1.color === top1.color){
                if (top1.color === top2.color || bottom2.color === bottom1.color) return true
            }
        }

        // check bottom row
        if (r-2 >= 0){
            if (col >= 2){
                let left1 = this.matrix[r-1][col-1]
                let left2 = this.matrix[r-1][col-2]
                let left3 = this.matrix[r-2][col-1]
                let left4 = this.matrix[r-2][col-2]

                if (left1 && left2){
                    if (left2.color === left1.color && left1.color === bottom1.color) return true
                }

                if (left3 && left4){
                    if (left4.color === left3.color && left3.color === bottom2.color) return true
                }
            }

            if (col <= this.colCount-3){
                let right1 = this.matrix[r-1][col+1]
                let right2 = this.matrix[r-1][col+2]
                let right3 = this.matrix[r-2][col+1]
                let right4 = this.matrix[r-2][col+2]

                if (right1 && right2){
                    if (right2.color === right1.color && right1.color === bottom1.color) return true
                }

                if (right3 && right4){
                    if (right4.color === right3.color && right3.color === bottom2.color) return true
                }
            }
        }

        return false
    }

    // ---- EFFECTS ----------------------

    poisonRow(rowIndex: number, withRow: Cell[]){
        const myLastRow = this.matrix[rowIndex]

        for (let c=0; c<this.colCount; c++){
            if (withRow[c] && myLastRow[c]) {
                let src: Jewel = withRow[c]!
                myLastRow[c]!.color = src.color
            }
        }
    }

    poisonColumn(colIndex: number): number {
        for (let r=this.rowCount-1; r>=0; r--){
            let dest = this.matrix[r][colIndex]
            
            if (!dest){
                let jw = new Jewel(Math.floor(Math.random() * 6))
                jw.mysterious = true
                this.matrix[r][colIndex] = jw
                return 1
            }
        }

        return 0
    }

    clearColor(color: number){
        this.matrix.forEach((row, y) => {
            row.forEach((jw, x) => {
                if (jw && jw.color === color){
                    this.toClear.push([y,x])
                    jw.clearing = true
                }
            })
        })
    }

    clearMysterious(){
        this.matrix.forEach((row, y) => {
            row.forEach((jw, x) => {
                if (jw && jw.mysterious){
                    this.toClear.push([y,x])
                    jw.clearing = true
                }
            })
        })
    }
}