import {
  AnimatedSprite,
  Container,
  Graphics,
  Sprite,
  Text,
  Texture,
  Ticker,
} from "pixi.js";
import { Game } from "../Game";
import { DirectionsLevel, TileType } from "./DirectionsLavel";
import { Direction } from "../Utils";
import { DirectionUI } from "./DirectionsUI";
import { engine } from "../../app/getEngine";
import { MenuPopup } from "../../app/popups/MenuPopup";

export class DirectionsGame extends Game<DirectionsLevel> {
  private static walkFramesCount = 8;
  /** Background */
  private background!: Sprite;
  /** Tiles */
  private fieldContainer!: Container;
  private robotSprite!: AnimatedSprite;

  private ui!: DirectionUI;

  public directions: Direction[] = [];
  public currDirIdx = -1;
  public points = -1;

  private previousTileIdx = { x: -1, y: -1 };

  constructor() {
    super();

    for (let i = 0; i < 10; i++) {
      this.levels.push(new DirectionsLevel({ index: i + 1, unlocked: false }));
    }
    this.levels[0].unlocked = true; // unlock the first level by default
  }

  public initLevel(): void {
    this.stopGame();
    this.directions = [];
    this.points = 3;
    this.container.removeChildren();

    this.background = new Sprite({
      texture: Texture.from("background.png"),
      alpha: 0.8,
    });
    this.container.addChildAt(this.background, 0);

    // Field
    this.fieldContainer = new Container();
    for (let y = 0; y < this.currentLevel.tiles.length; y++) {
      for (let x = 0; x < this.currentLevel.tiles[y].length; x++) {
        const sprite = new Sprite({
          texture: Texture.from(
            `tile_${TileType[this.currentLevel.tiles[y][x]]}.png`,
          ),
          x: x * 64,
          y: y * 64,
          anchor: 0.5,
        });
        this.fieldContainer.addChild(sprite);
      }
    }

    if (this.currLevelIdx == 0) this.addHints();

    this.addRobot();
    // finish after robot
    this.addFinishSprite();

    this.container.addChild(this.fieldContainer);

    // UI
    this.ui = new DirectionUI(this, this.container);
  }

  public resize(width: number, height: number): void {
    this.background.setSize(width, height);

    const ratioX = this.container.width / this.fieldContainer.width;
    const ratioY = this.container.height / this.fieldContainer.height;
    this.fieldContainer.scale = Math.min(ratioX, ratioY);
    this.fieldContainer.position.set(
      (this.container.width - this.fieldContainer.width) / 2,
      (this.container.height - this.fieldContainer.height) / 2,
    );

    this.ui.resize(width, height);
  }

  private addHints() {
    // up
    const upPosition = { x: 7 * 64 - 4, y: 7 * 64 - 4 };
    this.fieldContainer.addChild(
      new Graphics().circle(upPosition.x, upPosition.y, 12).fill("3AA751"),
    );
    this.fieldContainer.addChild(
      new Text({
        text: "⇧",
        x: upPosition.x,
        y: upPosition.y,
        anchor: 0.5,
        style: { fill: "white", fontWeight: "bold", fontSize: 18 },
      }),
    );

    // left
    const leftPosition = { x: 7 * 64 - 4, y: 2 * 64 + 4 };
    this.fieldContainer.addChild(
      new Graphics().circle(leftPosition.x, leftPosition.y, 12).fill("B9C021"),
    );
    this.fieldContainer.addChild(
      new Text({
        text: "⇦",
        x: leftPosition.x,
        y: leftPosition.y - 1,
        anchor: 0.5,
        style: { fill: "white", fontWeight: "bold", fontSize: 18 },
      }),
    );
  }

  private addRobot() {
    this.robotSprite = new AnimatedSprite({
      textures: new Array(DirectionsGame.walkFramesCount)
        .fill(null)
        .map((_, i) => Texture.from(`robot_walk_${i}.png`)),
      anchor: 0.5,
      cursor: "pointer",
    });
    this.fieldContainer.addChild(this.robotSprite);

    this.robotSprite.interactive = true;
    this.robotSprite.on("pointerdown", () => this.startGame());
    this.stopGame();
  }

  private addFinishSprite() {
    let x = this.currentLevel.finish.x * 64;
    let y = this.currentLevel.finish.y * 64;
    let rotation = 0;
    if (this.currentLevel.finishDirection == Direction.Up) {
      rotation = -Math.PI / 2;
      y += 24;
    } else if (this.currentLevel.finishDirection == Direction.Right) {
      x -= 24;
    } else if (this.currentLevel.finishDirection == Direction.Down) {
      rotation = Math.PI / 2;
      y -= 24;
    } else if (this.currentLevel.finishDirection == Direction.Left) {
      rotation = Math.PI;
      x += 24;
    }

    this.fieldContainer.addChild(
      new Sprite({
        texture: Texture.from("finish.png"),
        x: x,
        y: y,
        anchor: 0.5,
        rotation: rotation,
      }),
    );
  }

