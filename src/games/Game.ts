/* eslint-disable @typescript-eslint/no-unused-vars */
import { Container } from "pixi.js";
import { storage } from "../engine/utils/storage";

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
  lastVisit?: Date;
  levels: Level[];
  currLevelIdx: number;
  get name(): string;
  get lastUpdate(): Date;
  setup(): void;
  load(): void;
  save(): void;
  loadJson(json: unknown): void;
  saveJson(): Record<string, unknown>;
  init(container: Container, levelIndex: number): void;
  resize(_width: number, _height: number): void;
}

export class Game<L extends Level> implements IGame {
  /** Screen container */
  protected container!: Container;

  public lastVisit?: Date;
  public levels: L[] = [];
  public currLevelIdx = -1;

  public get name() {
    return "";
  }

  public get lastUpdate() {
    return new Date();
  }

  public get currentLevel() {
    return this.levels[this.currLevelIdx];
  }

  public setup() {}

  public load() {
    const json = storage.getObject(this.name);
    if (json) this.loadJson(json as never);
  }

  public save() {
    const json = this.saveJson();
    if (json) storage.setObject(this.name, json);
  }

  public loadJson(json: never) {
    const jsonLevels = json["levels"] as Level[];
    for (let i = 0; i < jsonLevels.length; i++) {
      this.levels[i].unlocked = jsonLevels[i].unlocked;
      this.levels[i].points = jsonLevels[i].points;
    }
    this.lastVisit = new Date(json["lastVisit"] || new Date());
  }

  public saveJson(): Record<string, unknown> {
    const jsonLevels = [];
    for (const l of this.levels) {
      jsonLevels.push(
        new Level({ index: l.index, unlocked: l.unlocked, points: l.points }),
      );
    }
    return { levels: jsonLevels, lastVisit: this.lastVisit?.toISOString() };
  }

  public init(container: Container, levelIndex: number) {
    this.container = container;
    this.currLevelIdx = levelIndex;
    this.currentLevel.init();
    this.initLevel();
  }

  public initLevel() {}

  public resize(_width: number, _height: number) {}
}
