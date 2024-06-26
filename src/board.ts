import Block from "./block/block";
import FallingBlock from "./block/fallingBlock";
import { ClearPredict } from "./clearPredict";
import { Jewel } from "./jewel";
import JewelOutside from "./jewelOutside";
import BoardStats from "./stats/BoardStats";

type Cell = Jewel | null
type Position = [number, number]

export default class Board {
    matrix: Cell[][]
    toClear: Position[] = []
    currentClearCount = 0
    rowCount: number
    colCount: number
    jewelsOutside: JewelOutside[] = []
    stats: BoardStats

    constructor(rows: number, cols: number){
        this.rowCount = rows
        this.colCount = cols
        this.matrix = Array(rows)
        this.stats = new BoardStats(cols)

        for (let i=0; i<rows; i++){
            this.matrix[i] = Array(cols).fill(null)
        }
    }

    getLastEmptyRow(col: number): number {
        let row = this.rowCount - 1

        while (row >= 0 && this.matrix[row][col]) row--
        return row
    }

    placeBlock(block: FallingBlock): boolean {
        let r = Math.round(block.row)

        if (block.isMagicStone()){
            for (let i=2; i>=0; i--){
                if (r+i >= 0){
                    this.matrix[r+i][block.col] = block.jewels[i]
                    block.jewels[i].clearing = true
                    this.toClear.push([r+i, block.col])
                } else if (i === 2){
                    // no block was placed
                    return false
                }
            }
        } else {
            // from bottom to top
            for (let i=2; i>=0; i--){
                //if (r+i < 0) return false
                if (r+i < 0) this.jewelsOutside.push(new JewelOutside(block.jewels[i].color, block.col))
                else this.matrix[r+i][block.col] = block.jewels[i]
            }
        }

        this.stats.addOccurrences(block)
        return this.jewelsOutside.length < 3
    }

    // ---- AFTER BLOCK PLACED ----------------------------

