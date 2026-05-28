// ============================================================================
// hallways.js
// All four years live here as data: their palette, their memories, the
// reflection lines that the doorway shows at the end of the year, and the
// transition line that leads into the next hallway.
//
// Adding a new memory is a one-place edit. Reordering the array changes the
// order the player sees the years in.
// ============================================================================

const hallwayDefinitions = [
  // ==========================================================================
  // YEAR 1 — Arrival.  Cool, dim blue.  What you brought with you.
  // ==========================================================================
  {
    id: "year1",
    year: 1,
    label: "Year 1  —  Arrival",
    palette: {
      sky:         0x070a14,
      floor:       0x0d111c,
      floorAccent: 0x1a2438,
      stroke:      0x1a2848,
      door:        0x0a1224,
      doorStroke:  0x1a3258,
      particle:    0x6a88c0,
      ambient:     0x4a6088,
      labelColor:  "#6e88c2"
    },
    // Year 1 outfit — cool blue/gray outfit the player arrives in.
    outfit: {
      torso:  0x6e7e90,
      collar: 0x445566,
      legs:   0x2a3848
    },
    memories: [
      {
        id: "packed_box", x: 350, y: 315, width: 30, height: 26, color: 0xa67c52, icon: "box",
        initial: "You found a box you packed yourself.\nThe handwriting on the label is neater than yours now.\nYou were trying so hard to be ready.",
        prompt:  "What do you do with what's inside?",
        choices: [
          { id: "keep",    label: "Keep what's still useful", response: "You take what helps.\nThe rest can go." },
          { id: "leave",   label: "Leave it sealed",          response: "Some things are easier when they stay packed.\nThat is a kind of carefulness, too." },
          { id: "pass_on", label: "Pass it forward",          response: "Someone else will need a head start.\nYou know what they don't yet know." }
        ]
      },
      {
        id: "dorm_key", x: 670, y: 315, width: 26, height: 26, color: 0xc8c8c8, icon: "key",
        initial: "A small metal key.\nIt opens a door that no longer exists.\nYou kept it anyway.",
        prompt:  "What does it mean to you now?",
        choices: [
          { id: "keep",    label: "Keep it on your ring",            response: "Some keys are reminders, not instructions.\nIt fits where it always fit." },
          { id: "leave",   label: "Bury it in a drawer",             response: "Out of sight does not mean forgotten.\nIt still belongs to you." },
          { id: "pass_on", label: "Give it to someone arriving",     response: "They will not understand at first.\nEventually, they will." }
        ]
      },
      {
        id: "syllabus", x: 990, y: 315, width: 28, height: 32, color: 0xe8e6d4, icon: "paper",
        initial: "A syllabus you printed and never opened.\nSo much was waiting for you in those pages.",
        prompt:  "What do you do with it?",
        choices: [
          { id: "keep",    label: "Read it now",        response: "You skim it like a letter from a stranger.\nThe stranger was kind." },
          { id: "leave",   label: "Recycle it",         response: "Why did I even print it?\nWhat was I thinking then?" },
          { id: "pass_on", label: "Tape it to a wall",  response: "Proof that you started." }
        ]
      },
      {
        id: "lonely_meal", x: 1310, y: 315, width: 28, height: 28, color: 0xd9a64a, icon: "plate",
        initial: "A photo of food eaten alone.\nYou used to dread this.\nYou learned to enjoy your own company.",
        prompt:  "How do you remember it?",
        choices: [
          { id: "keep",    label: "Treasure it",            response: "A quiet beginning of self trust!" },
          { id: "leave",   label: "Delete it",              response: "Some firsts do not need keeping." },
          { id: "pass_on", label: "Send it to a friend",    response: "They will know what you mean.\nThey ate alone too." }
        ]
      },
      {
        id: "first_call", x: 1630, y: 315, width: 26, height: 32, color: 0xeeb6c4, icon: "phone",
        initial: "A voicemail from the first week.\nSomeone wanted to hear you were okay.\nYou were trying.",
        prompt:  "What do you do with it now?",
        choices: [
          { id: "keep",    label: "Save it forever",                     response: "Their voice is a small, steady thing.\nYou keep it close." },
          { id: "leave",   label: "Listen once more, then let go",       response: "You hear it, and then you let it be.\nThat is enough." },
          { id: "pass_on", label: "Call them back",                      response: "You dial without a script.\nYou both still answer." }
        ]
      }
    ],
    doorwayReflections: {
      keep:    "You held tight to what you carried in.\nThat was how you arrived.",
      leave:   "You started setting things down before you needed to.\nThat was a quieter kind of brave.",
      pass_on: "You handed pieces of the start to other people.\nYou were not alone, even then.",
      mixed:   "You sorted what stayed and what didn't.\nNo one taught you how. You did it anyway."
    },
    transitionLine: "Year 2 begins."
  },

  // ==========================================================================
  // YEAR 2 — Settling.  Dim green.  What you started keeping.
  // ==========================================================================
  {
    id: "year2",
    year: 2,
    label: "Year 2  —  Settling",
    palette: {
      sky:         0x07120a,
      floor:       0x0d1810,
      floorAccent: 0x182c1f,
      stroke:      0x1c3624,
      door:        0x0b1a10,
      doorStroke:  0x224a2e,
      particle:    0x7eb088,
      ambient:     0x4e7058,
      labelColor:  "#7ab086"
    },
    // Year 2 outfit — muted green to settle into the green colorwave.
    outfit: {
      torso:  0x6d8a72,
      collar: 0x3a5440,
      legs:   0x1f2e26
    },
    memories: [
      {
        id: "major_form", x: 350, y: 315, width: 28, height: 32, color: 0xb0d68a, icon: "paper",
        initial: "A signed declaration of major.\nThe decision felt enormous at the time.\nIt looks small from here.",
        prompt:  "How do you feel about it?",
        choices: [
          { id: "keep",    label: "I chose well",        response: "You chose with what you had.\nYou were paying attention." },
          { id: "leave",   label: "I would choose again", response: "You would still pick this.\nThat counts as a kind of certainty." },
          { id: "pass_on", label: "I am still choosing",  response: "It's a beginning, not a verdict.\nYou can keep deciding." }
        ]
      },
      {
        id: "unread_msg", x: 670, y: 315, width: 30, height: 26, color: 0xa8b8b0, icon: "message",
        initial: "A friend wrote you a long message.\nYou meant to reply.\nYou still haven't.",
        prompt:  "What do you do?",
        choices: [
          { id: "keep",    label: "Reply now",                      response: "You apologize for the long wait.\nThey understand." },
          { id: "leave",   label: "Re-read it",                     response: "You read it slowly.\nYou notice the parts you missed before." },
          { id: "pass_on", label: "Send a new message instead",     response: "You start fresh.\nThey meet you where you are now." }
        ]
      },
      {
        id: "notebook", x: 990, y: 315, width: 26, height: 30, color: 0x7e62cc, icon: "notebook",
        initial: "A notebook you stopped writing in.\nThe last page is dated a year ago.\nThere is still room.",
        prompt:  "What do you do with the empty pages?",
        choices: [
          { id: "keep",    label: "Pick it back up",     response: "Your handwriting has changed.\nIt is still yours." },
          { id: "leave",   label: "Close it for now",    response: "It is not gone.\nYou can return whenever." },
          { id: "pass_on", label: "Start a new one",     response: "Some books are finished by you not finishing them.\nThat is allowed." }
        ]
      },
      {
        id: "club_sticker", x: 1310, y: 315, width: 30, height: 30, color: 0xe48a3a, icon: "sticker",
        initial: "A sticker from a club you joined for one week.\nYou meant to go back.\nThe sticker is still on your laptop.",
        prompt:  "How do you feel about it?",
        choices: [
          { id: "keep",    label: "Try it again",                response: "You walk back in.\nThey remember you, more than you expected." },
          { id: "leave",   label: "Let one week be enough",      response: "You showed up.\nThat counts for something, right?" },
          { id: "pass_on", label: "Try something new instead",   response: "The sticker stays.\nYou look forward, not down." }
        ]
      },
      {
        id: "coffee_cup", x: 1630, y: 315, width: 24, height: 30, color: 0x7a513a, icon: "cup",
        initial: "An empty cup from a 3am.\nYou do not remember the night clearly.\nYou survived it, which counts.",
        prompt:  "How do you remember it?",
        choices: [
          { id: "keep",    label: "It was worth it",        response: "You wrote what you had to write.\nYou did the thing." },
          { id: "leave",   label: "I should have slept",    response: "You forgive the version of you who chose the cup.\nThey were doing their best." },
          { id: "pass_on", label: "I will sleep tonight",   response: "Tonight is a different night.\nYou know more than you did." }
        ]
      }
    ],
    doorwayReflections: {
      keep:    "You decided what was worth keeping a second year.\nYou were starting to know yourself.",
      leave:   "You let some things rest.\nYou were still choosing, just more quietly.",
      pass_on: "You opened the things you had toward other people.\nNothing stayed only yours.",
      mixed:   "You spent the year noticing what you carried.\nNoticing is its own kind of progress."
    },
    transitionLine: "Year 3 begins."
  },

  // ==========================================================================
  // YEAR 3 — Reckoning.  Amber.  What you weighed yourself against.
  // ==========================================================================
  {
    id: "year3",
    year: 3,
    label: "Year 3  —  Reckoning",
    palette: {
      sky:         0x140a05,
      floor:       0x1c1208,
      floorAccent: 0x33240f,
      stroke:      0x3a2814,
      door:        0x180e06,
      doorStroke:  0x4e3415,
      particle:    0xddb066,
      ambient:     0x8e6628,
      labelColor:  "#d8a85a"
    },
    // Year 3 outfit — warm amber/rust to match the reckoning glow.
    outfit: {
      torso:  0xb08862,
      collar: 0x7a5236,
      legs:   0x3e2a18
    },
    memories: [
      {
        id: "rejection", x: 350, y: 315, width: 30, height: 24, color: 0xc24a3e, icon: "envelope",
        initial: "An email that started with 'Unfortunately.'\nIt wasn't the first.\nIt won't be the last.",
        prompt:  "What do you do with it?",
        choices: [
          { id: "keep",    label: "Read it again",              response: "It still stings.\nIt no longer rules you." },
          { id: "leave",   label: "Delete it",                  response: "It's gone from the inbox.\nIt was never the verdict." },
          { id: "pass_on", label: "Reply with something kind",  response: "You thank them for the time.\nYou move forward, yourself intact." }
        ]
      },
      {
        id: "lanyard", x: 670, y: 315, width: 18, height: 36, color: 0x6d8aa8, icon: "lanyard",
        initial: "A lanyard from a place that never called you back.\nYou were proud to wear it.\nYou are allowed to still be proud.",
        prompt:  "What does it mean to you?",
        choices: [
          { id: "keep",    label: "Keep it in a drawer",     response: "It was a chapter.\nIt deserved its closing line." },
          { id: "leave",   label: "Throw it away",           response: "Some things stop fitting.\nLetting go is not failure." },
          { id: "pass_on", label: "Wear it once more",       response: "You wear it for a day.\nThen you decide it is finished." }
        ]
      },
      {
        id: "portfolio", x: 990, y: 315, width: 30, height: 28, color: 0xd4a542, icon: "folder",
        initial: "An old portfolio. A folder of work you almost finished.\nYou can still see what you meant.\nThe version of you who started this knew something.",
        prompt:  "What do you do with it?",
        choices: [
          { id: "keep",    label: "Finish it now",           response: "You are not the same person who started.\nYou are the person who can finish." },
          { id: "leave",   label: "Archive it kindly",       response: "Not every draft becomes a final.\nThis one taught you what you needed." },
          { id: "pass_on", label: "Start a fresh one",       response: "The new one will know what this one didn't.\nYou taught yourself that." }
        ]
      },
      {
        id: "group_photo", x: 1310, y: 315, width: 32, height: 26, color: 0x4ab9c8, icon: "photo",
        initial: "A photo from a night you skipped.\nThey look happy without you.\nThat is allowed.",
        prompt:  "How do you respond?",
        choices: [
          { id: "keep",    label: "Reach out",            response: "You text someone in the photo.\nThey are glad to hear from you." },
          { id: "leave",   label: "Look away gently",     response: "Your absence was a kind of care, too.\nIt's not the end of the world." },
          { id: "pass_on", label: "Save it as theirs",    response: "It was a good night for them.\nYou are glad it was." }
        ]
      },
      {
        id: "empty_week", x: 1630, y: 315, width: 32, height: 22, color: 0xa4a4a0, icon: "week",
        initial: "A week you spent doing very little.\nYou called it lost.\nIt was not lost.",
        prompt:  "What do you call it now?",
        choices: [
          { id: "keep",    label: "Call it rest",           response: "Rest is not absence.\nRest is part of the work." },
          { id: "leave",   label: "Forgive yourself",       response: "You needed it.\nYou are not behind." },
          { id: "pass_on", label: "Note it as data",        response: "You learn what your limits feel like.\nThat is useful, not failure." }
        ]
      }
    ],
    doorwayReflections: {
      keep:    "You held on through a hard year.\nThat is its own kind of strength.",
      leave:   "You let some things go that felt impossible to release.\nIt did not make you smaller.",
      pass_on: "You handed pieces of the year to other people.\nYou did not carry everything alone.",
      mixed:   "You weighed things.\nYou let weight be a teacher."
    },
    transitionLine: "Year 4 begins."
  },

  // ==========================================================================
  // YEAR 4 — Becoming.  Warm white.  What you carry out.
  // ==========================================================================
  {
    id: "year4",
    year: 4,
    label: "Year 4  —  Becoming",
    palette: {
      sky:         0x12110d,
      floor:       0x1c1a14,
      floorAccent: 0x36322a,
      stroke:      0x3a3630,
      door:        0x18160f,
      doorStroke:  0x4a443a,
      particle:    0xe6dfc6,
      ambient:     0xa49a78,
      labelColor:  "#dccfb0"
    },
    // Year 4 outfit — warm cream/khaki to match the becoming light.
    outfit: {
      torso:  0xcab896,
      collar: 0x8a7a5a,
      legs:   0x4a4232
    },
    memories: [
      {
        id: "thesis", x: 350, y: 315, width: 28, height: 32, color: 0xeed8a8, icon: "stack",
        initial: "A document with your name at the top.\nYou're almost done.",
        prompt:  "What do you do with it?",
        choices: [
          { id: "keep",    label: "Send it in",                       response: "You submit it as it is.\nIt was always going to be you." },
          { id: "leave",   label: "Read it one more time",            response: "You read it like a stranger.\nYou would believe this person." },
          { id: "pass_on", label: "Hold onto it a little longer",     response: "Not everything has to be finished today.\nIt is okay to wait." }
        ]
      },
      {
        id: "cap", x: 670, y: 315, width: 30, height: 26, color: 0x2c2c2c, icon: "cap",
        initial: "The graduation cap fits.\nYou did not always believe it would.\nYou were wrong about that.",
        prompt:  "How do you wear it?",
        choices: [
          { id: "keep",    label: "Wear it proudly",                  response: "You let yourself be seen.\nAnd it's well deserved." },
          { id: "leave",   label: "Throw it in the air",              response: "You let the gesture mean something.\nYou are allowed celebration." },
          { id: "pass_on", label: "Save it for someone after you",    response: "It will fit them, too.\nYou know now." }
        ]
      },
      {
        id: "goodbye_note", x: 990, y: 315, width: 28, height: 32, color: 0xa8c8e4, icon: "paper",
        initial: "A note from a friend.\nThe ink already feels like memory.\nYou will not see them tomorrow the way you did yesterday.",
        prompt:  "How do you hold it?",
        choices: [
          { id: "keep",    label: "Reply to them",                 response: "You write back, not as a goodbye.\nMore as a 'see ya!'" },
          { id: "leave",   label: "Pin it up",                     response: "You put it where you can see it.\nIt stays a part of the room." },
          { id: "pass_on", label: "Keep it in a book",             response: "You will find it again, later.\nYou will be glad you kept it." }
        ]
      },
      {
        id: "empty_room", x: 1310, y: 315, width: 32, height: 32, color: 0x494949, icon: "door",
        initial: "Your room, stripped to the walls.\nIt echoes a little.\nIt did not echo before.",
        prompt:  "How do you leave it?",
        choices: [
          { id: "keep",    label: "Take a photo",                  response: "The walls hold less now.\nThe photo holds a little more." },
          { id: "leave",   label: "Sit one last time",             response: "You sit. You breathe.\nYou let the room finish becoming a memory." },
          { id: "pass_on", label: "Leave the door open",           response: "Someone else will live here.\nYou wish them well." }
        ]
      },
      {
        id: "old_photo", x: 1630, y: 315, width: 28, height: 26, color: 0xd6c2a8, icon: "photo",
        initial: "A photo of you, four years ago.\nYou barely recognize them.\nThey look hopeful.",
        prompt:  "What do you say to them?",
        choices: [
          { id: "keep",    label: "Thank them",                  response: "You thank them for trying.\nThey would be relieved to hear it." },
          { id: "leave",   label: "Wave goodbye",                response: "You let them stay where they were." },
          { id: "pass_on", label: "Tell them it is okay",        response: "You promise them they make it through.\nYou keep the promise on their behalf." }
        ]
      }
    ],
    // Year 4 doorway is the final ending. transitionLine is the closing whisper.
    doorwayReflections: {
      keep:    "You carried more than you thought.",
      leave:   "You left some things behind, but not yourself.",
      pass_on: "You handed pieces of yourself forward. They were received.",
      mixed:   "You are still becoming."
    },
    // Cumulative closing lines used only at the very end of Year 4, after the
    // per-year recap. Distinct from doorwayReflections so the recap and the
    // closing line never collide on the same string.
    finalReflections: {
      keep:    "Four years of holding on, and you are still here.\nThat is what holding on was for.",
      leave:   "Four years of setting things down, and you are still whole.\nThat is what letting go made room for.",
      pass_on: "Four years of passing pieces of yourself forward.\nOther people carry the rest now, too.",
      mixed:   "Four years of sorting through what you would carry.\nYou learned your own weight."
    },
    transitionLine: "You're still you."
  }
];

