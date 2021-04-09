define(function () {
    return {
        COLLIDE_TYPE_FALL: -2,
        COLLIDE_TYPE_HURT: -1,
        COLLIDE_TYPE_NONE: 0,
        COLLIDE_TYPE_JUMP: 1,
        COLLIDE_TYPE_BOUNCE: 2,
        COLLIDE_TYPE_POWER: 3,

        // The preferred size of the canvas.
        defaultWidth: 600,
        defaultHeight: 1140,

        // Physics variables involving the android.
        gravity: 0.5,
        moveVelocity: 9,
        jumpVelocity: -22,
        bounceVelocity: -40,
        powerUpVelocity: -40,
        powerUpDuration: 100,
        // If the falling velocity becomes larger than the platform's height, the
        // android will fall through the platform, failing to step on it.
        maxFallingVelocity: 14,

        // The chance of the powerUp prop appearing on the platform.
        powerUpChance: 0.15,

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
});
