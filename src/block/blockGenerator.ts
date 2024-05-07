import Block from "./block.js"
import NextBlock from "./nextBlock.js"

export default class BlockGenerator {
    private colors: number[]
    private blocks: NextBlock[] = []

    constructor(colors: number[]){
        this.colors = colors
        this.reset()
    }

    reset(){
        this.blocks = []

        for (let i=0; i<100; i++){
            this.blocks.push(new NextBlock(this.colors))
        }
    }

    getCopy(index: number): NextBlock {
        return this.blocks[index % this.blocks.length].clone()
    }
}