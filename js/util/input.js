define(function () {
    const keycodes = {
        left: {"KeyA": true, "ArrowLeft": true},
        right: {"KeyD": true, "ArrowRight": true},
        up: {"KeyW": true, "ArrowUp": true},
        down: {"KeyD": true, "ArrowDown": true},
    };
    const keys = {};
    const axis = {
        horizontal: 0, // 0: no input;  1: right;  -1: left.
        vertical: 0, // 0: no input;  1: down;  -1: up.
    };

    const keyEvents = (function () {
        function onKey(e, flag) {
            if (keycodes.left[e.code]) {
                axis.horizontal = flag ? -1 : 0;
            }
            if (keycodes.right[e.code]) {
                axis.horizontal = flag ? 1 : 0;
            }
            if (keycodes.up[e.code]) {
                axis.vertical = flag ? -1 : 0;
            }
            if (keycodes.down[e.code]) {
                axis.vertical = flag ? 1 : 0;
            }
            if (!e.repeat) {
                keys[e.code] = flag;
            }
        }

        return {
            down: function (e) {
                onKey(e, true);
            },
            up: function (e) {
                onKey(e, false);
            }
        };
    })();

    const touchEvents = (function () {
        // Radius of wheel, used to determine the level of input horizontal/vertical
        // axis (decimal between -1 and 1).
        const wheelRadius = Math.round(window.innerWidth * 0.2);

        // Set the position of wheel when touch starts.
        let wheel = null;

        function pointFromTouch(e) {
            const p = e.touches[0];
            return {x: p.clientX, y: p.clientY};
        }

        function deltaToAxis(delta) {
            let k = Math.abs(delta) / wheelRadius;
            if (k > 1) {
                k = 1;
            }
            return k * Math.sign(delta);
        }

        function clearAxis() {
            axis.horizontal = 0;
            axis.vertical = 0;
        }

        return {
            // Set the position of wheel when touch starts.
            start: function (e) {
                wheel = pointFromTouch(e);
                clearAxis();
            },
            // Clear the position of wheel when touch ends.
            end: function () {
                wheel = null;
                clearAxis();
            },
            // Calculate how the user is steering the wheel.
            move: function (e) {
                if (!wheel) {
                    console.error("ontouchmove called, but there isn't a wheel!");
                    return;
                }
                const touch = pointFromTouch(e);
                const delta = {
                    x: touch.x - wheel.x,
                    y: touch.y - wheel.y,
                };
                axis.horizontal = deltaToAxis(delta.x);
                axis.vertical = deltaToAxis(delta.y);
            },
        };
    })();

    document.addEventListener("keydown", keyEvents.down);
    document.addEventListener("keyup", keyEvents.up);
    document.addEventListener("touchstart", touchEvents.start);
    document.addEventListener("touchmove", touchEvents.move);
    document.addEventListener("touchend", touchEvents.end);

    return {
        // Check whether there has been a Space key pressed.
        onSpace: function () {
            return this.onKey("Space");
        },

        onKey: function (code) {
            if (keys[code]) {
                keys[code] = false;
                return true;
            }
            return false;
        },

        // Axis value between -1 and 1, a negative value indicates left input,
        // a positive value indicates right input, while a zero value indicates
        // no input at all.
        horizontalAxis: function () {
            return axis.horizontal;
        },

        // Axis value between -1 and 1, a negative value indicates up input,
        // a positive value indicates down input, while a zero value indicates
        // no input at all.
        verticalAxis: function () {
            return axis.vertical;
        }
    }
});
