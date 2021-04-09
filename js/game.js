define(["ui/android", "ui/spawns", "ui/ribbon", "ui/panel",
    "util/constants", "util/input", "util/camera"], function (
    android, platforms, ribbon, panel, constants, input, camera
) {

    // Maintains/Persists best game score.
    const bestScore = (function () {
        const key = "best";
        return {
            retrieve: function () {
                const value = localStorage.getItem(key);
                if (value) {
                    ribbon.setAltitude(value);
                    return value;
                }
                return 0;
            },
            store: function (value) {
                ribbon.setAltitude(value);
                localStorage.setItem(key, value);
            }
        };
    })();

    return class Game {
        constructor(container) {
            this.container = container;
            this.init();
            this.loop();
            // this.restart();
        }

        init() {
            this.canvas = this.createCanvas();
            this.context = this.canvas.getContext("2d");

            this.frames = 0;
            this.gameOverAt = 0;
            this.bestScore = bestScore.retrieve();
            this.bindLoop = this.loop.bind(this);

            window.addEventListener("resize", this.onResizeWindow.bind(this));
            window.addEventListener("mousedown", this.onClickEvent.bind(this));
        }

        // self-explanatory
        createCanvas() {
            const canvas = document.createElement("canvas");
            canvas.width = camera.getWidth();
            canvas.height = camera.getHeight();
            this.container.appendChild(canvas);
            this.centerContainer();
            return canvas;
        }

        // self-explanatory
        centerContainer() {
            this.container.style.width = camera.getWidth() + "px";
            this.container.style.height = camera.getHeight() + "px";
            this.x = (window.innerWidth - camera.getWidth()) / 2;
            this.y = (window.innerHeight - camera.getHeight()) / 2;
            this.container.style.marginLeft = this.x + "px";
            this.container.style.marginTop = this.y + "px";
        }

        // Listens to resize event.
        // Centers the canvas container and notify relative parties of this change.
        onResizeWindow() {
            camera.onResize();
            this.canvas.width = camera.getWidth();
            this.canvas.height = camera.getHeight();
            this.centerContainer();
            panel.onResize();
        }

        // Listens to mousedown event.
        onClickEvent(e) {
            const where = {x: e.x, y: e.y};
            if (e.target === this.canvas) {
                where.x -= this.x;
                where.y -= this.y;
                if (this.isGameOver()) {
                    if (panel.isClickingRestart(where)) {
                        this.restart();
                    }
                }
            }
        }

        // Resets everything and restart the game.
        restart() {
            cancelAnimationFrame(this.animId);
            this.frames = 0;
            this.gameOverAt = Infinity;
            android.reset();
            platforms.reset();
            this.loop();
        }

        // Updates UI logic at every frame.
        update() {
            if (this.isGameOver()) {
                panel.update();
                return;
            }

            android.update();
            platforms.update(this.frames);
            ribbon.update();

            const collideType = platforms.checkCollision(android);
            switch (collideType) {
                case constants.COLLIDE_TYPE_JUMP:
                    android.jump();
                    break;
                case constants.COLLIDE_TYPE_BOUNCE:
                    android.bounce();
                    break;
                case constants.COLLIDE_TYPE_POWER:
                    android.powerUp();
                    break;
                case constants.COLLIDE_TYPE_HURT:
                    if (!this.isPlaningGameOver()) {
                        android.hurt();
                        this.showGameOver(50);
                    }
                    break;
                case constants.COLLIDE_TYPE_FALL:
                    if (!this.isPlaningGameOver()) {
                        android.fall();
                        this.showGameOver(50);
                    }
                    break;
                default:
                    break;
            }
        }

        // Render UI at every frame.
        render() {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (!this.gameOverAt) { // first
                panel.draw(this.context);
                this.drawScore(this.context);
            } else if (this.isGameOver()) {
                panel.drawGameOver(this.context);
                this.drawScore(this.context);
            } else {
                android.draw(this.context);
                platforms.draw(this.context);
                this.drawScore(this.context);
                if (!this.isPlaningGameOver()) {
                    ribbon.draw(this.context);
                }
            }
        }

        loop() {
            if (this.isGameOver() && input.onSpace()) {
                this.restart();
                return;
            }
            ++this.frames;
            this.update();
            this.render();
            this.animId = requestAnimationFrame(this.bindLoop);
        }

        // showGameOver puts current frame to the GameOver frame (arg: gameOverAt),
        // or after delayed frames.
        showGameOver(delay = 0) {
            this.gameOverAt = this.frames + delay;
            this.bestScore = Math.max(this.bestScore, android.getScore());
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

        drawScore(ctx) {
            ctx.fillStyle = "#555";
            // ctx.font = "20px Arial";
            ctx.font = `${20 * camera.getRatio()}px Arial`;
            ctx.textBaseline = "bottom";
            ctx.textAlign = "left";
            const padding = 60 * camera.getRatio();
            ctx.clearRect(0, 0, this.canvas.width, padding + 5);
            ctx.fillText(
                `Score: ${android.getScore()}    Best: ${this.bestScore}`,
                40 * camera.getRatio(), padding
            );
        }
    }
});