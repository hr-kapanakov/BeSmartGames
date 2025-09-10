import { animate } from "motion";
import { BlurFilter, Container, Sprite, Text, Texture } from "pixi.js";

import { engine } from "../getEngine";
import { Label } from "../ui/Label";
import { RoundedBox } from "../ui/RoundedBox";
import { Button } from "../ui/Button";
import { ScrollBox } from "@pixi/ui";

/** Popup that shows up the release notes */
export class ReleaseNotesPopup extends Container {
  /** The dark semi-transparent background covering current screen */
  private bg: Sprite;
  /** Container for the popup UI components */
  private panel: Container;
  /** The panel background */
  private panelBase: RoundedBox;
  /** The popup title label */
  private title: Label;
  /** Close button */
  private closeButton: Button;
  /** Release notes scroll box */
  private scrollBox!: ScrollBox;

  constructor() {
    super();

    this.bg = new Sprite(Texture.WHITE);
    this.bg.tint = 0x0;
    this.bg.interactive = true;
    this.addChild(this.bg);

    this.panel = new Container();
    this.addChild(this.panel);

    this.panelBase = new RoundedBox();
    this.panel.addChild(this.panelBase);

    this.title = new Label({
      text: "Release Notes",
      style: { fill: "white", fontSize: 50 },
    });
    this.panel.addChild(this.title);

    this.closeButton = new Button(
      {
        defaultView: new Sprite({
          texture: Texture.from("circle.png"),
          tint: "#ff1111",
        }),
        nineSliceSprite: undefined,
        anchor: 0.5,
        textOffset: { y: -4 },
      },
      "X",
      96,
      96,
    );
    this.closeButton.onPress.connect(() => engine().navigation.dismissPopup());
    this.panel.addChild(this.closeButton);
  }

  /** Resize the popup, fired whenever window size changes */
  public resize(width: number, height: number) {
    this.bg.width = width;
    this.bg.height = height;

    this.panelBase.boxWidth = Math.max(550, width * 0.5);
    this.panelBase.boxHeight = height * 0.75;
    this.panel.x = width * 0.5;
    this.panel.y = height * 0.5;

    this.title.y = -this.panelBase.boxHeight * 0.5 + 60;
    this.closeButton.setSize(48, 48);
    this.closeButton.position.set(
      this.panelBase.width / 2 - this.closeButton.width * 1.25,
      -this.panelBase.height / 2 + this.closeButton.height * 1.25,
    );

    if (!this.scrollBox) {
      this.scrollBox = new ScrollBox({
        width: this.panelBase.boxWidth * 0.9,
        height: this.panelBase.boxHeight * 0.85 - 60,
        type: "vertical",
        padding: 20,
      });
      this.panel.addChild(this.scrollBox);

      this.addReleaseNote("v0.1.0", "* Directions game with first 10 levels");
    }
    this.scrollBox.width = this.panelBase.boxWidth * 0.9;
    this.scrollBox.x = (-this.panelBase.boxWidth * 0.9) / 2;
    this.scrollBox.height = this.panelBase.boxHeight * 0.85 - 60;
    this.scrollBox.y = (-this.panelBase.boxHeight * 0.85 + 120) / 2;
  }

  private addReleaseNote(title: string, description: string) {
    const container = new Container();
    const titleLabel = new Text({
      text: title,
      style: {
        fill: "#ffffff",
        align: "center",
        fontSize: 32,
        fontFamily: "Comic Sans MS",
        fontWeight: "bold",
        fontStyle: "italic",
      },
    });
    container.addChild(titleLabel);

    const text = new Text({
      text: description,
      style: {
        fill: "#ffffff",
        fontSize: 24,
        fontFamily: "Comic Sans MS",
        lineHeight: 24,
      },
    });
    text.y = titleLabel.height;
    container.addChild(text);
    this.scrollBox.addItem(container);
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
