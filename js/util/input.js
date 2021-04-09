define(function () {
    const keycodes = {
        space: {"32": true},             // Space
        left: {"65": true, "37": true},  // A, ←
        right: {"68": true, "39": true}, // D, →
        up: {"87": true, "38": true},    // W, ↑
        down: {"83": true, "40": true},  // D, ↓
        cheats: {"90": true},            // Z
    }
    const keys = {
        space: false,
        left: false,
        right: false,
        up: false,
        down: false,
        cheats: false,
    }

    function onKeyDown(e) {
        onKey(e, true);
    }

    function onKeyUp(e) {
        onKey(e, false);
    }

    function onKey(e, flag) {
        if (keycodes.space[e.keyCode] && !e.repeat) {
            keys.space = flag;
        }
        if (keycodes.cheats[e.keyCode] && !e.repeat) {
            keys.cheats = flag;
        }
        if (keycodes.left[e.keyCode]) {
            keys.left = flag;
        }
        if (keycodes.right[e.keyCode]) {
            keys.right = flag;
        }
        if (keycodes.up[e.keyCode]) {
            keys.up = flag;
        }
        if (keycodes.down[e.keyCode]) {
            keys.down = flag;
        }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    return {
        onSpace: function () {
            if (keys.space) {
                keys.space = false;
                return true;
            }
            return keys.space;
        },
        onCheat: function () {
            return false;
            if (keys.cheats) {
                keys.cheats = false;
                return true;
            }
            return keys.cheats;
        },
        horizontalAxis: function () {
            if (keys.left) {
                return -1;
            } else if (keys.right) {
                return 1;
            }
            return 0;
        },
        verticalAxis: function () {
            if (keys.up) {
                return 1;
            } else if (keys.down) {
                return -1;
            }
            return 0;
        }
    }
});
