define(["ui/pool", "util/constants"], function (pool, constants) {
    const gap = constants.platformGap; // gap between two platforms
    const stairs = [];

    let current; // altitude

    // Adds a new platform to the current altitude.
    function add() {
        stairs.push(pool.retrieve(current));
        current += gap;
    }

    // Create enough initial platforms at game's start.
    function init() {
        const size = Math.ceil(constants.height / gap);
        const start = -Math.round(constants.height * 0.46);

        while (stairs.length) {
            stairs.pop();
        }
        current = start;
        for (let i = 0; i < size; ++i) {
            add();
        }
    }

    return {
        update: function (frames) {
            if (stairs[0].hasGone()) {
                stairs[0].disable();
                stairs.shift();
            }
            if (stairs[stairs.length - 1].hasEntered()) {
                add();
            }
            for (let stair of stairs) {
                stair.update(frames);
            }
        },

        // Check if android shall collide with any platform, also check if
        // there's no platforms underneath it.
        checkCollision(android) {
            for (let stair of stairs) {
                const flag = stair.isBeingStepped(android);
                if (flag) {
                    return flag;
                }
            }
            let fall = true;
            for (let stair of stairs) {
                if (android.y - stair.y < constants.fallingThreshold) {
                    fall = false;
                    break;
                }
            }
            if (fall) {
                return constants.COLLIDE_TYPE_FALL;
            }
            return constants.COLLIDE_TYPE_NONE;
        },

        draw: function (ctx) {
            stairs.forEach(stair => {
                stair.draw(ctx);
            });
        },

        reset: function () {
            pool.reset();
            init();
        }
    };
});
