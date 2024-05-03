import Block from "./block.js";

export default class FallingBlock extends Block {

    constructor(nextBlock: Block){
        super(2, -3)
        nextBlock.jewels.forEach(j => this.jewels.push(j))
    }

    rotate(){
        this.jewels = [this.jewels[2], this.jewels[0], this.jewels[1]]    
    }

    moveLeft(){
        if (this.col > 0) this.col--
    }

    moveRight(boardCols: number){
        if (this.col < boardCols-1) this.col++
    }
}