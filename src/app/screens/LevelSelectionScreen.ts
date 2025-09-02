import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Texture } from "pixi.js";

/** Screen show level selection */
export class LevelSelectionScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["menu"];
  /** Background */
  private background: Sprite;
  /** Label */
  private selectLevelLabel: Sprite;
  /** Buttons */

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
  }
  /** Resize the screen, fired whenever window size changes  */
  public resize(width: number, height: number) {
    this.background.setSize(width, height);

    this.selectLevelLabel.position.set(width * 0.5, height * 0.15);
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
}
