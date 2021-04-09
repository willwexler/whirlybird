define(["ui/sprite", "util/camera", "util/constants"], function (Sprite, camera, constants) {
    const sprite = {
        src: "ribbon",
    };

    // Ribbon renders while near highest altitude (best score).
    class Ribbon extends Sprite {
        constructor() {
            super(sprite.src);
            this.altitude = 0;
        }

        setAltitude(best) {
            this.altitude = best;
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
                ctx.font = `${constants.fontSize(14)}px Arial`;
                ctx.textBaseline = "bottom";
                ctx.textAligh = "left";
                ctx.fillStyle = "#555";
                ctx.fillText(String(this.altitude), 5, this.y - 5);
            }
        }
    }

    return new Ribbon();
});
