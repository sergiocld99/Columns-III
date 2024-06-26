// Jewel, 6 color variants
export const COLOR_VARIANTS_COUNT = 6
export const enum MagicStoneJewels { PUSH_UP = 7, CLEAR, PUSH_DOWN }

export class Jewel {
    color: number
    clearing = false
    mysterious = false

    constructor(color: number){
        this.color = color
    }

    setClearing(){
        this.clearing = true
    }

    equals(other: Jewel) : boolean {
        return other && other.color === this.color
    }

    isMagicStoneType(){
        return this.color >= 7 && this.color <= 9
    }

    isPushUpType(){
        return this.color === MagicStoneJewels.PUSH_UP
    }

    isClearType(){
        return this.color === MagicStoneJewels.CLEAR
    }

    isPushDownType(){
        return this.color === MagicStoneJewels.PUSH_DOWN
    }

    draw(imgs: HTMLImageElement[], ctx: CanvasRenderingContext2D, row: number, col: number, bw: boolean){
        let mx = 5, my = 4
        let dx = col*50+mx, dy = row*50+my
        let dw = 50-mx*2, dh = 50-my*2
        let resource: HTMLImageElement
        
        if (this.mysterious){
            if (this.clearing){
                resource = imgs[(bw ? 10:0) + this.color]
            } else {
                resource = imgs[6]
            }
        } else {
            if (this.isMagicStoneType()){
                resource = imgs[this.color]
            } else {
                resource = imgs[(bw ? 10:0) + this.color]
            }
        }

        ctx.drawImage(resource,dx,dy,dw,dh)
    }
}