define(function () {
    const staticSettings = {
        // The preferred size of the canvas.
        defaultWidth: 600,
        defaultHeight: 1140,

        // How many frame does a power up last.
        powerUpDuration: 100,
        // The chance of the powerUp prop appearing on the platform.
        powerUpChance: 0.15,
    };

    const settings = {
        width: staticSettings.defaultWidth,
        height: staticSettings.defaultHeight,

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
    };

    const ratio = (function () {
        // if (window.innerHeight > 1100) {
        //     return 1;
        // }
        let ratio = 1;
        let padding = 37 * 2;
        if (window.innerHeight < 1100) {
            padding = 5 * 2;
        }
        ratio = (window.innerHeight - padding) / staticSettings.defaultHeight;
        Object.keys(settings).forEach(key => {
            settings[key] *= ratio;
        });
        settings.width = Math.round(settings.width);
        settings.height = Math.round(settings.height);
        settings.platformPadding = Math.round(settings.platformPadding);
        settings.platformGap = Math.round(settings.platformGap);
        settings.fallingThreshold = Math.round(settings.fallingThreshold);
        return ratio;
    })();

    console.log(`window.innerHeight=${window.innerHeight}`);

    return {
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
            return Math.round(px * ratio);
        }
    };
});
