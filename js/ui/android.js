define(["ui/sprite", "util/input", "util/camera", "util/config",
], function (Sprite, input, camera, config) {

    const enableCheats = false;
    const cheatKey = "KeyZ";

    const sprite = {
        src: "android",
        srcFlip: "android-flip",
        animSrc: {
            power: [
                "android-power-up-1",
                "android-power-up-2",
                "android-power-up-3",
            ],
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
    }

    class Android extends Sprite {
        constructor() {
            super(sprite.src);
            this.flippedImg = sprite.srcFlip;
            this.animPower = super.newAnimation(sprite.animSrc.power, 8, true);
            this.animFall = super.newAnimation(sprite.animSrc.fall, 6, true);
            this.animHurt = super.newAnimation(sprite.animSrc.hurt, 4, false, false);
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
            this.powering = false;
            this.powerFrame = 0;

            this.animFall.reset();
            this.falling = false;

            this.animHurt.reset();
            this.hurting = false;

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
            this.powering = true;
            this.powerFrame = 0;
        }

        // Game over condition: hurt by thorn or slime.
        hurt() {
            this.hurting = true;
        }

        // Game over condition: fall off the platforms.
        fall() {
            this.falling = true;
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

        update(deltaFrames) {
            if (this.overwriteUpdate) {
                this.x = this.clampX(this.x);
                this.y = camera.follow(this.getRealCenterPosition()).y - this.h / 2;
                this.overwriteUpdate = false;
                return;
            }

            // Update Y position except on hurting animation.
            if (!this.hurting) {
                if (this.powering) {
                    // When there is a power up, velocity.y shall be constant and not
                    // be affected by gravity.
                    this.velocity.y = config.powerUpVelocity;
                    if (++this.powerFrame >= config.powerUpDuration) {
                        this.powering = false;
                    }
                    this.animPower.update(deltaFrames);
                } else {
                    // Gravity changes velocity.y.
                    this.velocity.y = Math.min(config.maxFallingVelocity,
                        this.velocity.y + config.gravity * deltaFrames);
                }
                // Update altitude and Y position in canvas.
                this.altitude -= this.velocity.y * deltaFrames;
                this.maxAltitude = Math.max(this.maxAltitude, this.altitude);
                this.y = camera.follow(this.getRealCenterPosition()).y - this.h / 2;
            }

            // Update X position based on user input.
            if (this.falling) {
                this.animFall.update(deltaFrames);
            } else if (this.hurting) {
                this.animHurt.update(deltaFrames);
            } else {
                // Horizontal input, only takes effect if the android is not about to die.
                this.velocity.x = input.horizontalAxis() * config.moveVelocity;
                this.x = this.clampX(this.x + this.velocity.x * deltaFrames);

                // Flip the sprite based on velocity.x. If there isn't any input, the flip
                // variable should be left as is.
                if (this.velocity.x < 0) {
                    this.flip = true;
                } else if (this.velocity.x > 0) {
                    this.flip = false;
                }

                // If android is not about to die, update() receives a cheat command to
                // perform any mid-air jump. To disable this debug feature, modify
                // enableCheats to false.
                if (enableCheats && input.onKey(cheatKey)) {
                    this.jump();
                }
            }
        }

        // Predict next position of android.
        // This is used to detect possible collision of platforms. If a collision is
        // about to happen, the next frame will be calibrated.
        predict(deltaFrames) {
            const nextVelocity = {
                x: this.velocity.x,
                y: this.velocity.y + config.gravity * deltaFrames,
            };
            const currentCenterPosition = this.getRealCenterPosition();
            const currentPosition = {
                x: currentCenterPosition.x - this.w / 2,
                y: currentCenterPosition.y - this.h / 2,
            };
            const nextPosition = {
                x: currentPosition.x + nextVelocity.x * deltaFrames,
                y: currentPosition.y + nextVelocity.y * deltaFrames,
            };
            if (!this.bindOverwriteNextAltitude) {
                this.bindOverwriteNextAltitude = this.overwriteNextAltitude.bind(this);
            }
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
            if (this.powering) {
                this.animPower.drawClip(ctx);
            } else if (this.falling) {
                this.animFall.drawClip(ctx);
            } else if (this.hurting) {
                this.animHurt.drawClip(ctx);
            } else if (this.flip) {
                super.draw(ctx, this.flippedImg);
            } else {
                super.draw(ctx);
            }

            // this.drawDebugAltitude(ctx);
        }

        drawDebugAltitude(ctx) {
            const textX = this.x + this.w / 2;
            const textY = this.y - 10;
            ctx.fillStyle = "#333";
            ctx.font = "16px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(String(Math.floor(this.altitude)), textX, textY);
        }
    }

    return new Android();
});
