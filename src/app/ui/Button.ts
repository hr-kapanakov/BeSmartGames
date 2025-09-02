import { ButtonOptions, FancyButton } from "@pixi/ui";

import { Label } from "./Label";
import { DropShadowFilter } from "pixi-filters/drop-shadow";
import { engine } from "../getEngine";

/**
 * The big rectangle button, with a label, idle and pressed states
 */
export class Button extends FancyButton {
  private _enabled = true;

  public get textLabel() {
    return this.textView as Label;
  }

  constructor(
    options: Partial<ButtonOptions> = {},
    text = "",
    width = 400,
    height = 150,
    enabled = true,
    shadow = true,
  ) {
    const opts: ButtonOptions = {
      defaultView: "button-blue.png",
      nineSliceSprite: [350, 150, 350, 150],
      anchor: 0.5,
      text: new Label({
        text: text,
        style: {
          fill: "#ffffff",
          align: "center",
          fontSize: 50,
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
    };

    if (enabled) {
      opts["animations"] = {
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
      };
    }

    super({ ...opts, ...options });

    this._enabled = enabled;
    if (shadow) {
      this.filters = [
        new DropShadowFilter({
          offset: { x: 4, y: 6 },
          color: 0x000000,
          alpha: 0.5,
          blur: 3,
        }),
      ];
    }

    this.width = width;
    this.height = height;

    this.onDown.connect(this.handleDown.bind(this));
    this.onHover.connect(this.handleHover.bind(this));
  }

  private handleHover() {
    if (this._enabled)
      engine().audio.sfx.play("menu/sounds/sfx-hover.wav", { volume: 0.5 });
  }

  private handleDown() {
    if (this._enabled) engine().audio.sfx.play("menu/sounds/sfx-press.wav");
  }
}
