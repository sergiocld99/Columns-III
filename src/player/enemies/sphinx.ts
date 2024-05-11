import BlockGenerator from "../../block/blockGenerator.js";
import { Jewel, MagicStoneJewels } from "../../jewel.js";
import SFX from "../../sfx.js";
import CpuPlayer from "../cpuPlayer.js";
import PlayerStatus from "../playerStatus.js";

export default class Sphinx extends CpuPlayer {

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator){
        super(document, preffix, sfx, blockGenerator)
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
        if (this.isScared()) return MagicStoneJewels.CLEAR

        if (this.board.getColumnHeight(this.fallingBlock.col) <= 4 || this.opponent?.isScared()){
            return MagicStoneJewels.PUSH_UP
        } else if (topCell?.mysterious){
            return MagicStoneJewels.PUSH_DOWN
        } else {
            return MagicStoneJewels.CLEAR
        }
    }

    protected getMinRowForSpeeding(): number {
        return -3
    }

    protected getName(): string {
        return "Sphinx"
    }
}