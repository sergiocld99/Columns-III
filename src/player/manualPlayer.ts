import BlockGenerator from "../block/blockGenerator.js";
import { COLOR_VARIANTS_COUNT } from "../jewel.js";
import SFX from "../sfx.js";
import Player from "./player.js";

export default class ManualPlayer extends Player {

    constructor(document: Document, preffix: string, colors: number[], sfx: SFX, blockGenerator: BlockGenerator){
        super(document, preffix, colors, sfx, blockGenerator)

        // KEY LISTENER
        document.addEventListener("keydown", e => {
            if (e.key === "ArrowLeft") this.fallingBlock.moveLeft(this.board)
            else if (e.key === "ArrowRight") this.fallingBlock.moveRight(this.board)
            else if (e.key === " ") this.fallingBlock.rotate(sfx)
            else console.log(e.key)
        })
    }
}