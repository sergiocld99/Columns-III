import BlockGenerator from "../block/blockGenerator";
import { COLOR_VARIANTS_COUNT } from "../jewel";
import SFX from "../sfx";
import Player from "./player";

export default class ManualPlayer extends Player {
    pressingDown = false

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator){
        super(document, preffix, sfx, blockGenerator, false)

        // KEY LISTENER
        document.addEventListener("keydown", e => {
            if (e.key === "ArrowLeft") this.fallingBlock.moveLeft(this.board)
            else if (e.key === "ArrowRight") this.fallingBlock.moveRight(this.board)
            else if (e.key === "ArrowDown") this.pressingDown = true
            else if (e.key === " ") this.fallingBlock.rotate(sfx)
            else if (e.key === 'z' || e.key === 'Z') this.pushOpponent()
            else console.log(e.key)
        })

        document.addEventListener("keyup", e => {
            if (e.key === "ArrowDown") this.pressingDown = false
        })
    }

    protected stepFalling(): void {
        super.stepFalling()

        if (this.pressingDown){
            this.speed = 0.5
        } else {
            this.speed = 0.1
        }
    }

    protected shouldPush(): boolean {
        return this.blueScore >= 30
    }
}