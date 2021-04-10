define(["ui/sprite", "util/config", "util/camera"], function (Sprite, config, camera) {
    const sprites = [
        {
            src: "stair-default",
            stable: true,
            starter: true,
            instantiate: function (altitude) {
                return new StairDefault(altitude);
            }
        },
        {
            src: "stair-stealth",
            stable: true,
            starter: false,
            instantiate: function (altitude) {
                return new StairStealth(altitude);
            }
        },
        {
            src: "stair-fragile",
            animSrc: [
                "stair-fragile-collapse-1",
                "stair-fragile-collapse-2",
                "stair-fragile-collapse-3",
            ],
            stable: true,
            starter: true,
            instantiate: function (altitude) {
                return new StairFragile(altitude);
            }
        },
        {
            src: "stair-moving-1",
            animSrc: [
                "stair-moving-1",
                "stair-moving-2",
            ],
            stable: true,
            starter: false,
            instantiate: function (altitude) {
                return new StairMoving(altitude);
            }
        },
        {
            src: "stair-cloud",
            animSrc: [
                "stair-cloud-collapse-1",
                "stair-cloud-collapse-2",
                "stair-cloud-collapse-3",
                "stair-cloud-collapse-4",
                "stair-cloud-collapse-5",
                "stair-cloud-collapse-6",
            ],
            stable: false,
            starter: true,
            instantiate: function (altitude) {
                return new StairCloud(altitude);
            }
        },
        {
            src: "stair-thorn",
            stable: false,
            starter: false,
            instantiate: function (altitude) {
                return new StairThorn(altitude);
            }
        },
        {
            src: "stair-spring",
            animSrc: [
                "stair-spring-bounce-1",
                "stair-spring-bounce-2",
                "stair-spring-bounce-3",
                "stair-spring-bounce-4",
            ],
            stable: true,
            starter: false,
            instantiate: function (altitude) {
                return new StairSpring(altitude);
            }
        },
        {
            src: "stair-slime",
            animSrc: [
                "stair-slime-1",
                "stair-slime-2",
                "stair-slime-3",
                "stair-slime-1",
            ],
            stable: false,
            starter: false,
            instantiate: function (altitude) {
                return new StairSlime(altitude);
            }
        }
    ];
    const powerUps = {
        src: ["power-up-1"],
        animSrc: [
            "power-up-1",
            "power-up-2",
            "power-up-3",
        ],
        lucky: function () {
            return false;
        }
    };

    // Randomize the X position of the platforms.
    const randomX = (function () {
        const spawnPadding = config.platformPadding;
        const random = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        return function (width) {
            return random(spawnPadding, config.width - width - spawnPadding);
        };
    })();

    class PowerUp extends Sprite {
        constructor() {
            super(powerUps.src);
            super.setAnimation(powerUps.animSrc, 6);
            this.enabled = false;
        }

        update() {
            if (!this.enabled) {
                return;
            }
            this.anim.update(true);
        }

        draw(ctx, x, y) {
            if (!this.enabled) {
                return;
            }
            this.x = x;
            this.y = y;
            this.anim.drawClip(ctx);
        }
    }

    class Stair extends Sprite {
        constructor(sprite, altitude, prop) {
            super(sprite.src);
            if (prop) {
                this.powerup = new PowerUp();
            }
            this.setup(altitude);
        }

        reset(altitude) {
            this.setup(altitude);
        }

        setup(altitude) {
            this.x = randomX(this.w);
            this.altitude = altitude;
            this.y = camera.focus(this.getRealPosition());
            if (this.powerup) {
                this.powerup.enabled = powerUps.lucky();
            }
            this.active = true;
        }

        // If the platform has enter to the canvas from above.
        hasEntered() {
            return this.y > 0;
        }

        // If the platform has left from the canvas bottom.
        hasGone() {
            return this.y > config.height;
        }

        // Disables the platform, makes it recyclable by an ObjectPooler.
        disable() {
            this.active = false;
        }

        startPatrol(speed) {
            this.moveSpeed = speed;
        }

        // If android is stepping on the platform.
        // This returns all type of events causing different behaviors of the
        // android. Like, jump, bounce, power up, and hurt etc.
        isBeingStepped(android) {
            const flag = android.velocity.y >= 0 &&
                android.x + android.w > this.x &&
                android.x < this.x + this.w &&
                android.y + android.h >= this.y &&
                android.y + android.h < this.y + this.h;
            if (!flag) {
                return config.COLLIDE_TYPE_NONE;
            }
            if (this.powerup && this.powerup.enabled) {
                this.powerup.enabled = false;
                return config.COLLIDE_TYPE_POWER;
            }
            return config.COLLIDE_TYPE_JUMP;
        }

        getRealPosition() {
            return {x: this.x, y: -this.altitude};
        }

        update(frames) {
            this.y = camera.focus(this.getRealPosition()).y;
            if (this.powerup && this.powerup.enabled) {
                this.powerup.update(frames);
            }
            if (this.moveSpeed) {
                this.x += this.moveSpeed;
                if (this.x <= 0 || this.x + this.w > config.width) {
                    this.moveSpeed = -this.moveSpeed;
                }
            }
        }

        draw(ctx) {
            super.draw(ctx);
            this.drawPowerUp(ctx);
        }

        drawPowerUp(ctx) {
            if (this.powerup && this.powerup.enabled) {
                const x = (this.w - this.powerup.w) / 2 + this.x;
                const y = this.y - this.powerup.h - 10;
                this.powerup.draw(ctx, x, y);
            }
        }
    }

    // The default platform. It's not a leopard skin pillbox hat, but you can
    // jump on it.
    class StairDefault extends Stair {
        constructor(altitude) {
            super(sprites[0], altitude, true);
        }
    }

    // This platform blinks at a certain interval. It disappears and reappears
    // continuously. It's safe to step on.
    class StairStealth extends Stair {
        constructor(altitude) {
            super(sprites[1], altitude);
            this.animDuration = 20;
            this.animFrame = 0;
            this.blinkInterval = 80;
            this.easeIn = false;
            this.easeOut = false;
            this.visible = false;
        }

        update(frames) {
            super.update(frames);
            const mod = frames % this.blinkInterval;
            if (mod === 0) {
                this.easeIn = true;
                this.animFrame = 0;
                this.visible = true;
            } else if (mod === this.blinkInterval / 2) {
                this.easeOut = true;
                this.animFrame = 0;
                this.visible = false;
            }
        }

        draw(ctx) {
            if (this.easeIn) {
                this.drawEaseIn(ctx);
            } else if (this.easeOut) {
                this.drawEaseOut(ctx);
            } else if (this.visible) {
                super.draw(ctx);
            }
        }

        drawEaseIn(ctx) {
            ++this.animFrame;
            let alpha = 1 / this.animDuration * this.animFrame;
            if (alpha >= 1) {
                this.easeIn = false;
                alpha = 1;
            }
            ctx.globalAlpha = alpha;
            super.draw(ctx);
            ctx.globalAlpha = 1;
        }

        drawEaseOut(ctx) {
            ++this.animFrame;
            let alpha = 1 - 1 / this.animDuration * this.animFrame;
            if (alpha <= 0) {
                this.easeOut = false;
                alpha = 0;
            }
            ctx.globalAlpha = alpha;
            super.draw(ctx);
            ctx.globalAlpha = 1;
        }
    }

    // This platform is fragile and can only be stepped once. After that, it
    // collapses to dust.
    class StairFragile extends Stair {
        constructor(altitude) {
            super(sprites[2], altitude);
            this.collapse = false;
            super.setAnimation(sprites[2].animSrc, 5);
        }

        reset(altitude) {
            super.reset(altitude);
            this.collapse = false;
            this.anim.reset();
        }

        isBeingStepped(android) {
            if (this.collapse) {
                return config.COLLIDE_TYPE_NONE;
            }
            const flag = super.isBeingStepped(android);
            if (flag) {
                this.collapse = true;
            }
            return flag;
        }

        update(frames) {
            super.update(frames);
            if (this.collapse) {
                this.anim.update(false, false);
            }
        }

        draw(ctx) {
            if (this.collapse) {
                this.anim.drawClip(ctx);
            } else {
                super.draw(ctx);
            }
        }
    }

    // This platform moves horizontally at a certain speed. It's safe to step on.
    class StairMoving extends Stair {
        constructor(altitude) {
            super(sprites[3], altitude, true);
            super.setAnimation(sprites[3].animSrc, 8);
            super.startPatrol(config.platformMoveSpeed);
        }

        reset(altitude) {
            super.reset(altitude);
            super.startPatrol(config.platformMoveSpeed);
        }

        update(frames) {
            super.update(frames);
            this.anim.update(true);
        }

        draw(ctx) {
            this.anim.drawClip(ctx);
            super.drawPowerUp(ctx);
        }
    }

    // This is not an actual platform. It's used to create delusion to the
    // player and cannot be stepped on under any circumstances. Upon touch,
    // the cloud falls apart.
    class StairCloud extends Stair {
        constructor(altitude) {
            super(sprites[4], altitude);
            this.collapse = false;
            super.setAnimation(sprites[4].animSrc, 4);
        }

        reset(altitude) {
            super.reset(altitude);
            this.collapse = false;
            this.anim.reset();
        }

        isBeingStepped(android) {
            if (this.collapse) {
                return config.COLLIDE_TYPE_NONE;
            }
            const flag = super.isBeingStepped(android);
            if (flag) {
                this.collapse = true;
            }
            return config.COLLIDE_TYPE_NONE;
        }

        update(frames) {
            super.update(frames);
            if (this.collapse) {
                this.anim.update(false, false);
            }
        }

        draw(ctx) {
            if (this.collapse) {
                this.anim.drawClip(ctx);
            } else {
                super.draw(ctx);
            }
        }
    }

    // A dangerous platform that has thorn on top of it, which causes immediate
    // death to anyone that falls upon it.
    class StairThorn extends Stair {
        constructor(altitude) {
            super(sprites[5], altitude);
        }

        isBeingStepped(android) {
            const flag = super.isBeingStepped(android);
            if (flag) {
                return config.COLLIDE_TYPE_HURT;
            }
            return config.COLLIDE_TYPE_NONE;
        }
    }

    // This platform has a spring on it. Androids can jump even higher on it.
    class StairSpring extends Stair {
        constructor(altitude) {
            super(sprites[6], altitude);
            this.bounce = false;
            super.setAnimation(sprites[6].animSrc, 2);
        }

        reset(altitude) {
            super.reset(altitude);
            this.bounce = false;
            this.anim.reset();
        }

        isBeingStepped(android) {
            if (this.bounce) {
                return config.COLLIDE_TYPE_NONE;
            }
            const flag = super.isBeingStepped(android);
            if (flag) {
                this.bounce = true;
                return config.COLLIDE_TYPE_BOUNCE;
            }
            return config.COLLIDE_TYPE_NONE;
        }

        update(frames) {
            super.update(frames);
            if (this.bounce) {
                this.anim.update(false, true);
            }
        }

        draw(ctx) {
            if (this.bounce) {
                this.anim.drawClip(ctx);
            } else {
                super.draw(ctx);
            }
        }
    }

    // A patrolling slime disguised as a platform. It's only aggressive at
    // a certain rate. Androids can use it as a one-time stepping stone only
    // when it's not spreading spikes around its body, otherwise it kills
    // whoever dares to touch it.
    class StairSlime extends Stair {
        constructor(altitude) {
            super(sprites[7], altitude);
            super.setAnimation(sprites[7].animSrc, 6);
            super.startPatrol(config.platformMoveSpeed);
            this.kicked = false;
            this.kickForce = 0.5;
            this.velocityY = 0;
        }

        reset(altitude) {
            super.reset(altitude);
            super.startPatrol(config.platformMoveSpeed);
            this.kicked = false;
            this.velocityY = 0;
            this.anim.reset();
        }

        isBeingStepped(android) {
            if (this.kicked) {
                return config.COLLIDE_TYPE_NONE;
            }
            const flag = super.isBeingStepped(android);
            if (flag) {
                this.kicked = true;
                if (this.isSlimeAggressive()) {
                    return config.COLLIDE_TYPE_HURT;
                } else {
                    return config.COLLIDE_TYPE_JUMP;
                }
            }
            return config.COLLIDE_TYPE_NONE;
        }

        isSlimeAggressive() {
            const i = this.anim.animIndex;
            return i === 1 || i === 2;
        }

        update(frames) {
            if (this.kicked) {
                this.velocityY += this.kickForce;
                this.altitude -= this.velocityY;
            }
            super.update(frames);
            if (!this.kicked) {
                this.anim.update(true);
            }
        }

        draw(ctx) {
            if (this.kicked) {
                super.draw(ctx);
            } else {
                this.anim.drawClip(ctx);
            }
        }
    }

    return {
        sprites,

        setLuckyMethod: function (fn) {
            if (typeof fn === "function") {
                powerUps.lucky = fn;
            } else {
                console.error("fn should be of type function", fn);
            }
        }
    };
});
