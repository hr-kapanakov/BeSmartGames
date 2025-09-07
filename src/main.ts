import { CreationEngine } from "./engine/engine";
import { setEngine } from "./app/getEngine";
import { userSettings } from "./app/utils/userSettings";
import { gameMgr } from "./games/GameManager";
import { LoadScreen } from "./app/screens/LoadScreen";
import { MainMenuScreen } from "./app/screens/MainMenuScreen";
import { LevelSelectionScreen } from "./app/screens/LevelSelectionScreen";
import { GameScreen } from "./app/screens/GameScreen";

/**
 * Importing these modules will automatically register there plugins with the engine.
 */
import "@pixi/sound";
// import "@esotericsoftware/spine-pixi-v8";

// Create a new creation engine instance
const engine = new CreationEngine();
setEngine(engine);

(async () => {
  // Initialize the creation engine instance
  await engine.init({
    background: "#1E1E1E",
    resizeOptions: { minWidth: 900, minHeight: 900, letterbox: true },
  });

  // Initialize the user settings
  userSettings.init();

  // Hacks
  document.onkeydown = onKeyDown;

  // fullscreen on landscape
  window.addEventListener("orientationchange", () => {
    if (screen.orientation.type.includes("landscape"))
      document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  });

  if (document.visibilityState === "visible") keepScreenOn();
  document.addEventListener("visibilitychange", onVisibilityChange);

  // Show the main menu
  await engine.navigation.showScreen(LoadScreen);
  await engine.navigation.showScreen(MainMenuScreen);
  //await engine.navigation.showScreen(LevelSelectionScreen, "Directions");
  /*await engine.navigation.showScreen(
    GameScreen,
    ["Directions", 0],
    ["Directions".toLowerCase()],
  );*/
})();

function onKeyDown(evt: KeyboardEvent) {
  // level selection screen
  if (engine.navigation.currentScreen instanceof LevelSelectionScreen) {
    const levelSelectionScreen = engine.navigation
      .currentScreen as LevelSelectionScreen;

    // unlock all levels
    if (evt.altKey && evt.shiftKey && evt.key == "U") {
      console.log("HACK: unlock all levels");
      const game = gameMgr().game(levelSelectionScreen.gameName);
      game?.levels.forEach((g) => (g.unlocked = true));
      levelSelectionScreen.init(levelSelectionScreen.gameName);
      levelSelectionScreen.resize(
        engine.navigation.width,
        engine.navigation.height,
      );
    }
  }

  // game screen
  if (engine.navigation.currentScreen instanceof GameScreen) {
    const gameScreen = engine.navigation.currentScreen as GameScreen;

    // go to next level
    if (evt.altKey && evt.shiftKey && evt.key == "N") {
      console.log("HACK: go to next level");
      gameScreen.game?.init(gameScreen, gameScreen.game.currLevelIdx + 1);
      gameScreen.game?.resize(
        engine.navigation.width,
        engine.navigation.height,
      );
    }
  }
}

function keepScreenOn() {
  try {
    navigator.wakeLock.request("screen");
  } catch {
    /* empty */
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function onVisibilityChange(_evt: Event) {
  if (document.visibilityState === "visible") {
    keepScreenOn();
    engine.start();
  } else {
    engine.stop();
  }
}
