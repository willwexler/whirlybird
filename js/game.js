define(["ui/android", "ui/spawns", "ui/ribbon", "ui/panel", "util/config",
    "util/input"], function (android, platforms, ribbon, panel, config, input
) {

    // Maintain/Persist best game score.
    const bestScore = (function () {
        const key = "best";
        return {
            retrieve: function () {
                const value = localStorage.getItem(key);
                return value ? value : 0;
            },
            store: function (value) {
                localStorage.setItem(key, value);
            }
        };
    })();

    // Title bar, draws scores, FPS text.
    const titleBar = (function () {
        const debuggable = true;
        const fpsText = {
            x: 0, y: 0, w: 0, h: 0,
            clickBox: {x: 0, y: 0, w: 0, h: 0},
            clickInterval: 600,
            clickStreak: 6,
            clickCount: 0,
            lastClickTime: 0,
        };

        fpsText.isClickingMe = function (point) {
            return point.x > this.clickBox.x &&
                point.x < this.clickBox.x + this.clickBox.w &&
                point.y > this.clickBox.y &&
                point.y < this.clickBox.y + this.clickBox.h;
        };
        fpsText.strikethrough = function (ctx) {
            ctx.strokeStyle = ctx.fillStyle;
            ctx.strokeRect(this.x, this.y + this.h / 2, this.w, 1);
        };
        fpsText.strokeBox = function (ctx) {
            ctx.strokeStyle = "red";
            ctx.strokeRect(this.clickBox.x, this.clickBox.y,
                this.clickBox.w, this.clickBox.h);
        };
        fpsText.onClick = function (point) {
            if (!this.isClickingMe(point)) {
                return;
            }
            const now = performance.now();
            if (!this.lastClickTime) {
                this.lastClickTime = now;
                this.clickCount = 1;
                return;
            }
            if (now - this.lastClickTime < this.clickInterval) {
                if (++this.clickCount >= this.clickStreak) {
                    this.clickCount = 0;
                    const flag = config.toggleFramerateCalibration();
                    alert((flag ? "Enabled" : "Disabled") + " framerate calibration.");
                }
            } else {
                this.clickCount = 1;
            }
            this.lastClickTime = now;
        };

        // Reset text box after resize.
        config.registerResizeEvent(() => fpsText.w = 0);

        return {
            draw: function (ctx, score, bestScore) {
                const paddingTop = config.relativePixel(60);
                const paddingLeft = config.relativePixel(40);
                const fontSize = config.fontSize(20);

                ctx.fillStyle = "#555";
                ctx.font = `${fontSize}px Arial`;
                ctx.textBaseline = "bottom";
                ctx.textAlign = "left";
                ctx.clearRect(0, 0, config.width, paddingTop + config.relativePixel(5));
                ctx.fillText(
                    `Score: ${Math.floor(score)}    Best: ${Math.floor(bestScore)}`,
                    paddingLeft, paddingTop
                );
                ctx.textAlign = "right";
                ctx.fillText(`FPS: ${config.fps}`, config.width - paddingLeft, paddingTop);
                if (!fpsText.w) {
                    fpsText.w = ctx.measureText("FPS: 00").width;
                    fpsText.x = config.width - paddingLeft - fpsText.w;
                    fpsText.h = config.relativePixel(24);
                    fpsText.y = paddingTop - fpsText.h;
                    const pad = fpsText.h;
                    fpsText.clickBox = {
                        x: fpsText.x - pad,
                        y: fpsText.y - pad,
                        w: fpsText.w + pad * 2,
                        h: fpsText.h + pad * 2,
                    }
                }
                if (!config.hasEnabledFramerateCalibration()) {
                    fpsText.strikethrough(ctx);
                }
                // fpsText.strokeBox(ctx);
            },
            onClick(point) {
                if (debuggable) {
                    fpsText.onClick(point);
                }
            },
        };
    })();

    // Workspace manages canvas and its context.
    const workspace = (function () {
        const exports = {x: 0, y: 0, canvas: null, context: null};

        function centerContainer() {
            exports.x = (window.innerWidth - config.width) / 2;
            exports.y = (window.innerHeight - config.height) / 2;
            exports.container.style.width = config.width + "px";
            exports.container.style.height = config.height + "px";
            exports.container.style.marginLeft = exports.x + "px";
            exports.container.style.marginTop = exports.y + "px";
            exports.container.style.borderRadius = config.relativePixel(
                config.wholeScreen ? 0 : 16) + "px";
        }

        function enableRetinaDisplay() {
            exports.canvas.style.width = config.width + "px";
            exports.canvas.style.height = config.height + "px";
            exports.canvas.width = config.width * devicePixelRatio;
            exports.canvas.height = config.height * devicePixelRatio;
            exports.context.scale(devicePixelRatio, devicePixelRatio);
            // This is a pixel game. Sprites should have clean and sharp edges.
            exports.context.imageSmoothingEnabled = false;
        }

        exports.setup = function (container) {
            this.container = container;
            this.canvas = document.createElement("canvas");
            this.canvas.width = config.width;
            this.canvas.height = config.height;
            this.context = this.canvas.getContext("2d");
            this.container.appendChild(this.canvas);

            centerContainer();
            enableRetinaDisplay();

            config.registerResizeEvent(function () {
                centerContainer();
                enableRetinaDisplay();
            });
        };

        return exports;
    })();

    const pages = {
        HOME: "home",
        GAME: "game",
        GAME_OVER: "over",
    };

    return class Game {
        constructor(container) {
            this.init(container);
            this.start();
            // this.restart();
        }

        init(container) {
            this.page = pages.HOME;
            this.frames = 0;
            this.gameOverAt = 0;
            this.score = 0;
            this.bestScore = bestScore.retrieve();

            workspace.setup(container);
            workspace.canvas.addEventListener("click", this.onClickEvent.bind(this));
            workspace.canvas.addEventListener("touchstart", this.onTouchEvent.bind(this));
        }

        // Listens to click event.
        onClickEvent(e) {
            this.onClick(e);
        }

        onTouchEvent(e) {
            // Some mobile devices simulate mouse clicks from touches. This avoids
            // double-click.
            e.preventDefault();
            this.onClick(e.touches[0]);
        }

        onClick(e) {
            if (e.target !== workspace.canvas) {
                return;
            }
            const where = {x: e.clientX, y: e.clientY};
            where.x -= workspace.x;
            where.y -= workspace.y;
            if (this.page !== pages.GAME && panel.isClickingRestart(where)) {
                this.restart();
            }
            titleBar.onClick(where);
        }

        start() {
            config.throttleFPS(() => {
                this.update();
                this.render();
            }, 0);

            // const loop = function () {
            //     this.update();
            //     this.render();
            //     requestAnimationFrame(loop);
            // }.bind(this);
            //
            // requestAnimationFrame(loop);
        }

        // Resets everything and restart the game.
        restart() {
            this.page = pages.GAME;
            this.frames = 0;
            this.gameOverAt = Infinity;
            this.score = 0;
            android.reset();
            platforms.reset();
            ribbon.setBestScore(this.bestScore);
        }

        // Updates UI logic at every frame.
        update() {
            const deltaFrames = config.elapsedFrames();
            this.frames += deltaFrames;

            switch (this.page) {
                case pages.GAME:
                    if (this.isGameOver()) {
                        this.page = pages.GAME_OVER;
                    } else {
                        this.updateGame(deltaFrames);
                    }
                    break;
                case pages.HOME:
                // fallthrough
                case pages.GAME_OVER:
                    panel.update(deltaFrames);
                    if (input.onSpace()) {
                        this.restart();
                    }
                    break;
                default:
                    break;
            }
        }

        updateGame(deltaFrames) {
            android.update(deltaFrames);
            platforms.update(deltaFrames, this.frames);
            ribbon.update();

            // Collision check might result to a game-over, therefore score
            // should be set before checking collision.
            this.score = config.altitudeToScore(android.maxAltitude);

            // Predict collision of the next frame.
            if (this.isPlaningGameOver()) {
                return;
            }
            const nextAndroid = android.predict(deltaFrames);
            const collideType = platforms.checkCollision(nextAndroid);
            switch (collideType) {
                case config.COLLIDE_TYPE_JUMP:
                    android.jump();
                    break;
                case config.COLLIDE_TYPE_BOUNCE:
                    android.bounce();
                    break;
                case config.COLLIDE_TYPE_POWER:
                    android.powerUp();
                    break;
                case config.COLLIDE_TYPE_HURT:
                    android.hurt();
                    this.showGameOver(50);
                    break;
                case config.COLLIDE_TYPE_FALL:
                    android.fall();
                    this.showGameOver(50);
                    break;
                default:
                    break;
            }
        }

        // Render UI at every frame.
        render() {
            workspace.context.clearRect(0, 0, config.width, config.height);

            switch (this.page) {
                case pages.HOME:
                    panel.draw(workspace.context, "START GAME");
                    break;
                case pages.GAME:
                    android.draw(workspace.context);
                    platforms.draw(workspace.context);
                    ribbon.draw(workspace.context);
                    break;
                case pages.GAME_OVER:
                    panel.draw(workspace.context, "GAME OVER");
                    break;
                default:
                    break;
            }

            // Title bar overlaps top area of the canvas, thus should draw at last.
            titleBar.draw(workspace.context, this.score, this.bestScore);
        }

        // showGameOver puts current frame to the GameOver frame (arg: gameOverAt),
        // or after delayed frames.
        showGameOver(delay = 0) {
            this.gameOverAt = this.frames + delay;
            this.bestScore = Math.max(this.bestScore, this.score);
            bestScore.store(this.bestScore);
        }

        // Check if game is about to end. this is used to prevent a delayed GameOver
        // from being called multiple times.
        isPlaningGameOver() {
            return this.gameOverAt < Infinity;
        }

        // Game is ended if the current frame has passed the GameOver frame.
        isGameOver() {
            return this.frames >= this.gameOverAt;
        }
    }
});
