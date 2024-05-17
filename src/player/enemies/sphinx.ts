import BlockGenerator from "../../block/blockGenerator";
import { Jewel, MagicStoneJewels } from "../../jewel";
import SFX from "../../sfx";
import CpuPlayer from "../cpuPlayer";
import PlayerStatus from "../playerStatus";

export default class Sphinx extends CpuPlayer {

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator, side: number){
        super(document, preffix, sfx, blockGenerator, side)
    }

    protected shouldPush(): boolean {
        if (this.blueScore < 10 || !this.opponent) return false
        if (this.isScared() || this.opponent.isScared()) return true
        if (this.opponent.status === PlayerStatus.FALLING_BLOCK){
            if (this.opponent.fallingBlock.isMagicStone() || this.opponent.fallingBlock.colorCount === 1){
                return true
            }
        }

        return this.blueScore >= 20
    }

    protected manageMagicStone(topCell: Jewel | null): MagicStoneJewels {
        if (this.board.hasJewelsInRow(4,0)) return MagicStoneJewels.PUSH_DOWN
        if (topCell && this.board.stats.isPopularColor(topCell.color)) return MagicStoneJewels.CLEAR
        return MagicStoneJewels.PUSH_UP
    }

    protected getMinRowForSpeeding(): number {
        return -3
    }

    protected getName(): string {
        return "Sphinx"
    }
}