import { Jewel } from "./jewel";

export default class JewelOutside extends Jewel {
    column: number

    constructor(color: number, column: number){
        super(color)
        this.column = column
    }
}