export default class SFX {
    stage: number

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

    playSummonArrow(){
        this.playSound("arrow")
    }

    playBreak(){
        this.playSound("break1")
    }

    playNormalPush(){
        this.playSound(`st${this.stage}-push`)
    }

    playBigPush(){
        this.playSound("big-push")
    }

    playBgm(){
        const bgm = new Audio(`bgm/st-0${this.stage}.bgm`);
        bgm.play();

        let interv = window.setInterval(() => {
            if (bgm.currentTime > bgm.duration - 1){
                this.playBgm()
                clearInterval(interv)
            }
        }, 1000)
    }

    private playDelayed(name: string, delayMs: number){
        setTimeout(() => this.playSound(name), delayMs)
    }

    private playSound(name: string){
        new Audio(`sounds/${name}.mp3`).play()
    }
}