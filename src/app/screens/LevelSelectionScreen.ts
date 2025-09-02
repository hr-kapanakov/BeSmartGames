import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Texture } from "pixi.js";
import { gameMgr } from "../../games/GameManager";
import { Button } from "../ui/Button";
import { engine } from "../getEngine";
import { LoadScreen } from "./LoadScreen";
import { GameScreen } from "./GameScreen";

/** Screen show level selection */
export class LevelSelectionScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["menu"];
  /** Background */
  private background: Sprite;
  /** Label */
  private selectLevelLabel: Sprite;
  /** Buttons */
  private levelButtons: Button[];

  constructor() {
    super();
    this.background = new Sprite({
      texture: Texture.from("background-level-selection.png"),
    });
    this.addChildAt(this.background, 0);

    this.selectLevelLabel = new Sprite({
      texture: Texture.from("label-select-level.png"),
      anchor: 0.5,
      scale: 0.75,
    });
    this.addChild(this.selectLevelLabel);

    this.levelButtons = [];
  }

  init(gameName: string) {
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
      this.levelButtons.push(button);
      this.addChild(button);
    }
  }

  /** Resize the screen, fired whenever window size changes  */
  public resize(width: number, height: number) {
    this.background.setSize(width, height);

    this.selectLevelLabel.position.set(width * 0.5, height * 0.15);

    for (let idx = 0; idx < this.levelButtons.length; idx++) {
      this.levelButtons[idx].position.x = width * 0.5 - 300 + (idx % 5) * 150;
      this.levelButtons[idx].position.y =
        height * 0.35 + Math.floor(idx / 5) * 150;
    }
  }
  /** Show screen with animations */
  public async show() {
    this.alpha = 1;
  }
  /** Hide screen with animations */
  public async hide() {
    await animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.3,
      ease: "linear",
      delay: 1,
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
