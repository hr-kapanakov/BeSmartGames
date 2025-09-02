import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Texture } from "pixi.js";
import { gameMgr } from "../../games/GameManager";
import { Button } from "../ui/Button";
import { engine } from "../getEngine";
import { LoadScreen } from "./LoadScreen";
import { GameScreen } from "./GameScreen";
import { MainMenuScreen } from "./MainMenuScreen";

/** Screen show level selection */
export class LevelSelectionScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["default", "menu"];
  /** Background */
  private background: Sprite;
  /** Label */
  private gameNameLabel: Button;
  private selectLevelLabel: Sprite;
  /** Exit button */
  private exitButton: Button;
  /** Level buttons */
  private levelButtons: Button[];
  /** Title */
  private title: Sprite;

  public gameName!: string;

  constructor() {
    super();
    this.background = new Sprite({
      texture: Texture.from("background-level-selection.png"),
    });
    this.addChildAt(this.background, 0);

    this.gameNameLabel = new Button(
      {
        defaultView: "circle.png",
        nineSliceSprite: [64, 64, 64, 64],
        textOffset: { y: -5 },
      },
      "",
      320,
      96,
      false,
      false,
    );
    this.gameNameLabel.enabled = false;
    this.addChild(this.gameNameLabel);

    this.selectLevelLabel = new Sprite({
      texture: Texture.from("label-select-level.png"),
      anchor: 0.5,
      scale: 0.75,
    });
    this.addChild(this.selectLevelLabel);

    // home button
    this.exitButton = new Button(
      {
        defaultView: "circle.png",
        nineSliceSprite: [64, 64, 64, 64],
        anchor: 0.5,
        icon: "icon-door.png",
      },
      "",
      64,
      64,
    );
    this.exitButton.onPress.connect(() =>
      engine().navigation.showScreen(MainMenuScreen),
    );
    this.addChild(this.exitButton);

    this.levelButtons = [];

    this.title = new Sprite({
      texture: Texture.from("title.png"),
      anchor: 0.5,
      scale: 0.25,
      tint: "#dddddd",
    });
    this.addChild(this.title);
  }

  init(gameName: string) {
    this.gameName = gameName;
    this.gameNameLabel.textLabel.text = gameName;

    this.levelButtons.forEach((b) => this.removeChild(b));
    this.levelButtons = [];

    const levels = gameMgr().game(gameName)?.levels || [];
    for (let idx = 0; idx < levels.length; idx++) {
      const button = new Button(
        {
          defaultView: this.getButtonTexture(idx, levels[idx].unlocked),
          nineSliceSprite: [170, 175, 170, 175],

          icon: levels[idx].unlocked ? "" : "lock.png",
          iconOffset: { x: 50, y: 50 },
          defaultIconScale: 0.5,
        },
        idx % 10 == 9 ? "?" : (idx + 1).toString(),
        150,
        150,
        levels[idx].unlocked,
      );
      button.position.set(100 + idx * 150, 200);

      if (levels[idx].unlocked) {
        button.onPress.connect(async () => {
          await engine().navigation.showScreen(LoadScreen);
          await engine().navigation.showScreen(
            GameScreen,
            [gameName, idx],
            [gameName.toLowerCase()],
          );
        });
      }
      // TODO: points of played levels

      this.levelButtons.push(button);
      this.addChild(button);
    }
  }

  /** Resize the screen, fired whenever window size changes  */
  public resize(width: number, height: number) {
    this.background.setSize(width, height);

    this.gameNameLabel.position.set(width * 0.5, height * 0.05);
    this.selectLevelLabel.position.set(width * 0.5, height * 0.15);
    this.exitButton.position.set(
      width * 0.99 - this.exitButton.width / 2,
      height * 0.05,
    );

    for (let idx = 0; idx < this.levelButtons.length; idx++) {
      this.levelButtons[idx].position.x = width * 0.5 - 300 + (idx % 5) * 150;
      this.levelButtons[idx].position.y =
        height * 0.35 + Math.floor(idx / 5) * 150;
    }

    this.title.position.set(width * 0.9, height * 0.93);
  }

  /** Hide screen with animations */
  public async hide() {
    await animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.5,
      ease: "easeIn",
    });
  }

  private getButtonTexture(idx: number, active: boolean): string {
    if (!active) {
      return "level-button-gray.png";
    }
    switch (idx % 5) {
      case 0:
        return "level-button-blue.png";
      case 1:
        return "level-button-green.png";
      case 2:
        return "level-button-yellow.png";
      case 3:
        return "level-button-purple.png";
      case 4:
        return "level-button-red.png";
    }
    return "level-button-blue.png";
  }
}
