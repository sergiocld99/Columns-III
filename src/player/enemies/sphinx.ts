import BlockGenerator from "../../block/blockGenerator.js";
import { Jewel } from "../../jewel.js";
import SFX from "../../sfx.js";
import CpuPlayer from "../cpuPlayer.js";

export default class Sphinx extends CpuPlayer {

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator){
        super(document, preffix, sfx, blockGenerator)
    }

    protected shouldPush(): boolean {
        if (this.blueScore < 10) return false
        return this.blueScore >= (this.inRisk || this.opponent?.fallingBlock.isMagicStone() ? 10 : 20)
    }

    protected manageMagicStone(topCell: Jewel | null): void {
        if (this.inRisk || topCell?.mysterious){
            if (!this.fallingBlock.getBottomJewel().isClearType())
                this.fallingBlock.rotate(this.sfx)
        } else if (this.board.getColumnHeight(this.fallingBlock.col) < 7){
            if (!this.fallingBlock.getBottomJewel().isPushUpType()) 
                this.fallingBlock.rotate(this.sfx)
        } else {
            if (!this.fallingBlock.getBottomJewel().isPushDownType())
                this.fallingBlock.rotate(this.sfx)
        }
    }
}