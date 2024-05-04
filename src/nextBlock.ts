import Block from "./block.js";
import { Jewel } from "./jewel.js";
import { randInt } from "./utils.js";

export default class NextBlock extends Block {

    constructor(colors: number[]){
        super(0,0)
        for (let i=0; i<3; i++) this.jewels.push(new Jewel(colors[randInt(colors.length)]))
    }

    clone() : NextBlock {
        return new NextBlock(this.getColors())
    }
}