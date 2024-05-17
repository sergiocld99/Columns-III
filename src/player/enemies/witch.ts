import BlockGenerator from "../../block/blockGenerator";
import { Jewel, MagicStoneJewels } from "../../jewel";
import SFX from "../../sfx";
import CpuPlayer from "../cpuPlayer";

export default class Witch extends CpuPlayer {

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator, side: number){
        super(document, preffix, sfx, blockGenerator, side)
        this.maxSpeed -= 0.15
    }

    protected shouldPush(): boolean {
        return this.blueScore >= 10
    }

    protected manageMagicStone(): MagicStoneJewels {
        if (this.board.hasJewelsInRow(6,0)) return MagicStoneJewels.PUSH_DOWN
        return MagicStoneJewels.CLEAR
    }

    protected getMinRowForSpeeding(): number {
        return -1
    }

    protected getName(): string {
        return "Witch"
    }
}