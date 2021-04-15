define(["ui/pool", "util/config"], function (pool, config) {
    const stairs = [];

    let current; // altitude

    // Add a new platform to the current altitude.
    function add() {
        stairs.push(pool.retrieve(current));
        current += config.platformGap;
    }

    // Create enough initial platforms at game's start.
    function init() {
        const size = Math.ceil(config.height / config.platformGap);
        const start = -Math.round(config.height * 0.46);

        while (stairs.length) {
            stairs.pop();
        }
        current = start;
        for (let i = 0; i < size; ++i) {
            add();
        }
    }

    return {
        // Param rhythm is used to synchronize some of the animations so
        // they don't seem off the beat. It can be passed in as frames
        // elapsed since game start.
        update: function (deltaFrames, rhythm) {
            while (stairs[stairs.length - 1].hasEntered()) {
                add();
            }
            while (stairs[0].hasGone()) {
                stairs.shift().disable();
            }
            for (const stair of stairs) {
                stair.update(deltaFrames, rhythm);
            }
        },

        // Check if android shall collide with any platform, also check if
        // there are no platforms underneath it.
        checkCollision(android) {
            for (const stair of stairs) {
                const flag = stair.isBeingStepped(android);
                if (flag) {
                    return flag;
                }
            }
            let fall = true;
            for (const stair of stairs) {
                if (stair.altitude - android.altitude < config.fallingThreshold) {
                    fall = false;
                    break;
                }
            }
            if (fall) {
                return config.COLLIDE_TYPE_FALL;
            }
            return config.COLLIDE_TYPE_NONE;
        },

        draw: function (ctx) {
            stairs.forEach(it => it.draw(ctx));
        },

        reset: function () {
            pool.reset();
            init();
        }
    };
});
