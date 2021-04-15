define(["util/config"], function (config) {
    // If pack is set to true, sprites will be loaded from a singular sprite
    // sheet. Otherwise the images are loaded separately.
    const pack = true;

    // Setup positions and dimensions of the sprites.
    const sheetConfig = (function () {
        const sheet = {};
        const spacing = 1; // avoids edge bleeding
        let key, x, y, w, h;

        [x, y, w, h] = [0, 0, 48, 53];
        key = "android";
        sheet[key] = {x, y, w, h};
        x += w + spacing;

        key = "android-flip";
        sheet[key] = {x, y, w, h};
        x += w + spacing;

        key = "android-power-up-flip-";
        for (let i = 1; i <= 3; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        key = "android-power-up-";
        for (let i = 1; i <= 3; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        key = "android-fall-";
        for (let i = 1; i <= 2; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        key = "android-hurt-";
        for (let i = 1; i <= 8; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        [x, y, w, h] = [0, 54, 60, 92];
        key = "eg-caution-";
        for (let i = 1; i <= 11; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        [w, h] = [60, 53];
        key = "btn-restart";
        sheet[key] = {x, y, w, h};
        x += w + spacing;

        w = h = 20;
        key = "ic-ok";
        sheet[key] = {x, y, w, h};
        x += w + spacing;

        key = "ic-caution";
        sheet[key] = {x, y, w, h};

        [x, y, w, h] = [0, 147, 60, 92];
        key = "eg-ok-";
        for (let i = 1; i <= 7; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        [w, h] = [49, 20];
        key = "stair-default";
        sheet[key] = {x, y, w, h};
        x += w + spacing;

        w = 47;
        key = "stair-stealth";
        sheet[key] = {x, y, w, h};
        x += w + spacing;

        key = "stair-moving-";
        for (let i = 1; i <= 2; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        w = 35;
        key = "power-up-";
        for (let i = 1; i <= 3; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        [y, w, h] = [128, 39, 39];
        key = "stair-slime-";
        for (let i = 1; i <= 3; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        key = "stair-slime";
        sheet[key] = {x, y, w, h};

        [x, y, w, h] = [427, 168, 49, 19];
        key = "stair-cloud";
        sheet[key] = {x, y, w, h};
        x += w + spacing;

        key = "stair-cloud-collapse-";
        for (let i = 1; i <= 6; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        [x, y, w, h] = [427, 188, 45, 29];
        key = "stair-thorn-";
        for (let i = 1; i <= 4; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        [w, h] = [47, 27];
        key = "stair-fragile";
        sheet[key] = {x, y, w, h};
        x += w + spacing;

        key = "stair-fragile-collapse-";
        for (let i = 1; i <= 3; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        [x, y, w, h] = [427, 218, 42, 21];
        key = "stair-spring";
        sheet[key] = {x, y, w, h};
        x += w + spacing;

        key = "stair-spring-bounce-";
        for (let i = 1; i <= 4; ++i) {
            sheet[key + i] = {x, y, w, h};
            x += w + spacing;
        }

        [x, y, w, h] = [0, 240, 600, 2];
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
        ctx.drawImage(this.img, conf.x, conf.y, conf.w, conf.h,
            sprite.x, sprite.y, sprite.w, sprite.h);
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
        constructor(parent, images, clipDuration) {
            this.parent = parent;
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
            this.animLoop = false;
            this.animStayAfterFinish = false;
        }

        setSource(src) {
            this.animSrc = src;
            return this;
        }

        // Animation shall loop in an endless cycle.
        loop(delay) {
            this.animLoop = true;
            if (delay) {
                this.animDuration += delay;
            }
            return this;
        }

        // This changes the behavior after animation ends. drawClip() shall
        // draw the last frame of the animation, by default it draws nothing
        // after finished.
        stayAfterFinish() {
            this.animStayAfterFinish = true;
            return this;
        }

        // When it's a loop animation, rhythm can be used to synchronize
        // animations of the same kind.
        update(deltaFrames, rhythm) {
            if (this.animLoop) {
                if (rhythm) {
                    this.animFrames = rhythm;
                }
                this.animFrames %= this.animDuration;
            }

            let i;
            for (i = 0; i < this.animSrc.length; ++i) {
                if (this.animFrames < this.animClipDuration * (i + 1)) {
                    break;
                }
            }
            if (i >= this.animSrc.length) {
                if (this.animLoop || this.animStayAfterFinish) {
                    i = this.animSrc.length - 1;
                } else {
                    i = -1;
                }
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

        setAnimation(images, clipDuration) {
            this.anim = this.newAnimation(images, clipDuration);
            return this.anim;
        }

        newAnimation(images, clipDuration) {
            return new Animation(this, images, clipDuration);
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