// ---------------------------------------------------------------------------
// Multi-hallway lifecycle: load, transition, restart.
// ---------------------------------------------------------------------------

function loadHallway(scene, index) {
  // Tear down anything from the previous hallway.
  destroyHallwayObjects();
  memoryGlows = {};
  interactables = null;
  endingZone = null;
  doorwayActive = false;

  // Reset the graduation cap — it only ever exists within Year 4.
  if (playerCap) {
    playerCap.destroy();
    playerCap = null;
  }
  capState = "none";

  // Reset the "stay a while" chair — also Year-4-only.
  if (chair) {
    chair.destroy();
    chair = null;
  }
  if (chairHint) {
    chairHint.destroy();
    chairHint = null;
  }
  chairZone = null;
  sitState = "none";
  roomIlluminated = false;

  currentHallwayIndex = index;
  const hw = hallwayDefinitions[index];

  // Make sure this hallway has a slot in playerChoices.
  if (!playerChoices[hw.id]) playerChoices[hw.id] = {};

  // Build environment first so memories sit on top of it.
  createAtmosphere(scene, hw);

  // Year label, top-center of viewport.
  yearLabelText = scene.add.text(gameWidth / 2, 30, hw.label, {
    fontFamily: "monospace",
    fontSize: "13px",
    color: hw.palette.labelColor
  });
  yearLabelText.setOrigin(0.5, 0);
  yearLabelText.setScrollFactor(0);
  yearLabelText.setDepth(900);
  currentHallwayObjects.push(yearLabelText);

  createAllInteractables(scene, hw);
  createDoorway(scene, hw);

  // Reset the player to the start of the hallway.
  if (player) {
    player.x = 200;
    player.y = 300;
    if (player.body) {
      player.body.reset(player.x, player.y);
    }
  }

  // Swap the player's outfit to match this year's colorwave.
  applyPlayerOutfit(hw);
}