    clearPending() : boolean {
        this.toClear.forEach(pos => {
            let color = this.matrix[pos[0]][pos[1]]?.color
            if (color) this.stats.removeOcurrence(color, pos[1])
            this.matrix[pos[0]][pos[1]] = null
        })
        this.toClear = []
        this.currentClearCount = 0
        return this.applyGravityEverywhere()
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

        this.toClear.forEach(pos => this.matrix[pos[0]][pos[1]]?.setClearing())
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
                if (jewelsInRow >= 3) this.clearColumn(col, r+1, jewelsInRow, lastJewel)

                lastJewel = currentJewel
                jewelsInRow = 1
            }
            
        }

        // final checking
        if (jewelsInRow >= 3){
            this.clearColumn(col, r+1, jewelsInRow, lastJewel)
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

    clearColumn(col: number, topRow: number, count: number, jw: Jewel){
        for (let i=0; i<count; i++){
            this.toClear.push([topRow+i, col])
        }

        if (!jw.isMagicStoneType()) this.currentClearCount += (count - 2)
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

    private applyGravityEverywhere(): boolean {
        const bottomRow = this.rowCount - 1

        // add jewels that were outside
        // array is ordered from bottom to top
        this.jewelsOutside.forEach((jo, i) => {
            let r = this.jewelsOutside.length-i-1
            if (this.matrix[r][jo.column] === null){
                this.matrix[r][jo.column] = new Jewel(jo.color)
            } else {
                return false
            }
        })

        // clear jewels outside
        this.jewelsOutside = []

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

        return true
    }

    // ----------------------------------------------------

    hasJewelsInRow(r: number, offset: number): boolean {
        for (let c=offset; c<this.colCount-offset; c++){
            if (this.matrix[r][c]) return true
        }

        return false
    }

    draw(imgJewels: HTMLImageElement[], ctx: CanvasRenderingContext2D, ticks: number, bw: boolean){
        this.matrix.forEach((row, y) => {
            row.forEach((jw, x) => {
                if (jw && (ticks % 10 < 5 || jw.clearing === false)) {
                    jw.draw(imgJewels, ctx, y, x, bw)
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
        this.jewelsOutside = []
        this.stats.reset()
        this.currentClearCount = 0
    }

    // ---- CPU STRATEGIES ----------------

    getLowestColumn(): number {
        let minHeight = this.getColumnHeight(2) + 2
        let currHeight: number
        let bestCol = 2
        let candidates = [0,1,3,4,5]

        candidates.forEach(c => {
            currHeight = this.getColumnHeight(c)
            if (currHeight < minHeight){
                minHeight = currHeight
                bestCol = c
            }
        })

        return bestCol
    }

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

    getPonderedColumnHeight(col: number): number {
        let h = this.getColumnHeight(col)
        
        switch (col) {
            case 2:
                return h + 11
            case 1:
            case 3:
                return h + 7
            case 0:
            case 4:
                return h + 3
            default:
                return h
        }
    }

    isColumnEmpty(col: number): boolean {
        return this.matrix[this.rowCount-1][col] === null
    }

    getTopCell(col: number) : Cell {
        let res = null
        let r = 0

        // from top to bottom
        while (r < this.rowCount && (res === null || res.isMagicStoneType())){
            res = this.matrix[r][col]
            r++
        }

        return res
    }

    getTopCellsSameColor(col: number): Cell {
        let res = null
        let r = 0

        // from top to bottom
        while (r < this.rowCount){
            let aux = this.matrix[r][col]
            
            if (aux){
                if (res === null) res = aux
                else if (res.color === aux.color) return res
                else return null
            }

            r++
        }

        return null
    }

    findTargetColumn(jw: Jewel): number | null {
        for (let c=0; c<this.colCount; c++){
            let curr = this.getTopCellsSameColor(c)
            if (curr && curr.equals(jw)) return c
        }

        return null
    }

    predictClear(fallingBlock: FallingBlock, col: number): ClearPredict | null {
        const originalCol = fallingBlock.col
        fallingBlock.col = col
        const res = this.canClear(fallingBlock)
        fallingBlock.col = originalCol
        return res
    }

    canClear(fallingBlock: FallingBlock): ClearPredict | null {
        if (fallingBlock.col === 2){
            if (this.matrix[1][2]){
                //console.log("Avoiding immediate lose at column 2...")
                return null
            }
        }

        //if (fallingBlock.colorCount === 1) return ClearPredict.COLUMN

        const bottom1 = fallingBlock.getBottomJewel()
        const bottom2 = fallingBlock.getMediumJewel()
        const topJw = fallingBlock.jewels[0]
        const col = fallingBlock.col
        let r = 0

        while (r < this.rowCount && this.matrix[r][col] === null) r++

        if (r === this.rowCount - 1){
            // column height is 1
            let top = this.matrix[r][col]!
            if (this.willClear(bottom2, bottom1, top)) return ClearPredict.COLUMN
        } else if ((r+1) < this.rowCount){
            // column height is greater than 1
            let top1 = this.matrix[r][col]!
            let top2 = this.matrix[r+1][col]!

            if (bottom1.color === top1.color){
                if (top1.color === top2.color || bottom2.color === bottom1.color) return ClearPredict.COLUMN
            }
        }

        // check bottom row
        if (r-4 >= 0){
            if (col >= 2){
                if (this.willClear(this.matrix[r-1][col-2], this.matrix[r-1][col-1], bottom1)) return ClearPredict.ROW
                if (this.willClear(this.matrix[r-2][col-2], this.matrix[r-2][col-1], bottom2)) return ClearPredict.ROW
                if (this.willClear(this.matrix[r-3][col-2], this.matrix[r-3][col-1], topJw)) return ClearPredict.ROW
                
                // diagonal up (<--)
                if (this.willClear(this.matrix[r-3][col-2], this.matrix[r-2][col-1], bottom1)) return ClearPredict.DIAGONAL_LEFT
                if (this.willClear(this.matrix[r-4][col-2], this.matrix[r-3][col-1], bottom2)) return ClearPredict.DIAGONAL_LEFT

                // diagonal down (<--)
                if (r+1 < this.rowCount){
                    if (this.willClear(this.matrix[r+1][col-2], this.matrix[r][col-1], bottom1)) return ClearPredict.DIAGONAL_LEFT
                    if (this.willClear(this.matrix[r][col-2], this.matrix[r-1][col-1], bottom2)) return ClearPredict.DIAGONAL_LEFT
                    if (this.willClear(this.matrix[r-1][col-2], this.matrix[r-2][col-1], topJw)) return ClearPredict.DIAGONAL_LEFT
                }
            }

            if (col <= this.colCount-3){
                if (this.willClear(this.matrix[r-1][col+2], this.matrix[r-1][col+1], bottom1)) return ClearPredict.ROW
                if (this.willClear(this.matrix[r-2][col+2], this.matrix[r-2][col+1], bottom2)) return ClearPredict.ROW
                if (this.willClear(this.matrix[r-3][col+2], this.matrix[r-3][col+1], topJw)) return ClearPredict.ROW
                
                // diagonal up (-->)
                if (this.willClear(this.matrix[r-3][col+2], this.matrix[r-2][col+1], bottom1)) return ClearPredict.DIAGONAL_RIGHT
                if (this.willClear(this.matrix[r-4][col+2], this.matrix[r-3][col+1], bottom2)) return ClearPredict.DIAGONAL_RIGHT

                // diagonal down (-->)
                if (r+1 < this.rowCount){
                    if (this.willClear(this.matrix[r+1][col+2], this.matrix[r][col+1], bottom1)) return ClearPredict.DIAGONAL_RIGHT
                    if (this.willClear(this.matrix[r][col+2], this.matrix[r-1][col+1], bottom2)) return ClearPredict.DIAGONAL_RIGHT
                    if (this.willClear(this.matrix[r-1][col+2], this.matrix[r-2][col+1], topJw)) return ClearPredict.DIAGONAL_RIGHT
                }
            }

            if (col > 0 && col < this.colCount - 1){
                if (this.willClear(this.matrix[r-1][col-1], bottom1, this.matrix[r-1][col+1])) return ClearPredict.ROW
                if (this.willClear(this.matrix[r-2][col-1], bottom2, this.matrix[r-2][col+1])) return ClearPredict.ROW
                
                // diagonals
                if (this.willClear(this.matrix[r-3][col-1], bottom2, this.matrix[r-1][col+1])) return ClearPredict.DIAGONAL
                if (this.willClear(this.matrix[r-1][col-1], bottom2, this.matrix[r-3][col+1])) return ClearPredict.DIAGONAL

                if (r < this.rowCount){
                    if (this.willClear(this.matrix[r-2][col-1], bottom1, this.matrix[r][col+1])) return ClearPredict.DIAGONAL
                    if (this.willClear(this.matrix[r][col-1], bottom1, this.matrix[r-2][col+1])) return ClearPredict.DIAGONAL
                }
            }
        }

        return null
    }

    private willClear(c1: Cell, c2: Cell, c3: Cell){
        if (c1 && c2 && c3) return c1.color === c2.color && c2.color === c3.color
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

    removeColumn(col: number){
        for (let r=0; r<this.rowCount; r++){
            let cell = this.matrix[r][col]

            if (cell && !cell.isMagicStoneType()){
                this.matrix[r][col] = null
            }
            
        }
    }
}