game = new Phaser.Game(getGameConfig());

// Belt-and-suspenders: once the page has fully loaded, ask Phaser to
// re-measure the window and re-fit/re-center the canvas. This covers the
// case where Phaser's first measurement happened before layout fully
// settled.
window.addEventListener("load", () => {
  if (game && game.scale) {
    game.scale.refresh();
  }
});

const fullscreenButton = document.getElementById("fullscreen-button");

fullscreenButton.addEventListener("click", () => {
  const page = document.documentElement;

  if (page.requestFullscreen) {
    page.requestFullscreen();
  }
});

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    fullscreenButton.style.display = "none";
  } else {
    fullscreenButton.style.display = "block";
  }
});
