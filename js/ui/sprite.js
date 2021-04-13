define(["util/config"], function (config) {
    // If pack is set to true, sprites will be loaded from a singular sprite
    // sheet. Otherwise the images are loaded separately.
    const pack = true;

    // Setup positions and dimensions of the sprites.
    const sheetConfig = (function () {
        const sheet = {};
        let key, x, y, w, h;

        x = 0;
        y = 0;
        w = 48;
        h = 53;
        key = "android";
        sheet[key] = {x, y, w, h};
        x += w;

        key = "android-flip";
        sheet[key] = {x, y, w, h};
        x += w;

        key = "android-power-up-";
        for (let i = 1; i <= 3; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w;
        }

        key = "android-fall-";
        for (let i = 1; i <= 2; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w;
        }

        key = "android-hurt-";
        for (let i = 1; i <= 8; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w;
        }

        x = 0;
        y = h;
        w = 60;
        h = 92;
        key = "eg-caution-";
        for (let i = 1; i <= 11; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w;
        }

        key = "btn-restart";
        w = 60;
        h = 53;
        sheet[key] = {x, y, w, h};
        x += w;

        key = "ic-ok";
        w = h = 20;
        sheet[key] = {x, y, w, h};
        x += w;

        key = "ic-caution";
        sheet[key] = {x, y, w, h};

        x = 660;
        y = 106;
        w = h = 39;
        key = "stair-slime-";
        for (let i = 1; i <= 3; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w;
        }

        key = "stair-slime";
        sheet[key] = {x, y, w, h};

        x = 0;
        y = 145;
        w = 60;
        h = 92;
        key = "eg-ok-";
        for (let i = 1; i <= 7; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w;
        }

        key = "stair-default";
        w = 49;
        h = 20;
        sheet[key] = {x, y, w, h};
        x += w;

        key = "stair-stealth";
        w = 47;
        sheet[key] = {x, y, w, h};
        x += w;

        key = "stair-moving-";
        for (let i = 1; i <= 2; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w;
        }

        key = "power-up-";
        w = 35;
        for (let i = 1; i <= 3; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w;
        }

        x = 420;
        y = 165;
        w = 49;
        h = 19;
        key = "stair-cloud";
        sheet[key] = {x, y, w, h};
        x += w;

        key = "stair-cloud-collapse-";
        for (let i = 1; i <= 6; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w;
        }

        x = 420;
        y += h;
        w = 42;
        h = 21;
        key = "stair-spring";
        sheet[key] = {x, y, w, h};
        x += w;

        key = "stair-spring-bounce-";
        for (let i = 1; i <= 4; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w;
        }

        key = "stair-thorn";
        w = 47;
        h = 29;
        sheet[key] = {x, y, w, h};

        x = 420;
        y = 205;
        w = 47;
        h = 27;
        key = "stair-fragile";
        sheet[key] = {x, y, w, h};
        x += w;

        key = "stair-fragile-collapse-";
        for (let i = 1; i <= 3; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w;
        }

        x = 0;
        y = 237;
        w = 600;
        h = 2;
        key = "ribbon";
        sheet[key] = {x, y, w, h};

        return sheet;
    })();
    const spriteSheet = (function () {
        const i = new Image();
        i.src = "img/sprite.png";
        return {img: i, conf: sheetConfig, legacy: {}};
    })();

    // Get the position and dimension config of a sprite.
    spriteSheet.get = function (src) {
        return this.conf[src];
    };

    // Draw the sprite to the canvas.
    spriteSheet.draw = function (ctx, sprite, src) {
        if (!pack) {
            return this.drawLegacy(ctx, sprite, src);
        }
        if (!src) {
            src = sprite.src;
        }
        const conf = this.conf[src];
        if (!conf) {
            console.error("Sprite sheet does not contain " + src);
            return;
        }
        // ctx.drawImage(this.img, conf.x, conf.y, conf.w, conf.h,
        //     sprite.x, sprite.y, sprite.w, sprite.h);
        ctx.drawImage(this.img, conf.x, conf.y, conf.w, conf.h,
            Math.round(sprite.x), Math.round(sprite.y),
            Math.round(sprite.w), Math.round(sprite.h),
        );
    };

    // Load sprite images separately (only when pack=false).
    spriteSheet.loadLegacy = function () {
        Object.keys(this.conf).forEach(src => {
            const img = new Image();
            img.src = `img/slice/${src}.png`;
            this.legacy[src] = img;
        });
    };
    spriteSheet.drawLegacy = function (ctx, sprite, src) {
        if (!src) {
            src = sprite.src;
        }
        if (!this.legacy[src]) {
            const img = new Image();
            img.src = src;
            this.legacy[src] = img;
        }
        ctx.drawImage(this.legacy[src], sprite.x, sprite.y, sprite.w, sprite.h);
    };

    if (!pack) {
        spriteSheet.loadLegacy();
    }

    // Save all instantiated sprites to a bottle. Once the window is resized,
    // it would be much easier to scale sprites here altogether.
    const bottle = [];
    config.registerResizeEvent(() => {
        for (const sprite of bottle) {
            sprite.measure();
        }
    });

    class Animation {
        constructor(parent, images, clipDuration, loop, stays) {
            this.parent = parent;
            this.loop = loop;
            this.stays = stays;
            this.init(images, clipDuration);
        }

        reset() {
            this.animFrames = 0;
        }

        init(src, clipDuration) {
            this.animSrc = src;
            this.animFrames = 0;
            this.animIndex = 0;
            this.animClipDuration = clipDuration;
            this.animDuration = clipDuration * src.length;
        }

        // Param loop specifies if the animation should loop in endless cycles,
        // Param stays specifies the behavior once animation has ended, if stays
        // equals to true, drawClip() shall draw the last frame of the animation,
        // otherwise it draws nothing after finished.
        update(deltaFrames) {
            if (this.loop) {
                this.animFrames %= this.animDuration;
            }

            let i;
            for (i = 0; i < this.animSrc.length; ++i) {
                if (this.animFrames < this.animClipDuration * (i + 1)) {
                    break;
                }
            }
            if (i >= this.animSrc.length) {
                i = this.stays ? this.animSrc.length - 1 : -1;
            }
            this.animIndex = i;
            this.animFrames += deltaFrames;
        }

        drawClip(ctx) {
            if (this.animIndex === -1) {
                return;
            }
            spriteSheet.draw(ctx, this.parent, this.animSrc[this.animIndex]);
        }
    }

    return class Sprite {
        constructor(src) {
            this.src = src;
            this.w = this.h = this.x = this.y = 0;
            this.measure();
            bottle.push(this);
        }

        measure() {
            const conf = spriteSheet.get(this.src);
            if (conf) {
                this.w = config.relativePixel(conf.w);
                this.h = config.relativePixel(conf.h);
            } else {
                console.warn(this.src + " not found in sprite sheet");
            }
        }

        setAnimation(images, clipDuration, loop = true, stays = true) {
            this.anim = this.newAnimation(images, clipDuration, loop, stays);
            return this.anim;
        }

        newAnimation(images, clipDuration, loop = true, stays = true) {
            return new Animation(this, images, clipDuration, loop, stays);
        }

        draw(ctx, image = this.src) {
            spriteSheet.draw(ctx, this, image);
        }

        isClickingMe(x, y) {
            return x > this.x && x < this.x + this.w &&
                y > this.y && y < this.y + this.h;
        }
    }
});
