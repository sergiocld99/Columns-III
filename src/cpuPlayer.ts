import { COLOR_VARIANTS_COUNT } from "./jewel.js";
import Player from "./player.js";

export default class CpuPlayer extends Player {
    ticks = 0

    constructor(document: Document, preffix: string, maxColors = COLOR_VARIANTS_COUNT){
        super(document, preffix, maxColors)
    }

    loop(){
        if (++this.ticks === 10){
            this.ticks = 0
            
            if (Math.random() < 0.5){
                this.fallingBlock.moveLeft(this.board)
            } else {
                this.fallingBlock.moveRight(this.board)
            }
        }

        super.loop()
    }
}