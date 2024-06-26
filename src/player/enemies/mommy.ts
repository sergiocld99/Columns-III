import BlockGenerator from "../../block/blockGenerator";
import { Jewel, MagicStoneJewels } from "../../jewel";
import SFX from "../../sfx";
import CpuPlayer from "../cpuPlayer";

export default class Mommy extends CpuPlayer {

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator, side: number){
        super(document, preffix, sfx, blockGenerator, side)
        this.maxSpeed -= 0.1
    }

    protected shouldPush(): boolean {
        if (this.blueScore < 10) return false
        if (this.isScared()) return true
        return this.blueScore >= 20
    }

    protected manageMagicStone(topCell: Jewel | null): MagicStoneJewels {
        if (this.board.hasJewelsInRow(6,0)) return MagicStoneJewels.PUSH_DOWN
        if (topCell && this.board.stats.isPopularColor(topCell.color)) return MagicStoneJewels.CLEAR
        return MagicStoneJewels.PUSH_UP
    }

    protected getMinRowForSpeeding(): number {
        return -1
    }

    protected getName(): string {
        return "Mommy"
    }
}