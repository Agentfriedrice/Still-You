// ============================================================================
// interactables.js
// Memory objects in the hallway. Each one is the base rectangle (which doubles
// as the physics body and highlight target) plus a small composite "icon"
// drawn on top so the memory reads as a recognizable object rather than a
// colored square.
// ============================================================================

function createAllInteractables(scene, hallway) {
  interactables = scene.physics.add.staticGroup();
  totalInteractables = hallway.memories.length;

  for (const def of hallway.memories) {
    createInteractable(scene, def);
  }
}

function createInteractable(scene, def) {
  // Base rectangle. Acts as the physics body and the highlight target.
  const object = scene.add.rectangle(def.x, def.y, def.width, def.height, def.color);
  scene.physics.add.existing(object, true);
  object.dialogue = def;
  object.memoryId = def.id;
  interactables.add(object);
  currentHallwayObjects.push(object);

  // Icon composite (small extra shapes on top of the base rect).
  const iconParts = drawIcon(scene, def);
  for (const part of iconParts) {
    part.setDepth(2);
    currentHallwayObjects.push(part);
  }

  // "?" hint above the memory. Swapped to a dot once the player chooses.
  const hint = scene.add.text(def.x - 6, def.y - 46, "?", {
    fontFamily: "monospace",
    fontSize: "20px",
    color: "#ffffff"
  });
  hint.setDepth(3);
  object.hintText = hint;
  currentHallwayObjects.push(hint);

  // Soft floor glow under the memory. Brightens after a choice.
  const glow = scene.add.ellipse(def.x, def.y + 22, 70, 14, def.color, 0.18);
  glow.setDepth(-1);
  memoryGlows[def.id] = glow;
  currentHallwayObjects.push(glow);

  // If the player already chose for this memory (e.g., they walked back into
  // a hallway via Q on the doorway), reflect that visually.
  const prev = currentChoiceFor(def.id);
  if (prev) {
    markMemoryHandled(def.id, /*animate*/ false);
  }
}

