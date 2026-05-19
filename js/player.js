// ============================================================================
// player.js
// Player creation, input, movement. The "sprite" is a small stack of
// rectangles drawn over an invisible physics body. Movement is suppressed
// while dialogue, the doorway overlay, or a hallway transition is active.
// ============================================================================

function createPlayer(scene) {
  // Soft footprint glow under the player. Drawn first so it sits beneath.
  const glow = scene.add.ellipse(100, 335, 56, 14, 0xffffff, 0.16);
  glow.setDepth(0);

  // Invisible physics body. The body is what actually moves and collides;
  // the parts below are purely cosmetic and tracked in updatePlayerVisuals.
  player = scene.physics.add.sprite(200, 300, null);
  player.setDisplaySize(20, 28);
  player.body.setSize(20, 28);
  player.setCollideWorldBounds(true);
  player.visible = false;

  // Composite pixel-ish body: head, hair, torso, two legs.
  const hair  = scene.add.rectangle(player.x, player.y - 24, 14, 4, 0x2a1a10);
  const head  = scene.add.rectangle(player.x, player.y - 18, 14, 12, 0xf2d2bd);
  const eye_l = scene.add.rectangle(player.x - 3, player.y - 18, 2, 2, 0x1a1a1a);
  const eye_r = scene.add.rectangle(player.x + 3, player.y - 18, 2, 2, 0x1a1a1a);
  const torso = scene.add.rectangle(player.x, player.y - 6, 16, 14, 0x6e7e90);
  const collar= scene.add.rectangle(player.x, player.y - 12, 14, 2, 0x445566);
  const leg_l = scene.add.rectangle(player.x - 4, player.y + 6, 6, 10, 0x2a3848);
  const leg_r = scene.add.rectangle(player.x + 4, player.y + 6, 6, 10, 0x2a3848);

  // Stack them at the right depth so the head sits over the body.
  for (const part of [glow, leg_l, leg_r, torso, collar, head, hair, eye_l, eye_r]) {
    part.setDepth(part === glow ? 0 : 5);
  }

  player.visuals = {
    glow, hair, head, eye_l, eye_r, torso, collar, leg_l, leg_r
  };
  player.walkPhase = 0;
}

function createControls(scene) {
  keys = scene.input.keyboard.addKeys({
    up:    Phaser.Input.Keyboard.KeyCodes.W,
    left:  Phaser.Input.Keyboard.KeyCodes.A,
    down:  Phaser.Input.Keyboard.KeyCodes.S,
    right: Phaser.Input.Keyboard.KeyCodes.D
  });
  interactKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  dismissKey  = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
}

function updatePlayerMovement() {
  const speed = 140;
  player.setVelocity(0);

  const blocked =
    isDialogueOpen || doorwayActive || isTransitioning || sitState === "sitting";
  if (!blocked) {
    if (keys.left.isDown) {
      player.setVelocityX(-speed);
    } else if (keys.right.isDown) {
      player.setVelocityX(speed);
    }

    if (keys.up.isDown) {
      player.setVelocityY(-speed);
    } else if (keys.down.isDown) {
      player.setVelocityY(speed);
    }
  }

  player.x = Phaser.Math.Clamp(player.x, hallwayLeft + 20, hallwayRight - 20);
  player.y = Phaser.Math.Clamp(player.y, hallwayTop + 35, hallwayBottom - 35);

  // Walk phase advances only when the player is actually moving.
  if (Math.abs(player.body.velocity.x) > 1 || Math.abs(player.body.velocity.y) > 1) {
    player.walkPhase += 0.18;
  }
}

function updatePlayerVisuals() {
  const v = player.visuals;
  const x = player.x;
  const y = player.y;

  v.glow.x  = x;       v.glow.y  = y + 18;
  v.hair.x  = x;       v.hair.y  = y - 24;
  v.head.x  = x;       v.head.y  = y - 18;
  v.eye_l.x = x - 3;   v.eye_l.y = y - 18;
  v.eye_r.x = x + 3;   v.eye_r.y = y - 18;
  v.torso.x = x;       v.torso.y = y - 6;
  v.collar.x= x;       v.collar.y= y - 12;

  // Tiny walk bob: legs swap slightly while moving.
  const bob = Math.sin(player.walkPhase) * 1.5;
  v.leg_l.x = x - 4;   v.leg_l.y = y + 6 + bob;
  v.leg_r.x = x + 4;   v.leg_r.y = y + 6 - bob;

  // Graduation cap: while "worn" it rides on the player's head.
  if (playerCap && capState === "worn") {
    playerCap.x = x;
    playerCap.y = y - 29;
  }
}

