import Block from "./block";
import { Jewel } from "../jewel";
import { randInt } from "../utils";

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