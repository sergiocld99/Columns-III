import Match from "./match/match.js"
import { MatchStatus } from "./match/matchStatus.js"

export default class SFX {
    stage: number
    bgm: HTMLAudioElement | null = null
    bgmInterv: number | null = null
    fadingInterv: number | null = null

    constructor(stage: number){
        this.stage = stage
    }

    playClear(i: number){
        i = Math.max(1, Math.min(i, 6))

        switch (this.stage){
            case 4:
            case 5:
                this.playDelayed(`st${this.stage}-c${i}`, 250)
                break
            default:
                this.playDelayed(`st1-c${i}`, 250)
                break
        }
    }

    playRotate(){
        this.playSound(`st${this.stage === 4 ? 4 : 1}-rotate`)
    }

    playMagicStone(){
        this.playSound("ms")
    }

    playBreak(){
        this.playSound("break1")
    }

    playNormalPush(){
        this.playSound(`st${this.stage < 4 ? 1 : this.stage}-push`)
    }

    playBigPush(){
        this.playSound("big-push")
    }

    playLose(){
        this.playSound("lose")
        this.stopBgm()
    }

    playIntro(match: Match){
        if (this.fadingInterv) clearInterval(this.fadingInterv)
        
        const intro = new Audio(`bgm/intro-0${this.stage}.mp3`)
        intro.play()

        intro.addEventListener("ended", () => {
            setTimeout(() => match.play(), 500)
        })
    }

    playBgm(match: Match){
        this.bgm = new Audio(`bgm/st-0${this.stage}.bgm`);
        this.bgm.play();

        if (this.stage === 1) this.bgm.volume = 0.5
        else if (this.stage === 4) this.bgm.volume = 0.7

        this.bgmInterv = window.setInterval(() => {
            if (this.bgm && match.status === MatchStatus.PLAYING){
                if (this.bgm.currentTime > this.bgm.duration - 1){
                    this.playBgm(match)
                    if (this.bgmInterv) clearInterval(this.bgmInterv)
                }
            }

        }, 1000)
    }

    stopBgm(){
        if (this.bgmInterv) clearInterval(this.bgmInterv)

        this.fadingInterv = window.setInterval(() => {
            if (this.bgm && this.bgm.volume > 0){
                this.bgm.volume -= 0.1
            } else {
                this.bgm?.pause()
                this.bgm = null
            }
        }, 500)
    }

    nextStage(){
        if (this.stage === 5) this.stage = 1
        else this.stage++
    }

    private playDelayed(name: string, delayMs: number){
        setTimeout(() => this.playSound(name), delayMs)
    }

    private playSound(name: string){
        new Audio(`sounds/${name}.mp3`).play()
    }
}