# Whirlybird

A recreation of Google's *Whirlybird* game.

Click on the button or press Space to start the game. Use left or right arrow keys (or A/D keys) to move horizontally.
Jump on the platforms, avoid the traps and see how much higher you can get.

**[PLAY ONLINE](http://121.4.186.151/whirlybird/).**

## Change Log

1. Pack all sprites into a single sprite sheet.
2. Add an `ObjectPooler` to maintain all sorts of platforms, saving platforms from being destroyed and instantiated over
   and over.
3. Improve support for various resolutions. Adjust dynamically on window resize event.
4. Add mobile support (touch control).
5. Advanced collision check. Check movement intersection instead of actual collision. With this improved algorithm, the
   game even supports machines with 10 FPS now, as long as you don't feel dizzy and throw up.

## Debug Notes

### Framerate Calibration

Enabled by default. Click FPS text 6 times in a row to toggle this feature. When disabled, the game will be frame-based,
allowing you to play on a low FPS machine in slow motion.
