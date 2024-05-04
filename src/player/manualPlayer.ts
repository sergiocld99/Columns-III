import { COLOR_VARIANTS_COUNT } from "../jewel.js";
import Player from "./player.js";

export default class ManualPlayer extends Player {

    constructor(document: Document, preffix: string, colors: number[]){
        super(document, preffix, colors)

        // KEY LISTENER
        document.addEventListener("keydown", e => {
            if (e.key === "ArrowLeft") this.fallingBlock.moveLeft(this.board)
            else if (e.key === "ArrowRight") this.fallingBlock.moveRight(this.board)
            else if (e.key === " ") this.fallingBlock.rotate()
            else console.log(e.key)
        })
    }
}