// ============================================================================
// Graduation cap (Year 4 "cap" memory).
//   keep    -> worn, stays on for the rest of the hallway
//   pass_on -> worn, stays on for the rest of the hallway (same as keep;
//              only the recorded choice differs, for the ending)
//   leave   -> thrown into the air, lands on the floor, stays there
// ============================================================================

function createCap(scene) {
  // A small mortarboard, built centred on (0,0) inside a container so the
  // whole hat can be moved/tweened/rotated as one object.
  const skullcap   = scene.add.rectangle(0, 3, 13, 6, 0x2c2c2c);
  const board      = scene.add.rectangle(0, 0, 22, 3, 0x1c1c1c);
  const button     = scene.add.rectangle(0, -3, 3, 3, 0x444444);
  const tasselCord = scene.add.rectangle(9, 4, 1.5, 9, 0xd4a542);
  const tasselEnd  = scene.add.circle(9, 9, 2, 0xd4a542);

  const cap = scene.add.container(player.x, player.y - 29, [
    skullcap, board, button, tasselCord, tasselEnd
  ]);
  cap.setDepth(6); // above the player's body parts (depth 5)
  return cap;
}

function handleCapChoice(scene, choiceId) {
  if (!scene) scene = gameScene;
  if (!playerCap) {
    playerCap = createCap(scene);
  }

  // The player may revisit the cap and change their mind — cancel any
  // in-flight throw tween and reset the hat before re-deciding.
  scene.tweens.killTweensOf(playerCap);
  playerCap.setRotation(0);

  if (choiceId === "leave") {
    // Throw it in the air — it arcs up and lands on the floor, and stays.
    capState = "thrown";
    throwCap(scene);
  } else {
    // "keep" (wear it proudly) and "pass_on" (save it for someone after
    // you) both keep the cap on the player's head for the rest of the
    // hallway. Only the recorded choice differs, for the ending.
    capState = "worn";
    playerCap.setDepth(6);
  }
}

function throwCap(scene) {
  // Detach from the player at head height, arc up, then fall to the floor.
  const startX = player.x;
  const startY = player.y - 29;
  playerCap.setPosition(startX, startY);
  playerCap.setDepth(4); // the player walks in front of it once it's down

  const landX = startX + Phaser.Math.Between(45, 85);
  const landY = hallwayBottom - 14;

  // Horizontal drift across the whole flight.
  scene.tweens.add({
    targets: playerCap,
    x: landX,
    duration: 1300,
    ease: "Linear"
  });
  // A lazy spin, settling at a slight tilt on the ground.
  scene.tweens.add({
    targets: playerCap,
    rotation: Math.PI * 2 + 0.2,
    duration: 1300,
    ease: "Linear"
  });
  // Up first...
  scene.tweens.add({
    targets: playerCap,
    y: startY - 95,
    duration: 470,
    ease: "Quad.easeOut",
    onComplete: () => {
      // ...then down to the floor with a small bounce.
      scene.tweens.add({
        targets: playerCap,
        y: landY,
        duration: 830,
        ease: "Bounce.easeOut"
      });
    }
  });

  // After resting on the floor a few seconds, the cap quietly returns to
  // the player's head.
  scene.time.delayedCall(3600, returnCap);
}

function returnCap() {
  // Only acts if the cap is still in the "thrown" state — if the player
  // revisited the cap and re-chose, capState will have changed and this
  // is a no-op.
  if (capState !== "thrown" || !playerCap || !gameScene) return;

  gameScene.tweens.add({
    targets: playerCap,
    alpha: 0,
    duration: 300,
    ease: "Quad.easeIn",
    onComplete: () => {
      capState = "worn";
      playerCap.setRotation(0);
      playerCap.setDepth(6);
      // Snap to the head before fading back in, wherever the player is now.
      playerCap.x = player.x;
      playerCap.y = player.y - 29;
      gameScene.tweens.add({
        targets: playerCap,
        alpha: 1,
        duration: 300,
        ease: "Quad.easeOut"
      });
    }
  });
}
