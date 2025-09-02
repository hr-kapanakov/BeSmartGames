import { CircularProgressBar } from "@pixi/ui";
import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Texture } from "pixi.js";
import { Label } from "../ui/Label";

/** Screen shown while loading assets */
export class LoadScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["default", "menu"];
  /** Title */
  private title: Sprite;
  /** The logo */
  private logo: Sprite;
  /** Progress Bar */
  private progressBar: CircularProgressBar;
  /** Loading Label */
  private loadingLabel: Label;

  constructor() {
    super();

    this.title = new Sprite({
      texture: Texture.from("title.png"),
      anchor: 0.5,
      scale: 0.5,
    });
    this.addChild(this.title);

    this.progressBar = new CircularProgressBar({
      backgroundColor: "#3d3d3d",
      fillColor: "#33C7F2",
      radius: 150,
      lineWidth: 15,
      value: 10,
      backgroundAlpha: 0.5,
      fillAlpha: 0.8,
      cap: "round",
    });

    this.progressBar.x += this.progressBar.width / 2;
    this.progressBar.y += -this.progressBar.height / 2;

    this.addChild(this.progressBar);

    this.logo = new Sprite({
      texture: Texture.from("logo.png"),
      anchor: 0.5,
      scale: 0.5,
    });
    this.addChild(this.logo);

    this.loadingLabel = new Label({
      text: "Loading...",
      anchor: 0.5,
      style: {
        fontSize: 32,
        fill: "#33C7F2",
      },
    });
    this.addChild(this.loadingLabel);
  }

  public onLoad(progress: number) {
    this.progressBar.progress = progress;
  }

  /** Resize the screen, fired whenever window size changes  */
  public resize(width: number, height: number) {
    this.title.position.set(width * 0.5, height * 0.2);
    this.logo.position.set(width * 0.5, height * 0.5);
    this.progressBar.position.set(width * 0.5, height * 0.5);
    this.loadingLabel.position.set(width * 0.5, height * 0.75);
  }

  /** Hide screen with animations */
  public async hide() {
    await animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.3,
      ease: "easeIn",
      delay: 1,
    });
  }
}
