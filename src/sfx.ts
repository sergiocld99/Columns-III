export default class SFX {
    stage: number

    constructor(stage: number){
        this.stage = stage
    }

    playClear(i: number){
        switch (this.stage){
            case 4:
            case 5:
                this.playDelayed(`st${this.stage}-c${i}`, 250)
                break
            default:
                this.playDelayed(`st1-c${i}`, 250)
        }
    }

    private playDelayed(name: string, delayMs: number){
        setTimeout(() => this.playSound(name), delayMs)
    }

    private playSound(name: string){
        new Audio(`sounds/${name}.mp3`).play()
    }
}