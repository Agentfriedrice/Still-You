// ============================================================================
// state.js
// Shared globals for Still You. Kept in one file so every other module can
// reach them without import plumbing.
// ============================================================================

let game;

// --- Player + input ---------------------------------------------------------
let player;
let keys;
let interactKey;
let dismissKey;   // 'Q' — back out of the doorway overlay to revisit memories

// --- Dialogue UI ------------------------------------------------------------
let dialogueBox;
let dialogueText;
let dialogueHintText;
let isDialogueOpen = false;
let dialogueState = "closed"; // 'closed' | 'initial' | 'prompt' | 'response'

// --- Interactables ----------------------------------------------------------
let currentObject = null;     // memory the player is standing next to
let interactables;            // Phaser static group for the current hallway
let activeInteractable = null;
let totalInteractables = 0;
let selectedChoiceIndex = 0;

// playerChoices is now nested by hallway id:
//   playerChoices[hallwayId][memoryId] = choiceId
let playerChoices = {};

// --- Multi-hallway ----------------------------------------------------------
let currentHallwayIndex = 0;
// Everything drawn for the current hallway is pushed here so we can tear it
// all down cleanly on transition.
let currentHallwayObjects = [];
let yearLabelText = null;

// --- Doorway + ending -------------------------------------------------------
let endingZone = null;
let doorwayActive = false;     // overlay currently fading in/shown
let isTransitioning = false;   // in the middle of a hallway swap
let endingOverlay = null;
let endingText = null;
let endingPrompt = null;

// --- Memory feedback --------------------------------------------------------
// Glow ellipses keyed by memory id, refreshed each hallway load.
let memoryGlows = {};

// --- Scene handle -----------------------------------------------------------
// Set once in scene.create so non-scene functions can reach scene.tweens etc.
let gameScene = null;

// --- Graduation cap (Year 4 "cap" memory) -----------------------------------
// playerCap is a Phaser Container holding the mortarboard shapes.
// capState: 'none' | 'worn' | 'thrown'
//   worn   -> the cap follows the player's head every frame
//   thrown -> the cap was flung into the air and rests on the ground, then
//             quietly returns to the player's head after a few seconds
let playerCap = null;
let capState = "none";

// --- "Stay a while" chair (Year 4 final-doorway epilogue) -------------------
// Choosing "stay a little longer" at the final doorway brings out a chair by
// the windows. Sitting fills the room with warm light and visible dust.
// sitState: 'none' | 'available' | 'sitting'
let chair = null;
let chairHint = null;
let chairZone = null;          // { x, y, radius }
let sitState = "none";
let roomIlluminated = false;

// X-centres of the back-wall windows for the current hallway. Populated in
// createAtmosphere; read by the sun-ray effect in chair.js.
let windowPositions = [];
