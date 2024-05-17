import BlockGenerator from "../../block/blockGenerator";
import { Jewel, MagicStoneJewels } from "../../jewel";
import SFX from "../../sfx";
import CpuPlayer from "../cpuPlayer";

export default class Scorpion extends CpuPlayer {

    constructor(document: Document, preffix: string, sfx: SFX, blockGenerator: BlockGenerator, side: number){
        super(document, preffix, sfx, blockGenerator, side)
        this.maxSpeed -= 0.2
    }

    protected shouldPush(): boolean {
        if (this.blueScore < 10) return false
        if (this.isScared()) return true
        return this.blueScore >= 30
    }

    protected manageMagicStone(): MagicStoneJewels {
        return MagicStoneJewels.PUSH_UP
    }

    protected getMinRowForSpeeding(): number {
        return -1
    }

    protected getName(): string {
        return "Scorpion"
    }
}