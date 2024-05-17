export default class ColumnStats {
    private colorOccurrences: number[] = []
    index: number
    
    constructor(index: number){
        this.reset()
        this.index = index
    }

    reset(){
        this.colorOccurrences = Array(6).fill(0)
    }

    addOccurrence(color: number){
        if (color < 6) this.colorOccurrences[color]++
    }

    removeOccurence(color: number){
        if (color < 6) this.colorOccurrences[color]--
    }

    getOccurrences(color: number): number {
        return this.colorOccurrences[color]
    }
}