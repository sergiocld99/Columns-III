import Block from "./block.js";
import { Jewel, COLOR_VARIANTS_COUNT } from "./jewel.js";
import { randInt } from "./utils.js";

export default class NextBlock extends Block {

    constructor(){
        super(0,0)
        for (let i=0; i<3; i++) this.jewels.push(new Jewel(randInt(COLOR_VARIANTS_COUNT)))
    }
}