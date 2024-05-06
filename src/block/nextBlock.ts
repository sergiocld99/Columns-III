import Block from "./block.js";
import { Jewel } from "../jewel.js";
import { randInt } from "../utils.js";

export default class NextBlock extends Block {

    constructor(colors: number[] = []){
        super(0,0)
        if (colors.length){
            for (let i=0; i<3; i++) this.jewels.push(new Jewel(colors[randInt(colors.length)]))
        }
    }

    clone() : NextBlock {
        let copy = new NextBlock()
        this.getColors().forEach(c => copy.jewels.push(new Jewel(c)))
        return copy
    }
}