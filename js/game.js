define(["ui/android", "ui/spawns", "ui/ribbon", "ui/panel", "util/config",
    "util/input"], function (android, platforms, ribbon, panel, config, input
) {

    // Maintain/Persist best game score.
    const bestScore = (function () {
        const key = "best";
        return {
            retrieve: function () {
                const value = localStorage.getItem(key);
                if (value) {
                    ribbon.setBestScore(value);
                    return value;
                }
                return 0;
            },
            store: function (value) {
                ribbon.setBestScore(value);
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
            this.canvas = this.createCanvas(this.container);
            this.context = this.canvas.getContext("2d");
            this.centerContainer();
            this.enableHighResolutionDisplay();

            this.frames = 0;
            this.gameOverAt = 0;
            this.score = 0;
            this.bestScore = bestScore.retrieve();
            this.bindLoop = this.loop.bind(this);

            window.addEventListener("resize", this.onResizeWindow.bind(this));
            window.addEventListener("click", this.onClickEvent.bind(this));
            window.addEventListener("touchstart", this.onTouchEvent.bind(this));
        }

        // self-explanatory
        createCanvas(container) {
            const canvas = document.createElement("canvas");
            canvas.width = config.width;
            canvas.height = config.height;
            container.appendChild(canvas);
            return canvas;
        }

        // self-explanatory
        centerContainer() {
            this.container.style.width = config.width + "px";
            this.container.style.height = config.height + "px";
            this.x = (window.innerWidth - config.width) / 2;
            this.y = (window.innerHeight - config.height) / 2;
            this.container.style.marginLeft = this.x + "px";
            this.container.style.marginTop = this.y + "px";
        }

        enableHighResolutionDisplay() {
            this.canvas.style.width = config.width + "px";
            this.canvas.style.height = config.height + "px";
            this.canvas.width = config.width * devicePixelRatio;
            this.canvas.height = config.height * devicePixelRatio;
            this.context.scale(devicePixelRatio, devicePixelRatio);
            // This is a pixel game. Sprites should have clean and sharp edges.
            this.context.imageSmoothingEnabled = false;
        }

        // Listens to resize event.
        // Center the canvas container and notify relevant parties of this change.
        onResizeWindow() {
            config.updateOnResize();
            this.centerContainer();
            this.enableHighResolutionDisplay();
        }

        // Listens to click event.
        onClickEvent(e) {
            this.onClick(e);
        }

        onTouchEvent(e) {
            this.onClick(e.touches[0]);
        }

        onClick(e) {
            if (!this.isGameOver() || e.target !== this.canvas) {
                return;
            }
            const where = {x: e.clientX, y: e.clientY};
            where.x -= this.x;
            where.y -= this.y;
            if (panel.isClickingRestart(where)) {
                this.restart();
            }
        }

        // Resets everything and restart the game.
        restart() {
            cancelAnimationFrame(this.animId);
            this.frames = 0;
            this.gameOverAt = Infinity;
            this.score = 0;
            android.reset();
            platforms.reset();
            this.loop();
        }

        // Updates UI logic at every frame.
        update() {
            const deltaFrames = config.elapsedFrames();
            this.frames += deltaFrames;

            if (this.isGameOver()) {
                panel.update(deltaFrames);
                return;
            }

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
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

            if (!this.gameOverAt) { // first
                panel.draw(this.context, "START GAME");
            } else if (this.isGameOver()) {
                panel.draw(this.context, "GAME OVER");
            } else {
                android.draw(this.context);
                platforms.draw(this.context);
                if (!this.isPlaningGameOver()) {
                    ribbon.draw(this.context);
                }
            }
            this.drawScore(this.context);
        }

        loop() {
            if (this.isGameOver() && input.onSpace()) {
                this.restart();
                return;
            }
            this.update();
            this.render();
            this.animId = requestAnimationFrame(this.bindLoop);
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

        drawScore(ctx) {
            ctx.fillStyle = "#555";
            ctx.font = `${config.fontSize(20)}px Arial`;
            ctx.textBaseline = "bottom";
            ctx.textAlign = "left";
            const padding = config.relativePixel(60);
            ctx.clearRect(0, 0, this.canvas.width, padding + 5);
            ctx.fillText(
                `Score: ${Math.floor(this.score)}    Best: ${Math.floor(this.bestScore)}`,
                config.relativePixel(40), padding
            );
        }
    }
});
