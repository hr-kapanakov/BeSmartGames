import { Color, GetPixelsOutput, Point, Texture } from "pixi.js";
import { Level } from "../Game";
import { engine } from "../../app/getEngine";

export enum TileType {
  None = 0,
  X,
  Y,
  RightToUp,
  RightToDown,
  LeftToUp,
  LeftToDown,
  CrossUp,
  CrossDown,
  CrossRight,
  CrossLeft,
  Cross,
}

export class DirectionsLevel extends Level {
  public tiles: (TileType | null)[][] = [];
  public startTile!: Point;
  public finishTile!: Point;

  constructor(init?: Partial<Level>) {
    super(init);

    if (this.index != 1) return; // TODO: remove

    const data = engine().renderer.extract.pixels(
      Texture.from(`level${this.index}.png`),
    );
    for (let y = 0; y < data.height; y++) {
      const row: (TileType | null)[] = [];
      for (let x = 0; x < data.width; x++) {
        const color = this.getColor(data, x, y);
        if (color.toHexa() == "#ff0000ff") this.startTile = new Point(x, y);
        if (color.toHexa() == "#00ff00ff") this.finishTile = new Point(x, y);

        if (this.getColor(data, x, y).toHexa() != "#ffffffff")
          row.push(this.getTileType(data, x, y) || null);
        else row.push(null);
      }
      this.tiles.push(row);
    }
  }

  private getTileType(data: GetPixelsOutput, x: number, y: number) {
    const left = this.getColor(data, x - 1, y).toHexa() != "#ffffffff";
    const right = this.getColor(data, x + 1, y).toHexa() != "#ffffffff";
    const up = this.getColor(data, x, y - 1).toHexa() != "#ffffffff";
    const down = this.getColor(data, x, y + 1).toHexa() != "#ffffffff";
    if (left && right && up && down) return TileType.Cross;
    else if (left && up && down) return TileType.CrossLeft;
    else if (right && up && down) return TileType.CrossRight;
    else if (left && right && down) return TileType.CrossDown;
    else if (left && right && up) return TileType.CrossUp;
    else if (left && down) return TileType.LeftToDown;
    else if (left && up) return TileType.LeftToUp;
    else if (right && down) return TileType.RightToDown;
    else if (right && up) return TileType.RightToUp;
    else if (up || down) return TileType.Y;
    else if (left || right) return TileType.X;
  }

  private getColor(data: GetPixelsOutput, x: number, y: number) {
    if (x < 0 || y < 0 || x >= data.width || y >= data.height)
      return new Color("white");

    const idx = (y * data.width + x) * 4;
    return new Color({
      r: data.pixels[idx + 0],
      g: data.pixels[idx + 1],
      b: data.pixels[idx + 2],
      a: data.pixels[idx + 3],
    });
  }
}
