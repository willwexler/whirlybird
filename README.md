# Whirlybird

A recreation of Google's *Whirlybird* game. Recommended `window.innerHeight` to be at least `1100px`.

**[PLAY ONLINE](http://121.4.186.151/whirlybird/).**

This game can be much more difficult to play on a smaller window. You won't be able to jump multiple times on the same
platform. Plus, you won't be able to see what's coming and react in time.

However, if you do intend to try it out on a smaller window. There are two options at hand:

1. Do nothing and enjoy the increased difficulty that comes along with it.
2. Uncomment the code `adjustForSmallWindows();` of the file `js/util/camera.js:30`. As the commenting section of this
   function suggests, this is merely a temporary workaround, you'll have to refresh the page everytime resizing the
   window. This version is playable at [this link](http://121.4.186.151/whirlybird-test/).

## TODO

- ~~Pack all sprites into a single sprite sheet.~~
- ~~Add an `ObjectPooler` to maintain all sorts of platforms, saving platforms from being destroyed and instantiated
  over and over.~~
- Improve support for various resolutions.
