import Block from "../block/block"
import ColumnStats from "./ColumnStats"

export default class BoardStats {
    private columns: ColumnStats[] = []
    private colorCount: number[] = []

    constructor(colCount: number) {
        for (let i=0; i<colCount; i++) {
            this.columns.push(new ColumnStats(i))
        }

        this.reset()
    }

    reset(){
        this.columns.forEach(c => c.reset())
        this.colorCount = Array(6).fill(0)
    }

    addOccurrences(block: Block){
        block.jewels.forEach(jw => {
            this.columns[block.col].addOccurrence(jw.color)
            if (jw.color < 6) this.colorCount[jw.color]++
        })
    }

    removeOcurrence(color: number, col: number){
        this.columns[col].removeOccurence(color)
        if (color < 6 && this.colorCount[color] > 0) this.colorCount[color]--
    }

    getMinColumnOccurrences(color: number): number[] {
        const copy = [...this.columns]

        const sorted = copy.sort((c1, c2) => c1.getOccurrences(color) - c2.getOccurrences(color))
        return sorted.slice(0,4).map(stat => stat.index)
    }

    getMaxColumnOccurrences(color: number): number[] {
        const copy = [...this.columns]
        const sorted = copy.sort((c1, c2) => c2.getOccurrences(color) - c1.getOccurrences(color))
        return sorted.map(stat => stat.index)
    }

    isPopularColor(color: number): boolean {
        let sum = 0
        this.colorCount.forEach(c => sum += c)
        return this.colorCount[color] > (sum / this.colorCount.length)
    }
}