import { Container, Sprite, Texture } from "pixi.js";
import { Button } from "../../app/ui/Button";
import { ScrollBox } from "@pixi/ui";
import { DirectionsGame } from "./DirectionsGame";
import { Direction } from "../Utils";
import { SettingsPopup } from "../../app/popups/SettingsPopup";
import { engine } from "../../app/getEngine";
import { MenuPopup } from "../../app/popups/MenuPopup";

export class DirectionUI {
  private static ButtonSize = 96;

  private container: Container;
  private game: DirectionsGame;

  /** Level label */
  private levelLabel: Button;
  private levelPoints: Button;
  /** Settings button */
  private settingsButton: Button;
  /** Home button */
  private homeButton: Button;
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

    // level info
    this.levelLabel = new Button(
      {
        defaultView: "circle.png",
        nineSliceSprite: [64, 64, 64, 64],
        textOffset: { x: 0, y: -3 },
      },
      `Level ${this.game.currLevelIdx + 1}`,
      168,
      64,
      false,
      false,
    );
    this.levelLabel.enabled = false;
    this.levelLabel.textLabel.style.fontSize = 30;
    this.container.addChild(this.levelLabel);

    this.levelPoints = new Button(
      {
        defaultView: "rounded-box.png",
        nineSliceSprite: [64, 64, 64, 64],
        textOffset: { x: 25, y: 0 },
        icon: "stars.png",
        defaultIconScale: 0.7,
        iconOffset: { x: -20 },
      },
      `${this.game.points}`,
      112,
      64,
      false,
      false,
    );
    this.levelPoints.enabled = false;
    this.levelPoints.textLabel.style.fontSize = 30;
    this.container.addChild(this.levelPoints);

    // settings button
    this.settingsButton = new Button(
      {
        defaultView: "circle.png",
        nineSliceSprite: [64, 64, 64, 64],
        anchor: 0.5,
        icon: "icon-settings.png",
      },
      "",
      64,
      64,
    );
    this.settingsButton.onPress.connect(() =>
      engine().navigation.presentPopup(SettingsPopup),
    );
    this.container.addChild(this.settingsButton);

    // home button
    this.homeButton = new Button(
      {
        defaultView: "circle.png",
        nineSliceSprite: [64, 64, 64, 64],
        anchor: 0.5,
        icon: "icon-home.png",
      },
      "",
      64,
      64,
    );
    this.homeButton.onPress.connect(() =>
      engine().navigation.presentPopup(MenuPopup, [
        `Level ${this.game.currLevelIdx + 1}`,
        this.game.points,
        this.game.name,
      ]),
    );
    this.container.addChild(this.homeButton);

    // directions
    this.upButton = this.addDirectionsButton(Direction.Up);
    this.rightButton = this.addDirectionsButton(Direction.Right);
    this.downButton = this.addDirectionsButton(Direction.Down);
    this.leftButton = this.addDirectionsButton(Direction.Left);

    // scroll box
    this.scrollBox = new ScrollBox({
      background: "#7490A6",
      width: DirectionUI.ButtonSize + 6,
      height: DirectionUI.ButtonSize * 5.5,
      padding: 3,
      type: "vertical",
      radius: 7,
    });
    this.container.addChild(this.scrollBox);
    const startButton = new Sprite({
      texture: Texture.from("start.png"),
      width: DirectionUI.ButtonSize,
      height: DirectionUI.ButtonSize,
      cursor: "pointer",
    });
    startButton.on("pointerdown", () => this.game.startGame());
    this.scrollBox.addItem(startButton);

    // scroll box buttons
    this.scrollBoxUpButton = new Button(
      {
        defaultView: "button.png",
        nineSliceSprite: [64, 32, 64, 32],
        textOffset: { x: 0, y: 0 },
      },
      "<",
      this.scrollBox.width + 19,
      DirectionUI.ButtonSize / 2,
      false,
      false,
    );
    this.scrollBoxUpButton.textLabel.rotation = Math.PI / 2;
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
        textOffset: { x: 0, y: 0 },
      },
      ">",
      this.scrollBox.width + 19,
      DirectionUI.ButtonSize / 2,
      false,
      false,
    );
    this.scrollBoxDownButton.textLabel.rotation = Math.PI / 2;
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
        defaultView: "circle.png",
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
  }

  public resize(width: number, height: number): void {
    const centerX = width / 2;
    this.levelLabel.position.set(
      centerX + this.levelLabel.width / 2,
      height * 0.05,
    );
    this.levelPoints.position.set(
      width * 0.01 + this.levelPoints.width / 2,
      height * 0.05,
    );

    this.settingsButton.position.set(
      width * 0.99 - this.settingsButton.width * 1.5,
      height * 0.05,
    );
    this.homeButton.position.set(
      width * 0.99 - this.homeButton.width / 2,
      height * 0.05,
    );

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

  public update() {
    this.levelPoints.textLabel.text = `${this.game.points}`;
    const scrollItem = this.scrollBox.items[this.game.currDirIdx];
    if (scrollItem) {
      scrollItem.scale = 0.8;
      setTimeout(() => {
        scrollItem.scale = 0.75;

        this.scrollBox.scrollTo(
          Math.min(
            this.scrollBox.items.length - 1,
            (Math.floor(this.game.currDirIdx / 4) + 1) * 4,
          ),
        );
      }, 300);
    }
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
