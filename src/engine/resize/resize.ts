export function resize(
  w: number, // window.innerWidth
  h: number, // window.innerHeight
  minWidth: number, // game's ideal width
  minHeight: number, // game's ideal height
  letterbox: boolean, // if true, maintains aspect ratio; if false, fills
) {
  let scale = 1;
  const idealAspect = minWidth / minHeight;
  const windowAspect = w / h;

  if (letterbox) {
    // Letterbox mode:
    // Scale to fit the window while maintaining the game's aspect ratio.
    // This will create black bars on the sides if the window's aspect ratio
    // is different from the game's.
    if (windowAspect < idealAspect) {
      // Window is taller than the game, scale based on width
      scale = minWidth / w;
    } else {
      // Window is wider than the game, scale based on height
      scale = minHeight / h;
    }
  } else {
    // Fill mode:
    // Scale to fill the entire window. This will crop the game content
    // if the aspect ratios don't match.
    if (windowAspect < idealAspect) {
      // Window is taller, scale based on height
      scale = minHeight / h;
    } else {
      // Window is wider, scale based on width
      scale = minWidth / w;
    }
  }

  const width = Math.floor(w * scale);
  const height = Math.floor(h * scale);

  return { width, height };
}
