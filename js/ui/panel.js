define(["ui/sprite", "util/constants"], function (Sprite, constants) {
    const spritesConfig = {
        restart: {
            src: "btn-restart",
        },
        icOk: {
            src: "ic-ok",
        },
        icCaution: {
            src: "ic-caution",
        },
        egOk: {
            src: "eg-ok-1",
            animSrc: [
                "eg-ok-1",
                "eg-ok-2",
                "eg-ok-3",
                "eg-ok-4",
                "eg-ok-5",
                "eg-ok-6",
                "eg-ok-7",
            ],
        },
        egCaution: {
            src: "eg-caution-1",
            animSrc: [
                "eg-caution-1",
                "eg-caution-2",
                "eg-caution-3",
                "eg-caution-4",
                "eg-caution-5",
                "eg-caution-6",
                "eg-caution-7",
                "eg-caution-8",
                "eg-caution-9",
                "eg-caution-10",
                "eg-caution-11",
            ],
        },
    };

    const sprites = {};
    for (const [key, value] of Object.entries(spritesConfig)) {
        sprites[key] = new Sprite(value.src);
    }

    function placeEverything() {
        let it, that;

        // Panel layout should look similar to something like this:
        //  ----------------------
        // |                      |
        // |        TITLE         |
        // |                      |
        // |   icOk    icCaution  |
        // |                      |
        // |   egOk    egCaution  |
        // |                      |
        // |       restart        |
        // |                      |
        //  ----------------------
        const gapHorizontal = Math.floor(constants.width / 5); // gap between eg-ok and eg-caution
        const gapVertical1 = constants.relativePixel(160); // gap between title and ic-ok
        const gapVertical2 = constants.relativePixel(60); // gap between ic-ok and eg-ok
        const gapVertical3 = constants.relativePixel(140); // gap between eg-ok and restart
        const groupHeight = sprites.restart.h + sprites.icOk.h + sprites.egOk.h +
            gapVertical1 + gapVertical2 + gapVertical3;
        const groupWidth = sprites.egOk.w + sprites.egCaution.w + gapHorizontal;
        const top = Math.floor((constants.height - groupHeight) / 2);
        const animClipDuration = 6;

        // setup restart button
        it = sprites.restart;
        it.x = (constants.width - it.w) / 2;
        it.y = top + groupHeight - it.h;

        // setup egOk
        it = sprites.egOk;
        that = sprites.restart;
        it.x = (constants.width - groupWidth) / 2;
        it.y = that.y - gapVertical3 - it.h;
        it.setAnimation(spritesConfig.egOk.animSrc, animClipDuration);

        // setup egCaution
        it = sprites.egCaution;
        that = sprites.egOk;
        it.x = that.x + that.w + gapHorizontal;
        it.y = that.y;
        it.setAnimation(spritesConfig.egCaution.animSrc, animClipDuration);

        // setup icOk
        it = sprites.icOk;
        that = sprites.egOk;
        it.x = (that.w - it.w) / 2 + that.x;
        it.y = that.y - it.h - gapVertical2;

        // setup icCaution
        it = sprites.icCaution;
        that = sprites.egCaution;
        it.x = (that.w - it.w) / 2 + that.x;
        it.y = that.y - it.h - gapVertical2;
    }

    function draw(ctx, text) {
        sprites.icOk.draw(ctx);
        sprites.icCaution.draw(ctx);
        sprites.restart.draw(ctx);
        sprites.egOk.anim.drawClip(ctx);
        sprites.egCaution.anim.drawClip(ctx);

        ctx.fillStyle = "#4e4e4e";
        ctx.font = `bold ${constants.fontSize(38)}px Serif`;
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        ctx.fillText(text, constants.width / 2, constants.height * 0.3);
    }

    placeEverything();

    return {
        update() {
            sprites.egOk.anim.update(true);
            sprites.egCaution.anim.update(true);
        },

        drawGameOver(ctx) {
            draw(ctx, "GAME OVER");
        },

        draw(ctx) {
            draw(ctx, "START GAME");
        },

        isClickingRestart(point) {
            return sprites.restart.isClickingMe(point.x, point.y);
        }
    };
});
