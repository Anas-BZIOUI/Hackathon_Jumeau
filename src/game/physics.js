export function contains(rect, x, y) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

export function canStand(x, y, areas, doors, opened) {
  const blocked = doors.some(d => !opened.has(d.name) && x + 7 > d.x && x - 7 < d.x + d.width && y + 4 > d.y && y - 4 < d.y + d.height);
  if (blocked) return false;
  return [[-7,-4],[7,-4],[-7,4],[7,4]].every(([dx,dy]) => areas.some(r => contains(r,x+dx,y+dy)));
}

export function movePlayer(player, dx, dy, areas, doors, opened) {
  let { x, y } = player;
  if (canStand(x + dx, y, areas, doors, opened)) x += dx;
  if (canStand(x, y + dy, areas, doors, opened)) y += dy;
  return { x, y };
}

export function nearbyDoor(player, doors) {
  return doors.find(d => Math.hypot(player.x - Math.max(d.x, Math.min(player.x, d.x+d.width)), player.y - Math.max(d.y, Math.min(player.y, d.y+d.height))) < 38);
}
