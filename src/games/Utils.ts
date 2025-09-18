export enum Direction {
  Right = 1,
  Down,
  Left,
  Up,
}

export function getRotation(direction: Direction) {
  switch (direction) {
    case Direction.Right:
      return 0;
    case Direction.Down:
      return Math.PI * 0.5;
    case Direction.Left:
      return Math.PI;
    case Direction.Up:
      return Math.PI * 1.5;
  }
}