// ---------------------------------------------------------------------------
// drawIcon — interprets def.icon and returns the small extra shapes that
// give the memory its silhouette. Centered on (def.x, def.y).
// ---------------------------------------------------------------------------
function drawIcon(scene, def) {
  const parts = [];
  const x = def.x;
  const y = def.y;

  switch (def.icon) {
    case "box": {
      // Tape stripe across the box.
      parts.push(scene.add.rectangle(x, y, def.width, 4, 0x4a3422));
      parts.push(scene.add.rectangle(x, y - def.height / 2 + 2, 6, 4, 0x2a1e10));
      break;
    }
    case "key": {
      // Round head with a hole + a shaft sticking right.
      parts.push(scene.add.circle(x - 4, y, 7, def.color));
      parts.push(scene.add.circle(x - 4, y, 3, 0x101010));
      parts.push(scene.add.rectangle(x + 6, y, 14, 4, def.color));
      parts.push(scene.add.rectangle(x + 11, y + 4, 4, 4, def.color));
      break;
    }
    case "paper": {
      // Thin text lines across a page.
      parts.push(scene.add.rectangle(x, y - 6, def.width - 8, 2, 0x303030));
      parts.push(scene.add.rectangle(x, y, def.width - 10, 2, 0x303030));
      parts.push(scene.add.rectangle(x - 2, y + 6, def.width - 14, 2, 0x303030));
      break;
    }
    case "plate": {
      // A plate (round inner ring) with a smaller "food" circle on top.
      parts.push(scene.add.circle(x, y, def.width / 2 - 2, 0x000000, 0.25));
      parts.push(scene.add.circle(x, y - 1, 5, 0xb8782a));
      break;
    }
    case "phone": {
      // Phone screen + small camera dot.
      parts.push(scene.add.rectangle(x, y, def.width - 8, def.height - 10, 0x202028));
      parts.push(scene.add.circle(x, y - def.height / 2 + 3, 1, 0xdddddd));
      parts.push(scene.add.rectangle(x, y + def.height / 2 - 3, 6, 1, 0xdddddd));
      break;
    }
    case "message": {
      // Speech bubble pointer.
      parts.push(scene.add.triangle(
        x - def.width / 2 + 4, y + def.height / 2,
        0, 0, 8, 0, 4, 8,
        def.color
      ));
      parts.push(scene.add.rectangle(x, y - 4, def.width - 10, 2, 0x202028));
      parts.push(scene.add.rectangle(x - 2, y + 2, def.width - 14, 2, 0x202028));
      break;
    }
    case "notebook": {
      // Spine + a couple of ring holes.
      parts.push(scene.add.rectangle(x - def.width / 2 + 3, y, 2, def.height - 4, 0x2a1e3a));
      parts.push(scene.add.circle(x - def.width / 2 + 3, y - 8, 1.5, 0xeeeeee));
      parts.push(scene.add.circle(x - def.width / 2 + 3, y, 1.5, 0xeeeeee));
      parts.push(scene.add.circle(x - def.width / 2 + 3, y + 8, 1.5, 0xeeeeee));
      break;
    }
    case "sticker": {
      // A star-ish dot in the middle.
      parts.push(scene.add.circle(x, y, def.width / 2 - 4, 0xffffff, 0.95));
      parts.push(scene.add.star(x, y, 5, 5, 2, 0xe48a3a));
      break;
    }
    case "cup": {
      // Cup rim line + a small handle.
      parts.push(scene.add.rectangle(x, y - def.height / 2 + 3, def.width - 4, 2, 0x4a2e18));
      parts.push(scene.add.rectangle(x + def.width / 2 + 1, y, 4, 10, def.color));
      break;
    }
    case "envelope": {
      // Closed-envelope flap: two thin diagonal bars meeting at the centre,
      // forming the classic "V". Replaces an oversized white triangle that
      // read like a funnel/ice-cream-cone against the red body.
      const ew = def.width;
      const eh = def.height;
      const eAngle = Math.atan2(eh, ew);
      const eBar = Math.sqrt(ew * ew + eh * eh) / 2;

      const flapL = scene.add.rectangle(x - ew / 4, y - eh / 4, eBar, 2.5, 0x2c0f0b);
      flapL.setRotation(eAngle);
      const flapR = scene.add.rectangle(x + ew / 4, y - eh / 4, eBar, 2.5, 0x2c0f0b);
      flapR.setRotation(-eAngle);

      // A thin seam down the lower half so the body still reads as paper.
      const seam = scene.add.rectangle(x, y + eh / 4, ew - 6, 1.5, 0x2c0f0b);

      parts.push(flapL, flapR, seam);
      break;
    }
    case "lanyard": {
      // Cord + a wider badge below.
      parts.push(scene.add.rectangle(x, y - def.height / 2 + 6, 4, 14, 0x2e3a4a));
      parts.push(scene.add.rectangle(x, y + 6, def.width + 4, 14, 0xeeeeee));
      parts.push(scene.add.rectangle(x, y + 6, def.width - 6, 2, 0x222222));
      break;
    }
    case "folder": {
      // Folder tab at top.
      parts.push(scene.add.rectangle(x - def.width / 2 + 6, y - def.height / 2 - 2, 14, 4, def.color));
      parts.push(scene.add.rectangle(x, y, def.width - 10, 2, 0x6a4a18));
      parts.push(scene.add.rectangle(x, y + 6, def.width - 14, 2, 0x6a4a18));
      break;
    }
    case "photo": {
      // Inner photo frame line, plus a couple of "head" dots.
      parts.push(scene.add.rectangle(x, y, def.width - 6, def.height - 6, 0x1a2a30));
      parts.push(scene.add.circle(x - 6, y, 3, 0xddddd0));
      parts.push(scene.add.circle(x, y, 3, 0xddddd0));
      parts.push(scene.add.circle(x + 6, y, 3, 0xddddd0));
      break;
    }
    case "week": {
      // 7 small squares for the days.
      const dayW = (def.width - 6) / 7;
      for (let i = 0; i < 7; i++) {
        parts.push(scene.add.rectangle(
          x - def.width / 2 + 4 + i * dayW + dayW / 2,
          y,
          dayW - 1,
          def.height - 6,
          0x303030
        ));
      }
      break;
    }
    case "stack": {
      // Stack of pages, slightly offset.
      parts.push(scene.add.rectangle(x - 2, y + 4, def.width - 6, def.height - 10, 0xc8b890));
      parts.push(scene.add.rectangle(x + 2, y, def.width - 10, def.height - 16, 0xb8a880));
      parts.push(scene.add.rectangle(x, y - 4, def.width - 14, 2, 0x6a5230));
      break;
    }
    case "cap": {
      // Mortarboard top + tassel.
      parts.push(scene.add.rectangle(x, y - def.height / 2 + 4, def.width + 6, 4, 0x202020));
      parts.push(scene.add.rectangle(x + def.width / 2 - 2, y - def.height / 2 + 4, 2, 12, 0xd4a542));
      parts.push(scene.add.circle(x + def.width / 2 - 1, y - def.height / 2 + 16, 2, 0xd4a542));
      break;
    }
    case "door": {
      // An open doorway (rectangle inside rectangle, plus a tiny knob).
      parts.push(scene.add.rectangle(x, y, def.width - 8, def.height - 6, 0x1a1a1a));
      parts.push(scene.add.circle(x + def.width / 2 - 8, y + 2, 1.5, 0xddddc0));
      break;
    }
    default:
      // Fall back: no extra icon shapes; the base rect speaks for itself.
      break;
  }

  return parts;
}

