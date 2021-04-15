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
            this.bestScore = 0;
            this.altitude = 0;
            this.w = config.width;
            config.registerResizeEvent(() => {
                this.w = config.width;
                this.altitude = config.scoreToAltitude(this.bestScore);
            });
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
                const padding = config.relativePixel(5);
                ctx.font = `${config.fontSize(14)}px Arial`;
                ctx.textBaseline = "bottom";
                ctx.textAlign = "left";
                ctx.fillStyle = "#555";
                ctx.fillText("Best: " + Math.floor(this.bestScore),
                    padding, this.y - padding);
            }
        }
    }

    return new Ribbon();
});
