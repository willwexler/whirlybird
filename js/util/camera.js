define(["util/config"], function (config) {
    let width, height;

    const focal = {x: 0, y: 0};
    const boxY = {high: 0, low: 0};

    function init() {
        width = config.width;
        height = config.height;
        boxY.high = Math.floor(height * 0.5);
        boxY.low = Math.floor(height * 0.92);
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

    init();
    config.registerResizeEvent(init);

    return {
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
