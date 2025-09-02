import { AnimatedSprite, Container, Sprite, Texture } from "pixi.js";
import { Game } from "../Game";
import { DirectionsLevel, TileType } from "./DirectionsLavel";
import { Direction } from "../Utils";
import { DirectionUI } from "./DirectionsUI";

export class DirectionsGame extends Game<DirectionsLevel> {
  private static walkFramesCount = 8;
  /** Background */
  private background!: Sprite;
  /** Tiles */
  private fieldContainer!: Container;

  private ui!: DirectionUI;

  public directions: Direction[] = [];

  constructor() {
    super();

    for (let i = 0; i < 10; i++) {
      this.levels.push(new DirectionsLevel({ index: i + 1, unlocked: false }));
    }
    this.levels[0].unlocked = true; // unlock the first level by default
  }

  public initLevel(): void {
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
    this.fieldContainer.addChild(this.getFinishSprite());

    // TODO: robot
    this.fieldContainer.addChild(
      new AnimatedSprite({
        textures: new Array(DirectionsGame.walkFramesCount)
          .fill(null)
          .map((_, i) => Texture.from(`robot_walk_${i}.png`)),
        x: this.currentLevel.start.x * 64,
        y: this.currentLevel.start.y * 64,
        anchor: 0.5,
        rotation: 0,
        animationSpeed: 0.1,
        autoPlay: true,
      }),
    );
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

  private getFinishSprite() {
    const level = this.currentLevel as DirectionsLevel;
    let x = level.finish.x * 64;
    let y = level.finish.y * 64;
    let rotation = 0;
    if (level.finishDirection == Direction.Up) {
      rotation = -Math.PI / 2;
      y += 32;
    } else if (level.finishDirection == Direction.Right) {
      x -= 32;
    } else if (level.finishDirection == Direction.Down) {
      rotation = Math.PI / 2;
      y -= 32;
    } else if (level.finishDirection == Direction.Left) {
      rotation = Math.PI;
      x += 32;
    }

    return new Sprite({
      texture: Texture.from("finish.png"),
      x: x,
      y: y,
      anchor: 0.5,
      rotation: rotation,
    });
  }
}
