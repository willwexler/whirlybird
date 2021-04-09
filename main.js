require.config({
    baseUrl: "./js/"
});

require(["game"], function (Game) {
    new Game(document.getElementById("container"));
});
