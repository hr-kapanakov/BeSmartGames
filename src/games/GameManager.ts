import { DirectionsGame } from "./directions/DirectionsGame";
import { IGame } from "./Game";

export class GameManager {
  public games: IGame[] = [new DirectionsGame()];

  public get gameNames() {
    return this.games.map((g) => g.name);
  }

  constructor() {
    this.initGames();
  }

  private initGames() {
    for (const game of this.games) {
      game.load();
      game.setup();
    }
  }

  public game(name: string): IGame | null {
    return this.games.find((g) => g.name == name) || null;
  }
}

let instance: GameManager | null = null;

export function gameMgr(): GameManager {
  if (instance == null) {
    instance = new GameManager();
  }
  return instance;
}
