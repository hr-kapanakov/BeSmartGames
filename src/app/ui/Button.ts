import { FancyButton } from "@pixi/ui";

import { Label } from "./Label";
import { DropShadowFilter } from "pixi-filters/drop-shadow";

const defaultButtonOptions = {
  defaultView: "blue_button.png",
  text: "",
  width: 400,
  height: 150,
  fontSize: 50,
};

type ButtonOptions = typeof defaultButtonOptions;

/**
 * The big rectangle button, with a label, idle and pressed states
 */
export class Button extends FancyButton {
  constructor(options: Partial<ButtonOptions> = {}) {
    const opts = { ...defaultButtonOptions, ...options };

    super({
      defaultView: opts.defaultView,
      nineSliceSprite: [350, 150, 350, 150],
      anchor: 0.5,
      text: new Label({
        text: opts.text,
        style: {
          fill: "#ffffff",
          align: "center",
          fontSize: opts.fontSize,
          fontFamily: "Comic Sans MS",
          fontWeight: "bold",
          stroke: {
            color: "#000000",
            width: 4,
          },
        },
      }),
      textOffset: { x: 0, y: -7 },
      defaultTextAnchor: 0.5,
      scale: 0.9,
      animations: {
        hover: {
          props: {
            scale: { x: 1.03, y: 1.03 },
            y: 0,
          },
          duration: 100,
        },
        pressed: {
          props: {
            scale: { x: 0.97, y: 0.97 },
            y: 10,
          },
          duration: 100,
        },
      },
    });

    this.filters = [
      new DropShadowFilter({
        offset: { x: 4, y: 6 },
        color: 0x000000,
        alpha: 0.5,
        blur: 3,
      }),
    ];

    this.width = opts.width;
    this.height = opts.height;

    this.onDown.connect(this.handleDown.bind(this));
    this.onHover.connect(this.handleHover.bind(this));
  }

  private handleHover() {
    // TODO:
    // engine().audio.sfx.play("main/sounds/sfx-hover.wav");
  }

  private handleDown() {
    // TODO:
    //engine().audio.sfx.play("main/sounds/sfx-press.wav");
  }
}
