define(["ui/stair", "util/config"], function (stair, config) {
    const sprites = stair.sprites;

    // The pool maintains all sorts of platforms so that they won't be
    // instantiated and destroyed over and over.
    const platformPool = (function () {
        const pool = {};

        for (const it of sprites.types) {
            pool[it] = [];
        }

        return {
            retrieve: function (type, altitude) {
                const cached = pool[type];
                // find recyclable
                for (const it of cached) {
                    if (!it.active) {
                        it.reset(altitude);
                        return it;
                    }
                }
                // append the pool
                const append = sprites[type].instantiate(altitude);
                cached.push(append);
                // console.log("pool appended", type, cached.length);
                return append;
            },
            disableAll: function () {
                Object.values(pool).forEach(arr => {
                    arr.forEach(it => it.disable());
                });
            },
        }
    })();

    // Randomizer yields random platforms while maintaining playability.
    const randomizer = (function () {
        const maxUnstableStairsStreak = 4;
        const startUpBonus = 10;
        const previousStairs = [];
        const previousStairsLength = maxUnstableStairsStreak - 1;

        let stairCount = 0;

        function stairAcceptable(type) {
            const next = sprites[type];

            // Platforms of the first page should be simple.
            if (stairCount < startUpBonus && !next.starter) {
                return false;
            }

            // previousStairs hasn't yet been initialized, should all be stable.
            if (previousStairs.length < previousStairsLength) {
                if (!next.stable) {
                    return false;
                }
                previousStairs.push(next);
                return true;
            }

            // If trying to add an unstable platform.
            if (!next.stable) {
                let hasStable = false;
                for (const previous of previousStairs) {
                    if (previous.stable) {
                        hasStable = true;
                        break;
                    }
                }
                // There should be at least one stable platform before this
                // unstable one.
                if (!hasStable) {
                    return false;
                }
            }

            // Update previousStairs.
            for (let i = 0; i < previousStairsLength - 1; ++i) {
                previousStairs[i] = previousStairs[i + 1];
            }
            previousStairs[previousStairsLength - 1] = next;
            return true;
        }

        return {
            get: function () {
                let next;
                do {
                    next = sprites.randomType();
                } while (!stairAcceptable(next))
                ++stairCount;
                return next;
            },

            clear: function () {
                stairCount = 0;
                while (previousStairs.length) {
                    previousStairs.pop();
                }
            },

            mightWantToSlowThingsDown: function () {
                return stairCount < startUpBonus * 2;
            }
        }
    })();

    stair.setLuckyMethod(function () {
        if (randomizer.mightWantToSlowThingsDown()) {
            return false;
        }
        return Math.random() < config.powerUpChance;
    });

    return {
        retrieve: function (altitude) {
            return platformPool.retrieve(randomizer.get(), altitude);
        },

        reset: function () {
            platformPool.disableAll();
            randomizer.clear();
        }
    };
});
