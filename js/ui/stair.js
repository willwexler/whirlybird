define(["ui/sprite", "util/config", "util/camera"], function (Sprite, config, camera) {
    const sprites = {
        default: {
            src: "stair-default",
            stable: true,
            starter: true,
            upgradable: true,
            instantiate: function (altitude) {
                return new StairDefault(altitude);
            }
        },
        stealth: {
            src: "stair-stealth",
            stable: true,
            starter: false,
            upgradable: false,
            instantiate: function (altitude) {
                return new StairStealth(altitude);
            }
        },
        fragile: {
            src: "stair-fragile",
            animSrc: [
                "stair-fragile-collapse-1",
                "stair-fragile-collapse-2",
                "stair-fragile-collapse-3",
            ],
            stable: true,
            starter: true,
            upgradable: false,
            instantiate: function (altitude) {
                return new StairFragile(altitude);
            }
        },
        moving: {
            src: "stair-moving-1",
            animSrc: [
                "stair-moving-1",
                "stair-moving-2",
            ],
            stable: true,
            starter: false,
            upgradable: true,
            instantiate: function (altitude) {
                return new StairMoving(altitude);
            }
        },
        cloud: {
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
            upgradable: false,
            instantiate: function (altitude) {
                return new StairCloud(altitude);
            }
        },
        thorn: {
            src: "stair-thorn-1",
            animSrc: [
                "stair-thorn-1",
                "stair-thorn-2",
                "stair-thorn-3",
                "stair-thorn-4",
                "stair-thorn-1",
            ],
            stable: false,
            starter: false,
            upgradable: false,
            instantiate: function (altitude) {
                return new StairThorn(altitude);
            }
        },
        spring: {
            src: "stair-spring",
            animSrc: [
                "stair-spring-bounce-1",
                "stair-spring-bounce-2",
                "stair-spring-bounce-3",
                "stair-spring-bounce-4",
            ],
            stable: true,
            starter: false,
            upgradable: false,
            instantiate: function (altitude) {
                return new StairSpring(altitude);
            }
        },
        slime: {
            src: "stair-slime",
            animSrc: [
                "stair-slime-1",
                "stair-slime-2",
                "stair-slime-3",
                "stair-slime-1",
            ],
            stable: false,
            starter: false,
            upgradable: false,
            instantiate: function (altitude) {
                return new StairSlime(altitude);
            }
        },
    };
    const powerUps = {
        src: ["power-up-1"],
        animSrc: [
            "power-up-1",
            "power-up-2",
            "power-up-3",
        ],
        lucky: () => false,
    };

    sprites.types = Object.keys(sprites);
    sprites.randomType = function () {
        return sprites.types[Math.floor(sprites.types.length * Math.random())];
    };

    // Randomize the X position of the platforms.
    const randomX = (function () {
        const random = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }

        return function (width) {
            const spawnPadding = config.platformPadding;
            return random(spawnPadding, config.width - width - spawnPadding);
        };
    })();

    // Check if android movement intersects with a platform.
    const movementIntersect = (function () {
        function crossProduct(a, b, c) {
            return (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
        }

        return function (line, leftFoot, rightFoot) {
            if (line.from.y > leftFoot.to.y || line.from.y < leftFoot.from.y) {
                // y position of the stair is not between the movement.
                return false;
            }
            let p, m, n, prod1, prod2;
            p = line.from;
            m = leftFoot.from;
            n = leftFoot.to;
            prod1 = crossProduct(m, n, p);
            if (prod1 === 0) {
                return true;
            }
            p = line.to;
            prod2 = crossProduct(m, n, p);
            if (prod1 * prod2 <= 0) {
                return true;
            }
            p = line.from;
            m = rightFoot.from;
            n = rightFoot.to;
            prod2 = crossProduct(m, n, p);
            if (prod1 * prod2 <= 0) {
                return true;
            }
            p = line.to;
            prod2 = crossProduct(m, n, p);
            if (prod1 * prod2 <= 0) {
                return true;
            }
            // If the two endpoints of stair are on the same side of both movement
            // lines, there is no intersect.
            return false;
        };
    })();

    const joggleDelta = function (duration, distance, rhythm) {
        const mod = rhythm % (2 * duration);
        let k;
        if (mod < duration) {
            k = rhythm % duration / duration;
        } else {
            k = 1 - rhythm % duration / duration;
        }
        return k * distance;
    };

    class PowerUp extends Sprite {
        constructor() {
            super(powerUps.src);
            super.setAnimation(powerUps.animSrc, 6).loop();
            this.deltaY = 0;
            this.enabled = false;
        }

        update(deltaFrames, rhythm) {
            if (!this.enabled) {
                return;
            }
            this.anim.update(deltaFrames, rhythm);
            this.deltaY = joggleDelta(config.powerUpJoggleDuration,
                config.powerUpJoggleDistance, rhythm);
        }

        draw(ctx, x, y) {
            if (!this.enabled) {
                return;
            }
            this.x = x;
            this.y = y + this.deltaY;
            this.anim.drawClip(ctx);
        }
    }

    class Stair extends Sprite {
        constructor(sprite, altitude) {
            super(sprite.src);
            if (sprite.upgradable) {
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
            this.requestCameraAttention();
            if (this.powerup) {
                this.powerup.enabled = powerUps.lucky();
            }
            this.previousPositions = null;
            this.active = true;
        }

        // If the platform has entered to the canvas from above.
        hasEntered() {
            this.requestCameraAttention();
            return this.y > 0;
        }

        // If the platform has left from the canvas bottom.
        hasGone() {
            this.requestCameraAttention();
            return this.y > config.height;
        }

        // Disable the platform, make it recyclable by an ObjectPooler.
        disable() {
            this.active = false;
        }

        startPatrol(speed) {
            this.moveSpeed = speed;
        }

        // Check if android is stepping on the platform.
        // This returns all type of events causing different behaviors of the
        // android. Like, jump, bounce, power up, and hurt etc.
        isBeingStepped(android) {
            const flag = this.advancedOnStairCheck(android);
            if (!flag) {
                return config.COLLIDE_TYPE_NONE;
            }
            // Android has set foot on a platform, set its precise y position to
            // be exactly on top of it.
            android.overwriteNextAltitude(android, this.altitude);

            if (this.powerup && this.powerup.enabled) {
                this.powerup.enabled = false;
                return config.COLLIDE_TYPE_POWER;
            }
            return config.COLLIDE_TYPE_JUMP;
        }

        // Basic collision check.
        basicOnStairCheck(android, stair) {
            if (android.velocity.y < 0) {
                return false;
            }
            return android.x + android.w > stair.x &&
                android.x < stair.x + this.w &&
                android.y + android.h >= stair.y &&
                android.y + android.h <= stair.y + this.h;
        }

        // On some low FPS machines, if android is landing too fast, we might
        // not be able to capture a certain collision due to a missing frame.
        // Instead of checking collision, this advanced method checks if the
        // android movement intersects with the platform.
        advancedOnStairCheck(android) {
            const stairPosition = this.getRealPosition();
            const currentPositions = {
                stair: {x: stairPosition.x, y: stairPosition.y, w: this.w, h: this.h},
                android: {x: android.x, y: android.y, w: android.w, h: android.h},
            };

            if (!this.previousPositions || android.velocity.y < 0) {
                this.previousPositions = currentPositions;
                return false;
            }

            // If the basic collision check passes, there wouldn't be any need
            // for further calculation.
            if (this.basicOnStairCheck(android, stairPosition)) {
                this.previousPositions = currentPositions;
                return true;
            }

            const android1 = this.previousPositions.android;
            const android2 = currentPositions.android;
            const stair1 = this.previousPositions.stair;
            const stair2 = currentPositions.stair;

            const leftFootMovement = {
                from: {
                    x: android1.x,
                    y: android1.y + android1.h,
                    // y: android1.y, // a broader check, not precise
                },
                to: {
                    x: android2.x,
                    y: android2.y + android2.h,
                },
            };
            const rightFootMovement = {
                from: {
                    x: leftFootMovement.from.x + android1.w,
                    y: leftFootMovement.from.y,
                },
                to: {
                    x: leftFootMovement.to.x + android2.w,
                    y: leftFootMovement.to.y,
                },
            };
            const stairLine = {
                from: {
                    x: Math.min(stair1.x, stair2.x),
                    y: stair1.y,
                },
                to: {
                    x: Math.max(stair1.x + stair1.w, stair2.x + stair2.w),
                    y: stair2.y,
                }
            };

            this.previousPositions = currentPositions;
            return movementIntersect(stairLine, leftFootMovement, rightFootMovement);
        }

        getRealPosition() {
            return {x: this.x, y: -this.altitude};
        }

        requestCameraAttention() {
            const p = camera.focus(this.getRealPosition());
            this.x = p.x;
            this.y = p.y;
        }

        update(deltaFrames, rhythm) {
            this.requestCameraAttention();
            if (this.powerup && this.powerup.enabled) {
                this.powerup.update(deltaFrames, rhythm);
            }
            if (this.moveSpeed) {
                this.x += this.moveSpeed * deltaFrames;
                this.clampX();
            }
        }

        // Turn around after hit the border of the canvas.
        clampX() {
            const min = 0, max = config.width - this.w;
            if (this.x <= min) {
                this.x = min;
                this.moveSpeed = -this.moveSpeed;
            } else if (this.x >= max) {
                this.x = max;
                this.moveSpeed = -this.moveSpeed;
            }
        }

        draw(ctx) {
            super.draw(ctx);
            this.drawPowerUp(ctx);
        }

        drawPowerUp(ctx) {
            if (this.powerup && this.powerup.enabled) {
                const x = (this.w - this.powerup.w) / 2 + this.x;
                const y = this.y - this.powerup.h - config.relativePixel(12);
                this.powerup.draw(ctx, x, y);
            }
        }
    }

    // The default platform. It's not a leopard skin pillbox hat, but you can
    // jump on it.
    class StairDefault extends Stair {
        constructor(altitude) {
            super(sprites.default, altitude);
        }
    }

    // This platform blinks at a certain interval. It disappears and reappears
    // continuously. It's safe to step on.
    class StairStealth extends Stair {
        constructor(altitude) {
            super(sprites.stealth, altitude);
            this.animDuration = 20;
            this.animFrames = 0;
            this.blinkInterval = 80;
            this.easeIn = false;
            this.easeOut = false;
            this.visible = false;
        }

        reset(altitude) {
            super.reset(altitude);
            this.animFrames = 0;
            this.easeIn = false;
            this.easeOut = false;
            this.visible = false;
        }

        update(deltaFrames, rhythm) {
            super.update(deltaFrames, rhythm);
            const mod = Math.round(rhythm) % this.blinkInterval;
            if (mod >= 0 && mod < this.blinkInterval / 2 && !this.visible) {
                this.easeIn = true;
                this.animFrames = 0;
                this.visible = true;
            } else if (mod >= this.blinkInterval / 2 && this.visible) {
                this.easeOut = true;
                this.animFrames = 0;
                this.visible = false;
            }
            if (this.easeIn || this.easeOut) {
                this.animFrames += deltaFrames;
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
            let alpha = this.animFrames / this.animDuration;
            if (alpha >= 1) {
                this.easeIn = false;
                alpha = 1;
            }
            ctx.globalAlpha = alpha;
            super.draw(ctx);
            ctx.globalAlpha = 1;
        }

        drawEaseOut(ctx) {
            let alpha = 1 - this.animFrames / this.animDuration;
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
            super(sprites.fragile, altitude);
            this.collapse = false;
            super.setAnimation(sprites.fragile.animSrc, 5);
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

        update(deltaFrames, rhythm) {
            super.update(deltaFrames, rhythm);
            if (this.collapse) {
                this.anim.update(deltaFrames);
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
            super(sprites.moving, altitude);
            super.setAnimation(sprites.moving.animSrc, 6).loop();
            super.startPatrol(config.platformMoveSpeed);
        }

        reset(altitude) {
            super.reset(altitude);
            super.startPatrol(config.platformMoveSpeed);
        }

        update(deltaFrames, rhythm) {
            super.update(deltaFrames, rhythm);
            this.anim.update(deltaFrames, rhythm);
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
            super(sprites.cloud, altitude);
            this.collapse = false;
            super.setAnimation(sprites.cloud.animSrc, 4);
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

        update(deltaFrames, rhythm) {
            super.update(deltaFrames, rhythm);
            if (this.collapse) {
                this.anim.update(deltaFrames);
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
            super(sprites.thorn, altitude);
            super.setAnimation(sprites.thorn.animSrc, 6).loop(60);
        }

        reset(altitude) {
            super.reset(altitude);
            this.anim.reset();
        }

        isBeingStepped(android) {
            const flag = super.isBeingStepped(android);
            if (flag) {
                return config.COLLIDE_TYPE_HURT;
            }
            return config.COLLIDE_TYPE_NONE;
        }

        update(deltaFrames, rhythm) {
            super.update(deltaFrames, rhythm);
            this.anim.update(deltaFrames, rhythm);
        }

        draw(ctx) {
            this.anim.drawClip(ctx);
        }
    }

    // This platform has a spring on it. Androids can jump even higher on it.
    class StairSpring extends Stair {
        constructor(altitude) {
            super(sprites.spring, altitude);
            this.bounce = false;
            super.setAnimation(sprites.spring.animSrc, 2).stayAfterFinish();
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

        update(deltaFrames, rhythm) {
            super.update(deltaFrames, rhythm);
            if (this.bounce) {
                this.anim.update(deltaFrames);
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
            super(sprites.slime, altitude);
            super.setAnimation(sprites.slime.animSrc, 6).loop(10);
            super.startPatrol(config.platformMoveSpeed);
            this.kicked = false;
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

        update(deltaFrames, rhythm) {
            if (this.kicked) {
                this.velocityY += config.gravity * deltaFrames;
                this.altitude -= this.velocityY * deltaFrames;
            }
            super.update(deltaFrames, rhythm);
            if (!this.kicked) {
                this.anim.update(deltaFrames, rhythm);
                this.y += joggleDelta(config.slimeJoggleDuration,
                    config.slimeJoggleDistance, rhythm);
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
