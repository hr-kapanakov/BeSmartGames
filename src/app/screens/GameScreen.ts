import { Container } from "pixi.js";
import { gameMgr } from "../../games/GameManager";
import { IGame } from "../../games/Game";
import { engine } from "../getEngine";

/** Game screen */
export class GameScreen extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = ["menu"];

  private game!: IGame | null;

  constructor() {
    super();
  }

  public init(params: never[]) {
    this.game = gameMgr().game(params[0]);
    this.game?.init(this, params[1]);
  }

  /** Resize the screen, fired whenever window size changes  */
  public resize(width: number, height: number) {
    this.game?.resize(width, height);
  }

  /** Show screen with animations */
  public async show() {
    engine().audio.bgm.play("menu/sounds/bgm-main.mp3", { volume: 0.5 });
    this.alpha = 1;
  }

  /** Hide screen with animations */
  public async hide() {
    this.alpha = 0;
  }
}
