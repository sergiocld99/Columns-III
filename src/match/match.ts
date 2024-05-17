import Player from "../player/player";
import PlayerStatus from "../player/playerStatus";
import SFX from "../sfx";
import { MatchStatus } from "./matchStatus";

export default class Match {
    status: MatchStatus
    private sfx: SFX
    private players: Player[]
    private timeInSeconds = 0

    // intervals
    private clockInterval: number | null = null

    constructor(sfx: SFX, player1: Player, player2: Player){
        this.status = MatchStatus.STARTING
        this.sfx = sfx
        this.players = [player1, player2]
    }

    start(){
        this.status = MatchStatus.STARTING
        this.sfx.playIntro(this)
        this.timeInSeconds = 0
    }

    play(){
        this.status = MatchStatus.PLAYING
        this.sfx.playBgm(this)
        this.players.forEach(p => {
            p.status = PlayerStatus.FALLING_BLOCK
            p.nextFallingBlock()
        })

        if (this.clockInterval) clearInterval(this.clockInterval)
        this.clockInterval = window.setInterval(() => {
            if (this.players[0].status != PlayerStatus.PAUSE && this.players[0].status != PlayerStatus.WAITING){
                this.timeInSeconds++
            }
        }, 1000)
    }

    reset(){
        this.players.forEach(p => p.reset())
        this.start()
    }

    // views

    getTime(): string {
        const minutes = Math.floor(this.timeInSeconds / 60)
        const seconds = Math.floor(this.timeInSeconds % 60)
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }
}