import {
  AnimatedSprite,
  Container,
  Graphics,
  Sprite,
  Texture,
  Ticker,
} from "pixi.js";
import { Game } from "../Game";
import { DirectionsLevel, TileType } from "./DirectionsLavel";
import { Direction, getRotation } from "../Utils";
import { DirectionUI } from "./DirectionsUI";
import { engine } from "../../app/getEngine";
import { MenuPopup } from "../../app/popups/MenuPopup";
import { LevelSelectionScreen } from "../../app/screens/LevelSelectionScreen";
import { randomInt } from "../../engine/utils/random";

export class DirectionsGame extends Game<DirectionsLevel> {
  private static levelsCount = 30;
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

  public get name() {
    return "Directions";
  }

  public get lastUpdate() {
    return new Date("2025/09/20");
  }

  constructor() {
    super();

    for (let i = 0; i < DirectionsGame.levelsCount; i++) {
      this.levels.push(new DirectionsLevel({ index: i + 1, unlocked: false }));
    }
  }

  public initLevel(): void {
    this.stopGame();
    this.directions = [];
    this.points = 3;
    this.container.removeChildren();

    this.background = new Sprite({
      texture: Texture.from(`background-${randomInt(1, 5)}.jpg`),
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
    this.addBlocks();
    this.addTeleports();

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

    this.fieldContainer.scale = 1; // reset scale to take real width and height
    const ratioX = (width * 0.9) / this.fieldContainer.width; // * 0.9 - add some buffer
    const ratioY = (height * 0.9) / this.fieldContainer.height; // * 0.9 - add some buffer
    this.fieldContainer.scale = Math.min(ratioX, ratioY);
    this.fieldContainer.position.set(
      (width - this.fieldContainer.width) / 2,
      (height - this.fieldContainer.height) / 2,
    );

    this.ui.resize(width, height);
  }

  private addBlocks() {
    for (let i = 0; i < this.currentLevel.blocks.length; i++) {
      this.fieldContainer.addChild(
        new Sprite({
          texture: Texture.from("block.png"),
          x: this.currentLevel.blocks[i].x * 64,
          y: this.currentLevel.blocks[i].y * 64,
          anchor: 0.5,
        }),
      );
    }
  }

  private addTeleports() {
    for (const color in this.currentLevel.teleports) {
      const positions = this.currentLevel.teleports[color];
      for (const position of positions) {
        const dir = this.currentLevel.getTileDirection(position.x, position.y);
        let rotation = 0;
        const offset = { x: 0, y: 0 };
        if (dir == Direction.Up || dir == Direction.Down) {
          rotation = Math.PI / 2;
          offset.x = 10;
        } else {
          offset.y = -10;
        }

        this.fieldContainer.addChild(
          new Sprite({
            texture: Texture.from("teleport-base.png"),
            x: position.x * 64 + offset.x,
            y: position.y * 64 + offset.y,
            anchor: 0.5,
            rotation: rotation,
          }),
        );
        const tint = color.slice(0, 5) + "0000";
        this.fieldContainer.addChild(
          new Sprite({
            texture: Texture.from("teleport-cloud.png"),
            x: position.x * 64 + offset.x,
            y: position.y * 64 + offset.y,
            anchor: 0.5,
            tint: tint,
            rotation: rotation,
          }),
        );
      }
    }
  }

  private addHints() {
    // up
    const upPosition = { x: 7 * 64 - 4, y: 7 * 64 - 4 };
    this.fieldContainer.addChild(
      new Graphics().circle(upPosition.x, upPosition.y, 12).fill("3AA751"),
    );
    this.fieldContainer.addChild(
      new Sprite({
        texture: Texture.from("arrow.png"),
        x: upPosition.x,
        y: upPosition.y,
        anchor: 0.5,
        width: 22,
        height: 18,
      }),
    );

    // left
    const leftPosition = { x: 7 * 64 - 4, y: 2 * 64 + 4 };
    this.fieldContainer.addChild(
      new Graphics().circle(leftPosition.x, leftPosition.y, 12).fill("B9C021"),
    );
    this.fieldContainer.addChild(
      new Sprite({
        texture: Texture.from("arrow.png"),
        x: leftPosition.x - 1,
        y: leftPosition.y,
        anchor: 0.5,
        width: 22,
        height: 18,
        rotation: -Math.PI / 2,
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
    const rotation = getRotation(this.currentLevel.finishDirection);
    if (this.currentLevel.finishDirection == Direction.Right) x -= 24;
    else if (this.currentLevel.finishDirection == Direction.Down) y -= 24;
    else if (this.currentLevel.finishDirection == Direction.Left) x += 24;
    else if (this.currentLevel.finishDirection == Direction.Up) y += 24;

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

    engine().ticker.maxFPS = 30; // increase FPS if not started
    engine().ticker.add(this.callback);

    this.ui.update();
    engine().audio.sfx.play("directions/sounds/sfx-robot-walk.wav");
  }

  public stopGame() {
    engine().ticker.remove(this.callback);
    engine().ticker.maxFPS = 15; // decrease FPS if not started

    this.currDirIdx = -1;
    this.previousTileIdx = this.currentLevel.start;

    if (this.robotSprite) {
      this.robotSprite.rotation = getRotation(this.currentLevel.startDirection);
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
    // Right
    if (this.robotSprite.rotation == 0) deltaPos.x = 1;
    // Down
    else if (this.robotSprite.rotation == Math.PI * 0.5) deltaPos.y = 1;
    // Left
    else if (this.robotSprite.rotation == Math.PI) deltaPos.x = -1;
    // Up
    else if (this.robotSprite.rotation == Math.PI * 1.5) deltaPos.y = -1;

    this.robotSprite.x += deltaPos.x * 10;
    this.robotSprite.y += deltaPos.y * 10;

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
      if (this.currentLevel.points < 0) this.currentLevel.points = this.points;
      await engine().navigation.presentPopup(MenuPopup, [
        `Level ${this.currLevelIdx + 1}`,
        this.points,
        this.name,
      ]);
      if (this.currLevelIdx + 1 < this.levels.length)
        this.levels[this.currLevelIdx + 1].unlocked = true;
      this.save();

      setTimeout(async () => {
        await engine().navigation.dismissPopup();
        if (this.currLevelIdx + 1 < this.levels.length) {
          this.init(this.container, this.currLevelIdx + 1);
          this.resize(engine().navigation.width, engine().navigation.height);
        } else {
          engine().navigation.showScreen(LevelSelectionScreen, this.name);
        }
      }, 1000);
    }

    // block
    if (this.isBlockTile()) {
      this.robotSprite.rotation += Math.PI;
      if (this.robotSprite.rotation > Math.PI)
        this.robotSprite.rotation -= 2 * Math.PI;
      engine().audio.sfx.play("directions/sounds/sfx-robot-walk.wav");
    }

    // teleport
    const teleportPos = this.getTeleportPosition(tileIdx);
    if (teleportPos && !this.getTeleportPosition(this.previousTileIdx)) {
      engine().audio.sfx.play("directions/sounds/sfx-robot-teleport.wav");
      this.robotSprite.x = teleportPos.x * 64;
      this.robotSprite.y = teleportPos.y * 64;
      this.robotSprite.rotation = getRotation(
        this.currentLevel.getTileDirection(teleportPos.x, teleportPos.y),
      );
    }

    const previousTile =
      this.currentLevel.tiles[this.previousTileIdx.y][this.previousTileIdx.x];
    this.previousTileIdx = tileIdx;

    // if tile type change and the new one is not straight
    if (tile != previousTile && tile != TileType.X && tile != TileType.Y) {
      // set new direction
      const newDir = this.directions[this.currDirIdx];
      if (newDir) {
        this.robotSprite.rotation = getRotation(newDir);
        this.currDirIdx++;
        this.ui.update();
        engine().audio.sfx.play("directions/sounds/sfx-robot-walk.wav");
      }
      // TODO: bug - if forward, but no set direction
    }
  }

  private isBlockTile() {
    return this.currentLevel.blocks.some(
      (b) =>
        b.x == Math.round(this.robotSprite.x / 64) &&
        b.y == Math.round(this.robotSprite.y / 64),
    );
  }

  private getTeleportPosition(tileIdx: { x: number; y: number }) {
    const res = Object.values(this.currentLevel.teleports).find((ps) =>
      ps.some((p) => p.x == tileIdx.x && p.y == tileIdx.y),
    );
    if (res) {
      // if we are at first position - teleport to the second one
      if (res[0].x == tileIdx.x && res[0].y == tileIdx.y) return res[1];
      // else teleport to the first one
      return res[0];
    }
    return null;
  }
}
