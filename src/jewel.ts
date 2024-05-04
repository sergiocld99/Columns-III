// Jewel, 6 color variants
export const COLOR_VARIANTS_COUNT = 6

export class Jewel {
    color: number
    clearing = false

    constructor(color: number){
        this.color = color
    }

    equals(other: Jewel) : boolean {
        return other && other.color === this.color
    }

    draw(imgs: HTMLImageElement[], ctx: CanvasRenderingContext2D, row: number, col: number){
        let mx = 5, my = 4
        let dx = col*50+mx, dy = row*50+my
        let dw = 50-mx*2, dh = 50-my*2
        ctx.drawImage(imgs[this.color],dx,dy,dw,dh)
    }
}