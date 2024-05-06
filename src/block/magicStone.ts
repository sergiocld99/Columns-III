import { Jewel } from "../jewel.js";
import Block from "./block.js";
import NextBlock from "./nextBlock.js";

export default class MagicStone extends NextBlock {

    constructor(){
        super()

        for (let i=0; i<3; i++){
            this.jewels.push(new Jewel(7+i))
        }
    }
}