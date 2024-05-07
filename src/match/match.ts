import Player from "../player/player.js";
import PlayerStatus from "../player/playerStatus.js";
import SFX from "../sfx.js";
import { MatchStatus } from "./matchStatus.js";

export default class Match {
    private status: MatchStatus
    private sfx: SFX
    private players: Player[]

    constructor(sfx: SFX, player1: Player, player2: Player){
        this.status = MatchStatus.STARTING
        this.sfx = sfx
        this.players = [player1, player2]
    }

    start(){
        this.sfx.playIntro(this)
    }

    play(){
        this.status = MatchStatus.PLAYING
        this.sfx.playBgm()
        this.players.forEach(p => {
            p.status = PlayerStatus.FALLING_BLOCK
            p.nextFallingBlock()
        })
    }
}