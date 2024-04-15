function playMusic(name: string, initialSecs = 0) {
    const bgm = new Audio(`bgm/${name}.bgm`);
    bgm.currentTime = initialSecs
    bgm.play();

    let interv = window.setInterval(() => {
        if (bgm.currentTime > bgm.duration - 1){
            playMusic(name)
            clearInterval(interv)
        }
    }, 1000)
}

playMusic('track19')

// ball size: 45px