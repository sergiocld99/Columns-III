// Jewel, 6 color variants
export const COLOR_VARIANTS_COUNT = 6

export class Jewel {
    color: number

    constructor(color: number){
        this.color = color
    }

    draw(imgs: HTMLImageElement[], ctx: CanvasRenderingContext2D, row: number, col: number){
        let mx = 30, my = 4
        let dx = col*300+mx, dy = row*50+my
        let dw = 300-mx*2, dh = 50-my*2
        ctx.drawImage(imgs[this.color],dx,dy,dw,dh)
    }
}