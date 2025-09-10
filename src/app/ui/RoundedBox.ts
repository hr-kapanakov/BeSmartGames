import { Container, NineSliceSprite, Texture } from "pixi.js";

const defaultRoundedBoxOptions = {
  color: 0xffffff,
  width: 350,
  height: 600,
  shadow: true,
  shadowColor: 0xa0a0a0,
  shadowOffset: 11,
};

export type RoundedBoxOptions = typeof defaultRoundedBoxOptions;

/**
 * Generic rounded box based on a nine-sliced sprite that can be resized freely.
 */
export class RoundedBox extends Container {
  /** The rectangular area, that scales without distorting rounded corners */
  private image: NineSliceSprite;
  /** Optional shadow matching the box image, with y offest */
  private shadow?: NineSliceSprite;

  private opts: RoundedBoxOptions;

  constructor(options: Partial<RoundedBoxOptions> = {}) {
    super();
    this.opts = { ...defaultRoundedBoxOptions, ...options };
    this.image = new NineSliceSprite({
      texture: Texture.from("rounded-box.png"),
      leftWidth: 64,
      topHeight: 64,
      rightWidth: 64,
      bottomHeight: 64,
      width: this.opts.width,
      height: this.opts.height,
      tint: this.opts.color,
    });
    this.image.x = -this.image.width * 0.5;
    this.image.y = -this.image.height * 0.5;
    this.addChild(this.image);

    if (this.opts.shadow) {
      this.shadow = new NineSliceSprite({
        texture: Texture.from("rounded-box.png"),
        leftWidth: 64,
        topHeight: 64,
        rightWidth: 64,
        bottomHeight: 64,
        width: this.opts.width,
        height: this.opts.height,
        tint: this.opts.shadowColor,
      });
      this.shadow.x = -this.shadow.width * 0.5 + this.opts.shadowOffset / 2;
      this.shadow.y = -this.shadow.height * 0.5 + this.opts.shadowOffset;
      this.addChildAt(this.shadow, 0);
    }
  }

  /** Get the base width, without counting the shadow */
  public get boxWidth() {
    return this.image.width;
  }

  /** Set the base width without counting the shadow */
  public set boxWidth(value: number) {
    this.image.width = value;
    this.image.x = -this.image.width * 0.5;
    if (this.shadow) {
      this.shadow.width = value;
      this.shadow.x = -this.shadow.width * 0.5 + this.opts.shadowOffset / 2;
    }
  }

  /** Get the base height, without counting the shadow */
  public get boxHeight() {
    return this.image.height;
  }

  /** Set the base height without counting the shadow */
  public set boxHeight(value: number) {
    this.image.height = value;
    this.image.y = -this.image.height * 0.5;
    if (this.shadow) {
      this.shadow.height = value;
      this.shadow.y = -this.shadow.height * 0.5 + this.opts.shadowOffset;
    }
  }
}
