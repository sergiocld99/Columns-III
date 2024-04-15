// Block of 3 jewels

import { Jewel, COLOR_VARIANTS_COUNT } from "./jewel.js";
import { randInt } from "./utils.js";

export default class Block {
    jewels: Jewel[] = []

    constructor(){
        for (let i=0; i<3; i++) this.jewels.push(new Jewel(randInt(COLOR_VARIANTS_COUNT)))
    }

    draw(imgJewels: HTMLImageElement[], ctx: CanvasRenderingContext2D, w: number, h: number){
        ctx.clearRect(0,0,w,h)

        this.jewels.forEach((jw, i) => {
            jw.draw(imgJewels, ctx, i, 0)
        })
    }
}