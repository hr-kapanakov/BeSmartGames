import { animate } from "motion";
import { BlurFilter, Container, Sprite, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { LevelSelectionScreen } from "../screens/LevelSelectionScreen";

/** Popup that shows up when gameplay is paused */
export class MenuPopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  /** Container for the popup UI components */
  private panel: Container;
  /** The panel background */
  private panelBase: RoundedBox;
  /** The popup title label */
  private title: Label;
  /** Stars */
  private stars: Button;
  /** Buttons */
  private continueButton: Button;
  private homeButton: Button;

  constructor(args: unknown = null) {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox({ height: 300 });
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: args[0], 
      style: { fill: "white", fontSize: 50 },
    });
    this.title.y = -this.panelBase.boxHeight * 0.5 + 60;
    this.panel.addChild(this.title);

    this.stars = new Button(
      {
        defaultView: "rounded-box.png",
        nineSliceSprite: [64, 64, 64, 64],
        textOffset: { x: -25, y: 0 },
        icon: "stars.png",
        defaultIconScale: 0.7,
        iconOffset: { x: 20 },
      },
      `${args[1]}`,
      112,
      64,
      false,
      false,
    );
    this.stars.y = -20;
    this.stars.enabled = false;
    this.panel.addChild(this.stars);

    this.continueButton = new Button(
      {
        defaultView: "button-orange.png",
        icon: "icon-continue.png",
      },
      "",
      160,
      80,
    );
    this.continueButton.x = -80;
    this.continueButton.y = this.panelBase.boxHeight * 0.5 - 78;
    this.continueButton.onPress.connect(() =>
      engine().navigation.dismissPopup(),
    );
    this.panel.addChild(this.continueButton);

    this.homeButton = new Button(
      {
        icon: "icon-home.png",
      },
      "",
      160,
      80,
    );
    this.homeButton.x = 80;
    this.homeButton.y = this.panelBase.boxHeight * 0.5 - 78;
    this.homeButton.onPress.connect(async () => {
      await engine().navigation.dismissPopup();
      await engine().navigation.showScreen(LevelSelectionScreen, args[2]);
    });
    this.panel.addChild(this.homeButton);
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;
  }

  /** Present the popup, animated */
  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 5 }),
      ];
    }
    this.bg.alpha = 0;
    this.panel.pivot.y = -400;
    animate(this.bg, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" },
    );
  }

  /** Dismiss the popup, animated */
  public async hide() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.bg, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.panel.pivot,
      { y: -500 },
      { duration: 0.3, ease: "backIn" },
    );
  }
}
