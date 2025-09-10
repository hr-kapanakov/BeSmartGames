import { Container, Sprite, Texture } from "pixi.js";
import { Button } from "../ui/Button";
import { engine } from "../getEngine";
import { LevelSelectionScreen } from "./LevelSelectionScreen";
import { animate } from "motion";
import { ObjectTarget } from "motion/react";
import { gameMgr } from "../../games/GameManager";
import { ReleaseNotesPopup } from "../popups/ReleaseNotesPopup";

/** Screen show main menu */
export class MainMenuScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["default", "menu"];
  /** Background */
  private background: Sprite;
  /** Title */
  private title: Sprite;
  /** Buttons */
  private releaseNotesButton: Button;
  private gamesButtons: Button[] = [];
  private loadButton: Button;
  private saveButton: Button;

  constructor() {
    super();

    this.background = new Sprite({
      texture: Texture.from("background-menu.png"),
    });
    this.addChildAt(this.background, 0);

    this.title = new Sprite({
      texture: Texture.from("title.png"),
      anchor: 0.5,
      scale: 0.5,
    });
    this.addChild(this.title);

    this.releaseNotesButton = new Button(
      {
        defaultView: "circle.png",
        nineSliceSprite: [64, 64, 64, 64],
        anchor: 0.5,
        icon: "icon-release-notes.png",
        defaultIconScale: 0.8,
        iconOffset: { x: 1, y: -1 },
      },
      "",
      64,
      64,
    );
    this.releaseNotesButton.onPress.connect(() =>
      engine().navigation.presentPopup(ReleaseNotesPopup),
    );
    this.addChild(this.releaseNotesButton);

    // Games buttons
    for (const gameName of gameMgr().gameNames) {
      this.addGameButton(gameName);
    }

    // Load and save button
    this.loadButton = new Button(
      {
        defaultView: "button-orange.png",
        icon: "icon-load.png",
        iconOffset: { x: -110, y: -4 },
        defaultIconScale: 0.5,
        textOffset: { x: 20, y: -4 },
      },
      "Load from file",
      350,
      96,
    );
    this.loadButton.textLabel.style.fontSize = 30;
    this.loadButton.onPress.connect(() => this.loadFile());
    this.addChild(this.loadButton);

    this.saveButton = new Button(
      {
        defaultView: "button-orange.png",
        icon: "icon-save.png",
        iconOffset: { x: -100, y: -4 },
        defaultIconScale: 0.5,
        textOffset: { x: 10, y: -4 },
      },
      "Save to file",
      350,
      96,
    );
    this.saveButton.textLabel.style.fontSize = 30;
    this.saveButton.onPress.connect(() => this.saveFile());
    this.addChild(this.saveButton);
  }

  private addGameButton(gameName: string) {
    const icon = new Container();
    icon.addChild(
      new Sprite({
        texture: Texture.from(`${gameName.toLowerCase()}-icon.png`),
      }),
    );
    let iconOffset = { x: -130, y: -7 };

    // show alert if the game was updated after last visit
    const game = gameMgr().game(gameName);
    if (game && game.lastVisit && game.lastUpdate > game.lastVisit) {
      const alert = new Button(
        {
          defaultView: new Sprite({
            texture: Texture.from("circle.png"),
            tint: "red",
            scale: 0.7,
          }),
          nineSliceSprite: undefined,
          textOffset: { y: -4 },
        },
        "!",
        96,
        96,
        true,
        false,
      );
      alert.textLabel.rotation = -Math.PI / 18;
      alert.enabled = false;
      alert.position.set(-25, -20);
      icon.addChild(alert);
      iconOffset = { x: -100, y: 25 };
    }

    const button = new Button(
      {
        icon: icon,
        iconOffset: iconOffset,
        textOffset: { x: 40, y: -7 },
      },
      gameName,
      450,
      125,
    );
    button.onPress.connect(
      async () =>
        await engine().navigation.showScreen(LevelSelectionScreen, gameName),
    );
    this.gamesButtons.push(button);
    this.addChild(button);
  }

  /** Resize the screen, fired whenever window size changes  */
  public resize(width: number, height: number) {
    this.background.setSize(width, height);
    this.title.position.set(width * 0.5, height * 0.2);
    this.releaseNotesButton.position.set(
      width * 0.99 - this.releaseNotesButton.width / 2,
      height * 0.05,
    );

    for (let i = 0; i < this.gamesButtons.length; i++) {
      this.gamesButtons[i].position.set(width * 0.5, height * 0.45 + 125 * i);
    }

    this.loadButton.position.set(
      width * 0.5,
      height * 0.45 + 125 * this.gamesButtons.length + 25,
    );
    this.saveButton.position.set(
      width * 0.5,
      height * 0.45 + 125 * this.gamesButtons.length + 125,
    );
  }

  /** Show screen with animations */
  public async show() {
    this.alpha = 0;
    await animate(this, { alpha: 1 } as ObjectTarget<this>, {
      duration: 0.5,
      ease: "easeIn",
    });
  }

  /** Hide screen with animations */
  public async hide() {
    await animate(this, { alpha: 0 } as ObjectTarget<this>, {
      duration: 0.5,
      ease: "easeIn",
    });
  }

  private loadFile() {
    const input = document.createElement("input");
    input.type = "file";
    input.addEventListener(
      "change",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      function (_e) {
        if (!input || !input.files) return;
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = function (evt) {
          const content = JSON.parse(evt?.target?.result as string);

          for (const key in content) {
            const game = gameMgr().game(key);
            game?.loadJson(content[key]);
            game?.save();
          }
        };
        reader.readAsText(file);
      },
      false,
    );
    input.click();
  }

  private saveFile() {
    const content: Record<string, unknown> = {};
    for (const game of gameMgr().games) {
      content[game.name] = game.saveJson();
    }

    const a = document.createElement("a");
    const file = new Blob([JSON.stringify(content)], { type: "text/plain" });
    a.href = URL.createObjectURL(file);
    a.download = "BeSmartGames.json";
    a.click();
  }
}
