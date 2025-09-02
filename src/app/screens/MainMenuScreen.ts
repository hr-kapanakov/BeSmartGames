import { Container, Sprite, Texture } from "pixi.js";
import { Button } from "../ui/Button";
import { engine } from "../getEngine";
import { LevelSelectionScreen } from "./LevelSelectionScreen";

/** Screen show main menu */
export class MainMenuScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["default", "menu"];
  /** Background */
  private background: Sprite;
  /** Title */
  private title: Sprite;
  /** Buttons */
  private directionsButton: Button;
  private settingsButton: Button;

  constructor() {
    super();

    this.background = new Sprite({
      texture: Texture.from("background-menu.png"),
    });
    this.addChildAt(this.background, 0);

    this.title = new Sprite({
      texture: Texture.from("title.png"),
      anchor: 0.5,
      scale: 0.5,
    });
    this.addChild(this.title);

    // TODO: add icon
    this.directionsButton = new Button({}, "Directions", 450, 125);
    this.directionsButton.onPress.connect(
      async () =>
        await engine().navigation.showScreen(
          LevelSelectionScreen,
          "Directions",
        ),
    );
    this.addChild(this.directionsButton);

    this.settingsButton = new Button(
      { defaultView: "button-orange.png" },
      "Settings",
      450,
      125,
    );
    // TODO:
    //this.settingsButton.onPress.connect(() =>
    //  engine().navigation.presentPopup(PausePopup),
    //);
    this.addChild(this.settingsButton);
  }

  /** Resize the screen, fired whenever window size changes  */
  public resize(width: number, height: number) {
    this.background.setSize(width, height);

    this.title.position.set(width * 0.5, height * 0.2);

    this.directionsButton.position.set(width * 0.5, height * 0.45);
    this.settingsButton.position.set(width * 0.5, height * 0.45 + 150);
  }
}
