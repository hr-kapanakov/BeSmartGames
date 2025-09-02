/* eslint-disable @typescript-eslint/no-unused-vars */
import { Container } from "pixi.js";

export class Level {
  public index = 0;
  public unlocked = false;
  public points = -1;

  constructor(init?: Partial<Level>) {
    Object.assign(this, init);
  }

  public init() {}
}

export interface IGame {
  levels: Level[];
  currLevelIdx: number;
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
  public currLevelIdx = -1;

  public get name() {
    return this.constructor.name.replace("Game", "");
  }

  public get currentLevel() {
    return this.levels[this.currLevelIdx];
  }

  public setup() {}

  public load() {
    // TODO: load unlocked levels, points, etc.
  }

  public save() {}

  public init(container: Container, levelIndex: number) {
    this.container = container;
    this.currLevelIdx = levelIndex;
    this.currentLevel.unlocked = true;
    this.currentLevel.init();
    this.initLevel();
  }

  public initLevel() {}

  public resize(_width: number, _height: number) {}
}
