import { Container, Sprite, Texture } from "pixi.js";
import { Button } from "../../app/ui/Button";
import { ScrollBox } from "@pixi/ui";
import { DirectionsGame } from "./DirectionsGame";
import { Direction } from "../Utils";

export class DirectionUI {
  private static ButtonSize = 96;

  private container: Container;
  private game: DirectionsGame;

  /** Buttons */
  private upButton: Button;
  private rightButton: Button;
  private downButton: Button;
  private leftButton: Button;
  /** Scroll box for the set of directions */
  private scrollBox: ScrollBox;
  private scrollBoxUpButton: Button;
  private scrollBoxDownButton: Button;
  private resetButton: Button;

  constructor(game: DirectionsGame, container: Container) {
    this.game = game;
    this.container = container;

    this.upButton = this.addDirectionsButton(Direction.Up);
    this.rightButton = this.addDirectionsButton(Direction.Right);
    this.downButton = this.addDirectionsButton(Direction.Down);
    this.leftButton = this.addDirectionsButton(Direction.Left);

    this.scrollBox = new ScrollBox({
      background: "#7490A6",
      width: DirectionUI.ButtonSize + 6,
      height: DirectionUI.ButtonSize * 5.5,
      padding: 3,
      type: "vertical",
      radius: 7,
    });
    this.scrollBox.addItem(
      new Sprite({
        texture: Texture.from("start.png"),
        width: DirectionUI.ButtonSize,
        height: DirectionUI.ButtonSize,
      }),
    );
    this.container.addChild(this.scrollBox);

    this.scrollBoxUpButton = new Button(
      {
        defaultView: "button.png",
        nineSliceSprite: [64, 32, 64, 32],
        textOffset: { x: 0, y: -4 },
      },
      "⏶",
      this.scrollBox.width + 19,
      DirectionUI.ButtonSize / 2,
      false,
      false,
    );
    this.scrollBoxUpButton.onPress.connect(() => {
      const idx = Math.max(
        4,
        Math.round(4 - this.scrollBox.scrollY / DirectionUI.ButtonSize) - 1,
      );
      this.scrollBox.scrollTo(idx);
    });
    this.container.addChild(this.scrollBoxUpButton);

    this.scrollBoxDownButton = new Button(
      {
        defaultView: "button.png",
        nineSliceSprite: [64, 32, 64, 32],
        textOffset: { x: 0, y: -4 },
      },
      "⏷",
      this.scrollBox.width + 19,
      DirectionUI.ButtonSize / 2,
      false,
      false,
    );
    this.scrollBoxDownButton.onPress.connect(() => {
      const idx = Math.min(
        Math.max(4, this.scrollBox.items.length - 1),
        Math.round(4 - this.scrollBox.scrollY / DirectionUI.ButtonSize) + 1,
      );
      this.scrollBox.scrollTo(idx);
    });
    this.container.addChild(this.scrollBoxDownButton);

    this.resetButton = new Button(
      {
        defaultView: "button2.png",
        nineSliceSprite: [64, 64, 64, 64],
        textOffset: { x: 0, y: -3 },
      },
      "↺",
      DirectionUI.ButtonSize * 0.8,
      DirectionUI.ButtonSize * 0.8,
      false,
      false,
    );
    this.resetButton.onPress.connect(() => {
      this.game.directions = [];
      // remove all but first
      while (this.scrollBox.items.length > 1) this.scrollBox.removeItem(1);
      this.game.stopGame();
    });
    this.container.addChild(this.resetButton);

    // TODO: level number, settings?, points
  }

  public resize(width: number, height: number): void {
    const centerX = width / 2;
    this.upButton.position.set(
      centerX - DirectionUI.ButtonSize * 1.8,
      height * 0.9,
    );
    this.rightButton.position.set(
      centerX - DirectionUI.ButtonSize * 0.6,
      height * 0.9,
    );
    this.downButton.position.set(
      centerX + DirectionUI.ButtonSize * 0.6,
      height * 0.9,
    );
    this.leftButton.position.set(
      centerX + DirectionUI.ButtonSize * 1.8,
      height * 0.9,
    );

    this.scrollBox.position.set(width * 0.01, height * 0.2);
    this.scrollBox.height = height * 0.5;

    this.scrollBoxUpButton.position.set(
      width * 0.01 + DirectionUI.ButtonSize / 2 + 3,
      height * 0.2 - DirectionUI.ButtonSize / 2 + 24,
    );
    this.scrollBoxDownButton.position.set(
      width * 0.01 + DirectionUI.ButtonSize / 2 + 3,
      height * 0.2 + this.scrollBox.height + DirectionUI.ButtonSize / 2 - 23,
    );

    this.resetButton.position.set(
      width * 0.01 + DirectionUI.ButtonSize / 2 + 3,
      height * 0.2 + this.scrollBox.height + DirectionUI.ButtonSize * 0.8,
    );
  }

  private addDirectionsButton(direction: Direction) {
    const dirStr = Direction[direction];
    const button = new Button(
      {
        defaultView: `${dirStr.toLowerCase()}.png`,
        nineSliceSprite: undefined,
      },
      "",
      DirectionUI.ButtonSize,
      DirectionUI.ButtonSize,
    );
    this.container.addChild(button);

    button.onPress.connect(() => this.addDirection(direction));
    return button;
  }

  private addDirection(direction: Direction) {
    // if game started not allow adding directions
    if (this.game.currDirIdx >= 0) return;

    this.game.directions.push(direction);
    const dirStr = Direction[direction];
    const dirButton = new Sprite({
      texture: Texture.from(`${dirStr.toLowerCase()}.png`),
      width: DirectionUI.ButtonSize,
      height: DirectionUI.ButtonSize,
      cursor: "pointer",
    });
    this.scrollBox.addItem(dirButton);
    this.scrollBox.scrollBottom();

    dirButton.on("pointerdown", () => {
      // if game started not allow removing directions
      if (this.game.currDirIdx >= 0) return;

      const idx = this.scrollBox.items.indexOf(dirButton as never);
      this.game.directions.splice(idx - 1, 1);
      this.scrollBox.removeItem(idx);
    });
  }
}