// ---------------------------------------------------------------------------
// Per-frame: figure out which memory the player is closest to. Stroke that
// one white as a "you can press E here" cue.
// ---------------------------------------------------------------------------
function updateCurrentInteractable() {
  currentObject = null;
  if (!interactables) return;

  interactables.children.iterate((object) => {
    const distance = Phaser.Math.Distance.Between(
      player.x, player.y,
      object.x, object.y
    );

    if (distance < 55) {
      currentObject = object;
      object.setStrokeStyle(2, 0xffffff);
    } else {
      object.setStrokeStyle(0);
    }
  });
}

// ---------------------------------------------------------------------------
// "You have been here" feedback: brighten the glow, swap "?" to "·".
// `animate` is false when we're rebuilding a hallway from existing state
// (no tween, just final values).
// ---------------------------------------------------------------------------
function markMemoryHandled(memoryId, animate = true) {
  const glow = memoryGlows[memoryId];
  if (glow) {
    if (animate) {
      glow.setFillStyle(glow.fillColor, 0.55);
      glow.setScale(1.15, 1.15);
    } else {
      glow.setFillStyle(glow.fillColor, 0.55);
      glow.setScale(1.15, 1.15);
    }
  }

  if (interactables) {
    interactables.children.iterate((obj) => {
      if (obj.memoryId === memoryId && obj.hintText) {
        obj.hintText.setText("·");
        obj.hintText.setColor("#888888");
      }
    });
  }
}

// ---------------------------------------------------------------------------
// Helpers that read into playerChoices by current hallway.
// ---------------------------------------------------------------------------
function currentChoiceFor(memoryId) {
  const hw = hallwayDefinitions[currentHallwayIndex];
  if (!hw) return null;
  const bucket = playerChoices[hw.id];
  return bucket ? bucket[memoryId] : null;
}

function allMemoriesHandled() {
  const hw = hallwayDefinitions[currentHallwayIndex];
  if (!hw) return false;
  const bucket = playerChoices[hw.id] || {};
  return Object.keys(bucket).length >= totalInteractables;
}
