import { DirectionsGame } from "./directions/DirectionsGame";
import { Game } from "./Game";

export class GameManager {
  private games: Game[] = [new DirectionsGame()];

  constructor() {
    this.initGames();
  }

  private initGames() {
    for (const game of this.games) {
      game.load();
      game.setup();
    }
  }

  // TODO: load/save to json file

  public game(name: string): Game | null {
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
