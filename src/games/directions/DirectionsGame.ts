import { Container, Sprite, Texture } from "pixi.js";
import { Game } from "../Game";
import { DirectionsLevel, TileType } from "./DirectionsLavel";

export class DirectionsGame extends Game {
  /** Background */
  private background!: Sprite;
  /** Tiles */
  private tilesContainer!: Container;

  constructor() {
    super();

    for (let i = 0; i < 10; i++) {
      this.levels.push(new DirectionsLevel({ index: i + 1, unlocked: false }));
    }
    this.levels[0].unlocked = true; // unlock the first level by default
  }

  public init(container: Container, idx: number): void {
    super.init(container, idx);
    const level = this.currentLevel as DirectionsLevel;

    this.background = new Sprite({
      texture: Texture.from("background.png"),
      alpha: 0.8,
    });
    this.container.addChildAt(this.background, 0);

    this.tilesContainer = new Container();
    for (let y = 0; y < level.tiles.length; y++) {
      for (let x = 0; x < level.tiles[y].length; x++) {
        const sprite = new Sprite({
          texture: Texture.from(`tile_${TileType[level.tiles[y][x] || 0]}.png`),
          x: x * 64,
          y: y * 64,
        });
        this.tilesContainer.addChild(sprite);
      }
    }
    this.tilesContainer.addChild(
      new Sprite({
        texture: Texture.from("finish.png"),
        x: level.finishTile.x * 64 - 48,
        y: level.finishTile.y * 64 - 21,
      }),
    );
    this.container.addChild(this.tilesContainer);
  }

  public resize(width: number, height: number): void {
    this.background.setSize(width, height);

    const ratioX = this.container.width / this.tilesContainer.width;
    const ratioY = this.container.height / this.tilesContainer.height;
    this.tilesContainer.scale = Math.min(ratioX, ratioY);
    this.tilesContainer.position.set(
      (this.container.width - this.tilesContainer.width) / 2,
      (this.container.height - this.tilesContainer.height) / 2,
    );
  }
}
