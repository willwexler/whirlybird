define(function () {
    const settings = {
        // Browser framerate is unpredictable. All physics variables are based
        // on a machine of 60 FPS.
        fps: 60,
        // If set to true, scripts will account for missing or extra frames
        // based on the default FPS. This being said, the speed of the game will
        // be time-based, not frame-based.
        enableFramerateCalibration: true,
        // Static exported values.
        static: {
            // How many frame does a power up last.
            powerUpDuration: 99,
            // The chance of the powerUp props appear on the platform.
            powerUpChance: 0.15,
            // Duration frames of one PowerUp joggle animation.
            powerUpJoggleDuration: 12,
            // Duration frames of one slime joggle animation.
            slimeJoggleDuration: 12,
            // How many frames should camera shake when android is hurt.
            cameraShakeDuration: 22,
        },
        // Resizable exported values.
        resizable: {
            // The preferred size of the canvas.
            width: 600,
            height: 1160,

            // Physics variables involving the android.
            gravity: 0.52,
            moveVelocity: 10,
            jumpVelocity: -22,
            bounceVelocity: -39,
            powerUpVelocity: -39,
            maxFallingVelocity: 14,

            // Horizontal padding to the canvas of the spawned platforms.
            platformPadding: 15,
            // Vertical gap between every two platforms.
            platformGap: 110,
            // Some platforms are constantly moving. This value specifies the speed
            // of them.
            platformMoveSpeed: 1.5,
            // Range of PowerUp prop's vertical joggle.
            powerUpJoggleDistance: 4,
            // Range of slime's joggle.
            slimeJoggleDistance: 5,
            // Falling logic will be triggered if the android's position is
            // fallingThreshold lower than every platform.
            fallingThreshold: 100,
            // How much should camera shake when android is hurt.
            cameraShakeDeltaX: 2,
            cameraShakeDeltaY: 4,
        },
        // Those fields in resizable should always be a integer.
        int: ["width", "height", "platformPadding", "platformGap", "fallingThreshold"],
        // Aspect ratio for mobiles varies. These are minimum and maximum values
        // for the sake of playability.
        minAspectRatio: 1040 / 600,
        maxAspectRatio: 1160 / 600,
        // Ratio as to the default values.
        ratio: 1,
        // Arrays of functions to call when there's been a resize event.
        resizer: [],
    };

    const checkMobile = function () {
        // noinspection JSUnresolvedVariable
        return (function (a) {
            // noinspection RegExpRedundantEscape,RegExpSingleCharAlternation
            return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) ||
                /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4)));
        })(navigator.userAgent || navigator.vendor || window.opera);
    };

    const fps = {
        second: 1000,
        update: {
            interval: 200, // fps update interval
            last: 0,       // last fps update
            count: 0,      // frames since last fps update
            then: 0,       // last frame
        },
        throttle: {
            then: 0,
            fps: 0,
            animId: 0,
            callback: _ => _,
        },
    };

    const exports = {
        COLLIDE_TYPE_FALL: -2,
        COLLIDE_TYPE_HURT: -1,
        COLLIDE_TYPE_NONE: 0,
        COLLIDE_TYPE_JUMP: 1,
        COLLIDE_TYPE_BOUNCE: 2,
        COLLIDE_TYPE_POWER: 3,

        fps: 0,
        ...settings.static,
        ...settings.resizable,
    };

    exports.fontSize = px => Math.ceil(px * settings.ratio);
    exports.relativePixel = px => px * settings.ratio;

    // Convert between android's altitude and score.
    exports.altitudeToScore = altitude => altitude / settings.ratio;
    exports.scoreToAltitude = score => score * settings.ratio;

    // Throttle rAF to a specific framerate.
    exports.throttleFPS = function (callback, throttle) {
        fps.throttle.callback = callback;
        fps.throttle.fps = throttle;

        function loop(now) {
            fps.throttle.animId = requestAnimationFrame(loop);

            if (!fps.throttle.fps) {
                fps.throttle.callback(now);
                return;
            }

            if (!fps.throttle.then) {
                fps.throttle.then = now;
                fps.throttle.callback(now);
                return;
            }

            const interval = fps.second / fps.throttle.fps;
            const elapsed = now - fps.throttle.then;
            if (elapsed > interval) {
                fps.throttle.then = now - elapsed % interval;
                fps.throttle.callback(now);
            }
        }

        fps.throttle.animId = requestAnimationFrame(loop);
        return {stop: () => cancelAnimationFrame(fps.throttle.animId)};
    };

    // Return elapsed frames since last call.
    exports.elapsedFrames = function (now) {
        if (!fps.update.then) {
            // function's first call, setup initial values.
            fps.update.then = now;
            fps.update.last = now;
            fps.update.count = 0;
            return 1;
        }

        let timeElapsed = now - fps.update.last;
        ++fps.update.count;
        if (timeElapsed >= fps.update.interval) {
            exports.fps = Math.round(fps.second / (timeElapsed / fps.update.count));
            fps.update.last = now;
            fps.update.count = 0;
        }

        timeElapsed = now - fps.update.then;
        fps.update.then = now;
        return settings.enableFramerateCalibration ?
            timeElapsed * settings.fps / fps.second : 1;
    };

    exports.hasEnabledFramerateCalibration = function () {
        return settings.enableFramerateCalibration;
    }

    exports.toggleFramerateCalibration = function () {
        if (!settings.enableFramerateCalibration) {
            fps.update.then = 0;
        }
        return settings.enableFramerateCalibration =
            !settings.enableFramerateCalibration;
    };

    exports.registerResizeEvent = function (fn) {
        if (typeof fn === "function") {
            settings.resizer.push(fn);
        } else {
            console.error("fn is not a function", fn);
        }
    };

    // Recalculate physics variables when resize.
    window.addEventListener("resize", (function () {
        settings.updateRatio = function (ratio) {
            // Update all resizable values based on ratio.
            this.ratio = ratio;
            for (const [key, value] of Object.entries(this.resizable)) {
                exports[key] = value * ratio;
            }
            for (const key of this.int) {
                exports[key] = Math.round(exports[key]);
            }
        };

        function measure4Mobile() {
            let aspectRatio = window.innerHeight / window.innerWidth;
            if (aspectRatio < settings.minAspectRatio) {
                aspectRatio = settings.minAspectRatio;
            } else if (aspectRatio > settings.maxAspectRatio) {
                aspectRatio = settings.maxAspectRatio;
            }
            const referringWidth = settings.resizable.width;
            const referringHeight = referringWidth * aspectRatio;

            settings.updateRatio(window.innerHeight / referringHeight);

            // For mobile users, canvas should fit to the whole screen.
            if (window.innerWidth < window.innerHeight) {
                // Only expand the width when in portrait mode.
                exports.width = window.innerWidth;
                exports.wholeScreen = true;
            }
            exports.height = window.innerHeight;
            exports.moveVelocity = settings.resizable.moveVelocity *
                (exports.width / referringWidth);
        }

        function measure4Desktop() {
            const padding = window.innerHeight < 1100 ? 10 : 54;
            const ratioVertical = (window.innerHeight - padding) / settings.resizable.height;
            const ratioHorizontal = window.innerWidth / settings.resizable.width;

            settings.updateRatio(Math.min(ratioVertical, ratioHorizontal));
        }

        function resize() {
            exports.wholeScreen = false;

            if (checkMobile()) {
                measure4Mobile();
            } else {
                measure4Desktop();
            }

            // Notify relevant parties.
            for (const fn of settings.resizer) {
                fn();
            }

            console.log(`Window: (${window.innerWidth}, ${window.innerHeight}), ` +
                `Canvas: (${exports.width}, ${exports.height}), ` +
                `Ratio: ${settings.ratio.toFixed(4)}`);
        }

        resize();
        return resize;
    })());

    return exports;
});
