import { animate } from "motion";
import type { ObjectTarget } from "motion/react";
import { Container, Sprite, Texture } from "pixi.js";
import { gameMgr } from "../../games/GameManager";
import { Button } from "../ui/Button";
import { engine } from "../getEngine";
import { LoadScreen } from "./LoadScreen";
import { GameScreen } from "./GameScreen";
import { MainMenuScreen } from "./MainMenuScreen";
import { ScrollBox } from "@pixi/ui";

/** Screen show level selection */
export class LevelSelectionScreen extends Container {
  private static ButtonSize = 150;

  /** Assets bundles required by this screen */
  public static assetBundles = ["default", "menu"];
  /** Background */
  private background: Sprite;
  /** Label */
  private gameNameLabel: Button;
  private selectLevelLabel: Sprite;
  /** Exit button */
  private exitButton: Button;
  /** Title */
  private title: Sprite;
  /** Level buttons scroll box */
  private scrollBox: ScrollBox;

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

    this.title = new Sprite({
      texture: Texture.from("title.png"),
      anchor: 0.5,
      scale: 0.25,
      tint: "#dddddd",
    });
    this.addChild(this.title);

    this.scrollBox = new ScrollBox({
      width: LevelSelectionScreen.ButtonSize * 5,
      height: LevelSelectionScreen.ButtonSize * 4,
      type: "vertical",
      bottomPadding: 50,
    });
    this.addChild(this.scrollBox);
  }

  init(gameName: string) {
    this.gameName = gameName;
    this.gameNameLabel.textLabel.text = gameName;

    this.scrollBox.removeItems();

    const game = gameMgr().game(gameName);
    if (!game) throw "Invalid game: " + gameName;

    // update last visit
    game.lastVisit = new Date();
    game.save();

    const levels = game?.levels || [];
    let row = new Container();
    for (let idx = 0; idx < levels.length; idx++) {
      const button = new Button(
        {
          defaultView: this.getButtonTexture(idx, levels[idx].unlocked),
          nineSliceSprite: [170, 175, 170, 175],
          anchor: 0,

          icon: levels[idx].unlocked ? "" : "lock.png",
          iconOffset: { x: 50, y: 50 },
          defaultIconScale: 0.5,
        },
        (idx + 1).toString(),
        LevelSelectionScreen.ButtonSize,
        LevelSelectionScreen.ButtonSize,
        levels[idx].unlocked,
      );
      button.x = (idx % 5) * LevelSelectionScreen.ButtonSize;

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
      if (levels[idx].points >= 0) {
        button.iconOffset = { y: 50 };
        button.iconView = new Button(
          {
            defaultView: "rounded-box.png",
            nineSliceSprite: [64, 64, 64, 64],
            textOffset: { x: -25, y: 0 },
            icon: "stars.png",
            defaultIconScale: 0.7,
            iconOffset: { x: 20 },
          },
          `${levels[idx].points}`,
          112,
          64,
          false,
          false,
        );
      }

      row.addChild(button);
      if (row.children.length == 5) {
        this.scrollBox.addItem(row);
        row = new Container();
      }
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

    this.scrollBox.position.set(
      width * 0.5 - LevelSelectionScreen.ButtonSize * 2.5,
      height * 0.2 +
        this.selectLevelLabel.height -
        LevelSelectionScreen.ButtonSize * 0.5,
    );
    this.scrollBox.height = height - this.scrollBox.y;
    // fix bug in scroll box after resize
    this.scrollBox.init({
      width: LevelSelectionScreen.ButtonSize * 5,
      height: height - this.scrollBox.y,
      type: "vertical",
      bottomPadding: 50,
    });

    this.title.position.set(
      width - this.title.width / 2,
      height - this.title.height / 2,
    );
  }

  public async show() {
    engine().audio.bgm.stop();
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
