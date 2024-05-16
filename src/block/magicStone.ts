import { Jewel } from "../jewel";
import Block from "./block";
import NextBlock from "./nextBlock";

export default class MagicStone extends NextBlock {

    constructor(){
        super()

        for (let i=0; i<3; i++){
            this.jewels.push(new Jewel(7+i))
        }
    }
}