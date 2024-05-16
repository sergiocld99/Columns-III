import BlockGenerator from "../../block/blockGenerator";
import { Jewel, MagicStoneJewels } from "../../jewel";
import SFX from "../../sfx";
import CpuPlayer from "../cpuPlayer";

export default class Mommy extends CpuPlayer {

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator){
        super(document, preffix, sfx, blockGenerator)
        this.maxSpeed -= 0.1
    }

    protected shouldPush(): boolean {
        if (this.blueScore < 10) return false
        if (this.isScared()) return true
        return this.blueScore >= 20
    }

    protected manageMagicStone(topCell: Jewel | null): MagicStoneJewels {
        if (this.board.getColumnHeight(this.fallingBlock.col) <= 4){
            return MagicStoneJewels.PUSH_UP
        } else if (topCell?.mysterious){
            return MagicStoneJewels.PUSH_DOWN
        } else {
            return MagicStoneJewels.CLEAR
        }
    }

    protected getMinRowForSpeeding(): number {
        return -1
    }

    protected getName(): string {
        return "Mommy"
    }
}