import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Texture } from "pixi.js";

/** Screen show level selection */
export class LevelSelectionScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["default", "menu"];
  /** Background */
  private background: Sprite;
  /** Buttons */

  constructor() {
    super();
    this.background = new Sprite({
      texture: Texture.from("background.png"),
    });
    this.addChildAt(this.background, 0);
  }
  /** Resize the screen, fired whenever window size changes  */
  public resize(width: number, height: number) {
    this.background.setSize(width, height);
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
