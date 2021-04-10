define(function () {
    const staticSettings = {
        // How many frame does a power up last.
        powerUpDuration: 100,
        // The chance of the powerUp prop appearing on the platform.
        powerUpChance: 0.15,
    };

    const settings = {
        // The preferred size of the canvas.
        width: 600,
        height: 1140,

        // Physics variables involving the android.
        gravity: 0.5,
        moveVelocity: 9,
        jumpVelocity: -22,
        bounceVelocity: -40,
        powerUpVelocity: -40,
        // If the falling velocity becomes larger than the platform's height, the
        // android will fall through the platform, failing to step on it.
        maxFallingVelocity: 14,

        // Horizontal padding to the canvas of the spawned platforms.
        platformPadding: 15,
        // Vertical gap between every two platforms.
        platformGap: 110,
        // Some platforms are constantly moving. This value specifies the speed of them.
        platformMoveSpeed: 1.5,
        // Falling logic will be triggered if the android's position is fallingThreshold
        // lower than every platform.
        fallingThreshold: 100,

        // Those fields should always be a integer.
        _ints: ["width", "height", "platformPadding", "platformGap", "fallingThreshold"]
    };

    const resizer = [];
    let ratio = 1;

    const exports = {
        COLLIDE_TYPE_FALL: -2,
        COLLIDE_TYPE_HURT: -1,
        COLLIDE_TYPE_NONE: 0,
        COLLIDE_TYPE_JUMP: 1,
        COLLIDE_TYPE_BOUNCE: 2,
        COLLIDE_TYPE_POWER: 3,

        ...staticSettings,
        ...settings,

        fontSize: function (px) {
            return Math.ceil(px * ratio);
        },
        relativePixel: function (px) {
            return px * ratio;
        },
        registerResizeEvent: function (fn) {
            if (typeof fn === "function") {
                resizer.push(fn);
            } else {
                console.error("fn is not a function", fn);
            }
        },
        updateOnResize,
    };

    function updateOnResize() {
        console.log(`window.innerHeight=${window.innerHeight}`);
        // if (window.innerHeight > 1100) {
        //     return 1;
        // }
        const padding = window.innerHeight < 1100 ? 10 : 74;
        ratio = (window.innerHeight - padding) / settings.height;

        for (const [key, value] of Object.entries(settings)) {
            exports[key] = value * ratio;
        }
        for (const key of settings._ints) {
            exports[key] = Math.round(exports[key]);
        }

        for (const fn of resizer) {
            fn();
        }
    }

    updateOnResize();

    return exports;
});
