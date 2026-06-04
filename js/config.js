const gameWidth = 640;
const gameHeight = 480;
const worldWidth = 1800;
const worldHeight = 480;

// The hallway band is sized to fill most of the 480px-tall canvas, so the
// game doesn't leave large dark dead-zones above/below that read like
// letterboxing. ~60px of sky on top, ~50px below the floor.
const hallwayTop = 60;
const hallwayBottom = 430;
const hallwayLeft = 0;
const hallwayRight = worldWidth;

function getGameConfig() {
  return {
    type: Phaser.AUTO,
    backgroundColor: "#050505",
    pixelArt: true,
    // No `parent` is set on purpose. With no parent, Phaser appends the
    // canvas straight to <body> and measures window.innerWidth/innerHeight
    // for FIT scaling. The window dimensions are always the true viewport —
    // unlike a parent element's measured height, which kept collapsing.
    // CENTER_BOTH then centers the resulting canvas.
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: gameWidth,
      height: gameHeight
    },
    physics: {
      default: "arcade",
      arcade: {
        debug: false
      }
    },
    // Two scenes registered: the title screen runs first (Phaser starts the
    // first scene in this array by default), then hands off to the main game
    // scene on the player's "press E to begin" via scene.start("GameScene").
    scene: [
      {
        key: "TitleScene",
        create: createTitleScene
      },
      {
        key: "GameScene",
        preload: preload,
        create: create,
        update: update
      }
    ]
  };
}
