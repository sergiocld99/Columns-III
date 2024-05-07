import BlockGenerator from "../../block/blockGenerator.js";
import { Jewel } from "../../jewel.js";
import SFX from "../../sfx.js";
import CpuPlayer from "../cpuPlayer.js";

export default class Mommy extends CpuPlayer {

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator){
        super(document, preffix, sfx, blockGenerator)
        this.maxSpeed -= 0.1
    }

    protected shouldPush(): boolean {
        if (this.blueScore < 10) return false
        if (this.inRisk) return true
        return this.blueScore >= 20
    }

    protected manageMagicStone(): void {
        if (this.board.getColumnHeight(this.fallingBlock.col) <= 4){
            if (!this.fallingBlock.getBottomJewel().isPushUpType()) 
                this.fallingBlock.rotate(this.sfx)
        } else if (this.blueScore < 5){
            if (!this.fallingBlock.getBottomJewel().isPushDownType())
                this.fallingBlock.rotate(this.sfx)

        } else {
            if (!this.fallingBlock.getBottomJewel().isClearType())
                this.fallingBlock.rotate(this.sfx)

        }
    }

    protected getMinRowForSpeeding(): number {
        return -1
    }
}