define(["ui/sprite", "util/input", "util/camera", "util/config",
], function (Sprite, input, camera, config) {

    const enableCheats = false;
    const cheatKey = "KeyZ";

    const sprite = {
        src: "android",
        srcFlip: "android-flip",
        animSrc: {
            power: {
                src: [
                    "android-power-up-1",
                    "android-power-up-2",
                    "android-power-up-3",
                ],
                flip: [
                    "android-power-up-flip-1",
                    "android-power-up-flip-2",
                    "android-power-up-flip-3",
                ],
            },
            fall: [
                "android-fall-1",
                "android-fall-2",
            ],
            hurt: [
                "android-hurt-1",
                "android-hurt-2",
                "android-hurt-3",
                "android-hurt-4",
                "android-hurt-5",
                "android-hurt-6",
                "android-hurt-7",
                "android-hurt-8",
            ],
        },
    };

    const status = {
        DEFAULT: "default",
        POWERING: "powering",
        HURTING: "hurting",
        FALLING: "falling",
    };

    class Android extends Sprite {
        constructor() {
            super(sprite.src);
            this.animPower = super.newAnimation(sprite.animSrc.power.src, 4).loop();
            this.animFall = super.newAnimation(sprite.animSrc.fall, 6).loop();
            this.animHurt = super.newAnimation(sprite.animSrc.hurt, 4);
            this.bindOverwriteNextAltitude = this.overwriteNextAltitude.bind(this);
            this.reset();
        }

        // Reset android to original point, clear velocity, animations,
        // and ask for camera's instant attention.
        reset() {
            this.x = (config.width - this.w) / 2;
            this.y = (config.height - this.h) / 2;

            this.velocity = {x: 0, y: 0};
            this.altitude = 0;
            this.maxAltitude = 0;
            this.flip = false;

            this.animPower.reset();
            this.animFall.reset();
            this.animHurt.reset();

            this.staus = status.DEFAULT;
            this.frameCounter = 0;
            this.overwriteUpdate = false;

            camera.moveTo(this.getRealCenterPosition());
        }

        // General behavior of android after stepped on a platform.
        jump() {
            this.velocity.y = config.jumpVelocity;
        }

        // Particular behavior of android after stepped on a spring.
        bounce() {
            this.velocity.y = config.bounceVelocity;
        }

        // Android receives a power up as luck would have it.
        // It sprints upwards meanwhile ignores gravity, until a certain amount of frames.
        powerUp() {
            this.frameCounter = 0;
            this.staus = status.POWERING;
            this.animPower.setSource(this.flip ?
                sprite.animSrc.power.flip :
                sprite.animSrc.power.src);
        }

        // Game over condition: hurt by thorn or slime.
        hurt() {
            this.staus = status.HURTING;
            camera.prepareShake();
        }

        // Game over condition: fall off the platforms.
        fall() {
            this.staus = status.FALLING;
        }

        // The absolute position of the android.
        getRealCenterPosition() {
            return {
                x: this.x + this.w / 2,
                y: -this.altitude,
            };
        }

        // Clamp the X position of the android so it does not move outside the canvas.
        // Android comes out from right side of the canvas if it goes outside the left
        // range, and vice versa.
        clampX(x) {
            if (x < -this.w / 2) {
                return config.width - this.w / 2;
            }
            if (x > config.width - this.w / 2) {
                return -this.w / 2;
            }
            return x;
        }

        leadCamera() {
            this.y = camera.follow(this.getRealCenterPosition()).y - this.h / 2;
        }

        update(deltaFrames) {
            if (this.overwriteUpdate) {
                // Mandatorily overwrite android's position. This is typically used
                // by a collision event to correct android's position to be exactly
                // on top of a platform.
                this.x = this.clampX(this.x);
                this.leadCamera();
                this.overwriteUpdate = false;
                return;
            }

            switch (this.staus) {
                case status.DEFAULT:
                    // Android position is affected by gravity and user's horizontal
                    // input.
                    this.applyHorizontalMovement(deltaFrames);
                    this.applyVerticalMovement(deltaFrames, config.gravity,
                        config.maxFallingVelocity);

                    // If android is not about to die, update() receives a cheat
                    // command to perform any mid-air jump. To disable this debug
                    // feature, modify enableCheats to false.
                    if (enableCheats && input.onKey(cheatKey)) {
                        this.jump();
                    }
                    break;
                case status.POWERING:
                    // When there is a power up, velocity.y shall be constant and
                    // not be affected by gravity. User's horizontal input still
                    // takes effect.
                    this.velocity.y = config.powerUpVelocity;
                    this.frameCounter += deltaFrames;
                    if (this.frameCounter >= config.powerUpDuration) {
                        this.staus = status.DEFAULT;
                    }
                    this.animPower.update(deltaFrames);
                    this.applyHorizontalMovement(deltaFrames);
                    this.applyVerticalMovement(deltaFrames);
                    break;
                case status.HURTING:
                    // When android is hurting, neither gravity nor user input will
                    // be able to affect its position.
                    this.animHurt.update(deltaFrames);
                    // Camera shakes for a short amount of time.
                    camera.shake(deltaFrames);
                    break;
                case status.FALLING:
                    // When falling to the abyss, android will be pulled down
                    // however gravity sees fit. No user input will be read.
                    this.animFall.update(deltaFrames);
                    this.applyVerticalMovement(deltaFrames, config.gravity);
                    break;
                default:
                    console.error("Unknown android status", this.staus);
                    break;
            }
        }

        applyHorizontalMovement(deltaFrames) {
            // Read horizontal input, only takes effect if the android is not about to die.
            this.velocity.x = input.horizontalAxis() * config.moveVelocity;
            this.x = this.clampX(this.x + this.velocity.x * deltaFrames);

            // Flip the sprite based on velocity.x. If there isn't any input, the flip
            // variable should be left as is.
            if (this.velocity.x < 0) {
                this.flip = true;
            } else if (this.velocity.x > 0) {
                this.flip = false;
            }
        }

        applyVerticalMovement(deltaFrames, gravity, maxFallingVelocity) {
            let nextVelocity = this.velocity.y;
            if (gravity) {
                // Gravity taking effect.
                nextVelocity += gravity * deltaFrames;
                if (maxFallingVelocity && this.velocity.y > maxFallingVelocity) {
                    nextVelocity = maxFallingVelocity;
                }
            }
            // Update altitude and Y position in canvas.
            this.altitude -= (this.velocity.y + nextVelocity) / 2 * deltaFrames;
            this.maxAltitude = Math.max(this.maxAltitude, this.altitude);
            this.leadCamera();
            // Update velocity.y.
            this.velocity.y = nextVelocity;
        }

        // Predict next position of android.
        // This is used to detect possible collision of platforms. If a collision is
        // about to happen, the next frame will be calibrated.
        predict(deltaFrames) {
            const nextVelocity = {
                x: this.velocity.x,
                y: Math.min(
                    config.maxFallingVelocity,
                    this.velocity.y + config.gravity * deltaFrames,
                ),
            };
            const currentCenterPosition = this.getRealCenterPosition();
            const currentPosition = {
                x: currentCenterPosition.x - this.w / 2,
                y: currentCenterPosition.y - this.h / 2,
            };
            const nextPosition = {
                x: currentPosition.x + nextVelocity.x * deltaFrames,
                y: currentPosition.y + (this.velocity.y + nextVelocity.y) / 2 *
                    deltaFrames,
            };
            return {
                ...nextPosition,
                altitude: -nextPosition.y,
                velocity: nextVelocity,
                w: this.w,
                h: this.h,
                overwriteNextAltitude: this.bindOverwriteNextAltitude,
            };
        }

        // When android collides with a platform, amend its vertical position to
        // be exactly on top of it at the next frame update.
        overwriteNextAltitude(nextAndroid, altitude) {
            this.x = nextAndroid.x;
            this.altitude = altitude + this.h / 2;
            this.overwriteUpdate = true;
        }

        draw(ctx) {
            switch (this.staus) {
                case status.DEFAULT:
                    super.draw(ctx, this.flip ? sprite.srcFlip : sprite.src);
                    break;
                case status.POWERING:
                    this.animPower.drawClip(ctx);
                    break;
                case status.HURTING:
                    this.animHurt.drawClip(ctx);
                    break;
                case status.FALLING:
                    this.animFall.drawClip(ctx);
                    break;
                default:
                    break;
            }

            // this.drawDebugAltitude(ctx);
        }

        drawDebugAltitude(ctx) {
            const textX = this.x + this.w / 2;
            const textY = this.y - config.relativePixel(8);
            ctx.fillStyle = "#333";
            ctx.font = config.fontSize(16) + "px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(Math.floor(this.altitude)), textX, textY);
        }
    }

    return new Android();
});