function destroyHallwayObjects() {
  for (const obj of currentHallwayObjects) {
    if (obj && typeof obj.destroy === "function") {
      obj.destroy();
    }
  }
  currentHallwayObjects = [];
}

function transitionToNextHallway(scene) {
  if (isTransitioning) return;
  isTransitioning = true;

  scene.cameras.main.fadeOut(900, 0, 0, 0);
  scene.cameras.main.once("camerafadeoutcomplete", () => {
    const next = currentHallwayIndex + 1;
    if (next < hallwayDefinitions.length) {
      loadHallway(scene, next);
    }
    scene.cameras.main.fadeIn(900, 0, 0, 0);
    scene.cameras.main.once("camerafadeincomplete", () => {
      isTransitioning = false;
    });
  });
}

function restartGame(scene) {
  if (isTransitioning) return;
  isTransitioning = true;

  scene.cameras.main.fadeOut(1200, 0, 0, 0);
  scene.cameras.main.once("camerafadeoutcomplete", () => {
    playerChoices = {};
    currentHallwayIndex = 0;
    loadHallway(scene, 0);
    scene.cameras.main.fadeIn(1200, 0, 0, 0);
    scene.cameras.main.once("camerafadeincomplete", () => {
      isTransitioning = false;
    });
  });
}

function isFinalHallway() {
  return currentHallwayIndex === hallwayDefinitions.length - 1;
}
