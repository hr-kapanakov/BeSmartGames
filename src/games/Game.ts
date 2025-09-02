/* eslint-disable @typescript-eslint/no-unused-vars */
import { Container } from "pixi.js";

export class Level {
  public index = 0;
  public unlocked = false;

  constructor(init?: Partial<Level>) {
    Object.assign(this, init);
  }
}

export interface IGame {
  levels: Level[];
  get name(): string;
  setup(): void;
  load(): void;
  save(): void;
  init(container: Container, levelIndex: number): void;
  resize(_width: number, _height: number): void;
}

export class Game<L extends Level> implements IGame {
  /** Screen container */
  protected container!: Container;

  public levels: L[] = [];
  public currentLevel!: L;

  public get name(): string {
    return this.constructor.name.replace("Game", "");
  }

  public setup() {}

  public load() {
    // TODO: load unlocked levels, points, etc.
  }

  public save() {}

  public init(container: Container, levelIndex: number) {
    this.container = container;
    this.currentLevel = this.levels[levelIndex - 1];
    this.initLevel();
  }

  public initLevel() {}

  public resize(_width: number, _height: number) {}
}
