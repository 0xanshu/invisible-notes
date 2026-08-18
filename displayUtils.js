// Multi-monitor recovery: keep note windows reachable even after a
// monitor is disconnected, or the saved position lands outside any
// currently connected display's work area.
const { screen } = require('electron');

function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x &&
    a.y < b.y + b.height && a.y + a.height > b.y;
}

// Returns { x, y, width, height, displayId } guaranteed to be at least
// partially on-screen on some connected display.
function clampToVisibleDisplay({ x, y, width, height }) {
  const w = width || 300;
  const h = height || 220;
  const displays = screen.getAllDisplays();

  if (typeof x === 'number' && typeof y === 'number') {
    const bounds = { x, y, width: w, height: h };
    const onScreen = displays.find((d) => rectsIntersect(bounds, d.workArea));
    if (onScreen) return { x, y, width: w, height: h, displayId: onScreen.id };
  }

  // Off-screen, or no saved position yet: place on the primary display's
  // work area, near the top-left with a small inset.
  const primary = screen.getPrimaryDisplay();
  const wa = primary.workArea;
  return {
    x: wa.x + 40,
    y: wa.y + 40,
    width: w,
    height: h,
    displayId: primary.id
  };
}

function displayIdForPoint(x, y) {
  return screen.getDisplayNearestPoint({ x, y }).id;
}

module.exports = { clampToVisibleDisplay, displayIdForPoint };
