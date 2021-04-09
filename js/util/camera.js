define(["util/constants"], function (constants) {
    const padding = 5;

    let width = constants.defaultWidth;
    let height = constants.defaultHeight;
    let ratio = 1;

    const focal = {
        x: width / 2,
        y: height / 2,
    };
    const boxY = {
        high: Math.floor(height * 0.5),
        low: Math.floor(height * 0.92)
    };

    // Update camera size based on the window size.
    function resize() {
        if (window.innerHeight < 1100) {
            console.warn("Recommend window.innerHeight to be at least 1100.",
                `window.innerHeight = ${window.innerHeight}`);
        } else {
            console.log(`window.innerHeight = ${window.innerHeight}`);
        }
        height = Math.min(constants.defaultHeight, window.innerHeight - 2 * padding);

        boxY.high = Math.floor(height * 0.5);
        boxY.low = Math.floor(height * 0.92);

        // adjustForSmallWindows();
    }

    // Adjust constants to fit in a smaller window. This is only a temporary
    // workaround. It's not a fix.
    // This function only runs once. You'll have to refresh the page if you were
    // to resize the window.
    function adjustForSmallWindows() {
        if (this.windowDebug) {
            return;
        }
        this.windowDebug = true;
        if (height >= 1100) {
            return;
        }
        ratio = height / constants.defaultHeight;
        width = Math.round(constants.defaultWidth * ratio);
        constants.gravity *= ratio;
        constants.moveVelocity *= ratio;
        constants.jumpVelocity *= ratio;
        constants.bounceVelocity *= ratio;
        constants.powerUpVelocity *= ratio;
        constants.maxFallingVelocity *= ratio;
        constants.platformPadding = Math.round(constants.platformPadding * ratio);
        constants.platformGap = Math.round(constants.platformGap * ratio);
        constants.platformMoveSpeed *= ratio;
        constants.fallingThreshold = Math.round(constants.fallingThreshold * ratio);
    }

    // Try to follow a target. If it goes outside of a box range, move the
    // camera so we don't lose it.
    // In this game, x position of the focal point does not really matter.
    // The camera does not move horizontally.
    function lookAt(point) {
        const relative = relativePosition(point);
        if (relative.y < boxY.high) {
            // Move the camera up.
            const delta = boxY.high - relative.y;
            focal.y -= delta;
        } else if (relative.y > boxY.low) {
            // Move the camera down.
            const delta = relative.y - boxY.low;
            focal.y += delta;
        }
    }

    // Relative position inside the camera.
    function relativePosition(point) {
        return {
            x: point.x - focal.x + width / 2,
            y: point.y - focal.y + height / 2,
        };
    }

    resize();

    return {
        onResize: resize,

        // width/height might change dynamically if user tries to resize the
        // window.
        getWidth: function () {
            return width;
        },
        getHeight: function () {
            return height;
        },
        getRatio: function () {
            return ratio;
        },

        // The point parameters in follow(), focus(), and moveTo() are all
        // absolute positions.
        follow: function (point) {
            lookAt(point);
            return relativePosition(point);
        },
        focus: function (point) {
            return relativePosition(point);
        },
        moveTo: function (point) {
            focal.x = point.x;
            focal.y = point.y;
            return relativePosition(point);
        },

        canFitIn: function (relativePos) {
            return relativePos.x >= 0 && relativePos.x < width &&
                relativePos.y >= 0 && relativePos.y < height;
        },
    }
});
