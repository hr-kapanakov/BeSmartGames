/* eslint-disable @typescript-eslint/no-unused-vars */
import { Container } from "pixi.js";

export class Level {
  public index = 0;
  public unlocked = false;

  constructor(init?: Partial<Level>) {
    Object.assign(this, init);
  }
}

export class Game {
  /** Screen container */
  protected container!: Container;

  public levels: Level[] = [];
  public currentLevel!: Level;

  public get name(): string {
    return this.constructor.name.replace("Game", "");
  }

  public setup() {}

  public load() {
    // TODO: load unlocked levels, points, etc.
  }

  public save() {}

  public init(container: Container, idx: number) {
    this.container = container;
    this.currentLevel = this.levels[idx - 1];
  }

  public resize(_width: number, _height: number) {}
}
