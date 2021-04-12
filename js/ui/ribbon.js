define(["ui/sprite", "util/camera", "util/config"], function (Sprite, camera, config) {
    const sprite = {
        src: "ribbon",
    };

    // Ribbon renders while near highest altitude (best score).
    class Ribbon extends Sprite {
        constructor() {
            super(sprite.src);
            this.init();
        }

        init() {
            this.altitude = 0;
            this.w = config.width;
            config.registerResizeEvent(() => this.w = config.width);
        }

        setBestScore(best) {
            this.bestScore = best;
            this.altitude = config.scoreToAltitude(best);
        }

        update() {
            if (!this.altitude) {
                return;
            }
            this.y = camera.focus({x: 0, y: -this.altitude}).y;
        }

        draw(ctx) {
            if (this.altitude && camera.canFitIn(this)) {
                super.draw(ctx);
                ctx.font = `${config.fontSize(14)}px Arial`;
                ctx.textBaseline = "bottom";
                ctx.textAligh = "left";
                ctx.fillStyle = "#555";
                ctx.fillText(String(Math.floor(this.bestScore)), 5, this.y - 5);
            }
        }
    }

    return new Ribbon();
});