  private callback = (t: Ticker) => this.update(t);
  public startGame() {
    if (this.currDirIdx >= 0) {
      this.stopGame();
      engine().audio.sfx.play("directions/sounds/sfx-robot-reset.mp3");
      return; //cannot start multiple times
    }
    this.currDirIdx = 0;
    engine().ticker.add(this.callback);
    this.ui.update();
    engine().audio.sfx.play("directions/sounds/sfx-robot-walk.wav");
  }

  public stopGame() {
    engine().ticker.remove(this.callback);
    this.currDirIdx = -1;
    this.previousTileIdx = this.currentLevel.start;

    if (this.robotSprite) {
      if (this.currentLevel.startDirection == Direction.Up) {
        this.robotSprite.rotation = -Math.PI / 2;
      } else if (this.currentLevel.startDirection == Direction.Right) {
        this.robotSprite.rotation = 0;
      } else if (this.currentLevel.startDirection == Direction.Down) {
        this.robotSprite.rotation = Math.PI / 2;
      } else if (this.currentLevel.startDirection == Direction.Left) {
        this.robotSprite.rotation = Math.PI;
      }
      this.robotSprite.position.set(
        this.currentLevel.start.x * 64,
        this.currentLevel.start.y * 64,
      );
      this.robotSprite.currentFrame = 0;
      this.robotSprite.scale = 1;
    }
  }

  private updateDelta = 0;
  private async update(ticker: Ticker) {
    if (this.currDirIdx < 0) return;

    this.updateDelta += ticker.deltaTime;
    if (this.updateDelta < 5) return;
    this.updateDelta = 0;

    // walk cycle
    this.robotSprite.currentFrame =
      (this.robotSprite.currentFrame + 1) % DirectionsGame.walkFramesCount;

    // robot movement
    const deltaPos = { x: 0, y: 0 };
    if (this.robotSprite.rotation == -Math.PI / 2) {
      // Up
      deltaPos.y = -1;
    } else if (this.robotSprite.rotation == 0)
      // Right
      deltaPos.x = 1;
    else if (this.robotSprite.rotation == Math.PI / 2) {
      // Down
      deltaPos.y = 1;
    } else if (this.robotSprite.rotation == Math.PI) {
      // Left
      deltaPos.x = -1;
    }
    this.robotSprite.position.x += deltaPos.x * 10;
    this.robotSprite.position.y += deltaPos.y * 10;

    // current tile
    const tileIdx = {
      x: Math.round((this.robotSprite.x - deltaPos.x * 32) / 64),
      y: Math.round((this.robotSprite.y - deltaPos.y * 27) / 64),
    };
    const tile = this.currentLevel.tiles[tileIdx.y][tileIdx.x];

    // robot fall
    if (tile == TileType.None) {
      this.robotSprite.scale = this.robotSprite.scale.x - 0.15;
      if (this.robotSprite.scale.x < 0.1) {
        this.stopGame();
        this.points = Math.max(0, this.points - 1);
        this.ui.update();
      }
    }

    // finish
    if (
      this.previousTileIdx.x == this.currentLevel.finish.x &&
      this.previousTileIdx.y == this.currentLevel.finish.y
    ) {
      engine().audio.sfx.play("directions/sounds/sfx-success.wav");

      this.stopGame();
      this.currentLevel.points = this.points;
      await engine().navigation.presentPopup(MenuPopup, [
        `Level ${this.currLevelIdx + 1}`,
        this.currentLevel.points,
        this.name,
      ]);
      this.levels[this.currLevelIdx + 1].unlocked = true;
      this.save();

      setTimeout(async () => {
        await engine().navigation.dismissPopup();
        this.init(this.container, this.currLevelIdx + 1);
        this.resize(engine().navigation.width, engine().navigation.height);
      }, 1000);
    }

    const previousTile =
      this.currentLevel.tiles[this.previousTileIdx.y][this.previousTileIdx.x];
    this.previousTileIdx = tileIdx;

    // if tile type change and the new one is not straight
    if (tile != previousTile && tile != TileType.X && tile != TileType.Y) {
      // set new direction
      const newDir = this.directions[this.currDirIdx];
      if (newDir) {
        if (newDir == Direction.Up) {
          this.robotSprite.rotation = -Math.PI / 2;
        } else if (newDir == Direction.Right) {
          this.robotSprite.rotation = 0;
        } else if (newDir == Direction.Down) {
          this.robotSprite.rotation = Math.PI / 2;
        } else if (newDir == Direction.Left) {
          this.robotSprite.rotation = Math.PI;
        }
        this.currDirIdx++;
        this.ui.update();
        engine().audio.sfx.play("directions/sounds/sfx-robot-walk.wav");
      }
      // TODO: bug - if forward, but no set direction
    }
  }
}
