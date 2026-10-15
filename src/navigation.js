
import { navigationGraph } from "./navigationGraph.js";

/**
 * Dijkstra avec prise en charge
 * de plusieurs portes par salle.
 */
export function calculateIndoorRoute(startId, endId) {
  const { nodes, edges, roomAccess } = navigationGraph;

  const byId = new Map(nodes.map((node) => [node.id, node]));

  const starts = [roomAccess[startId]]
    .flat()
    .filter((id) => id && byId.has(id));

  const ends = [roomAccess[endId]]
    .flat()
    .filter((id) => id && byId.has(id));

  if (!starts.length || !ends.length) return null;

  const adjacency = new Map(
    nodes.map((node) => [node.id, []])
  );

  for (const [a, b] of edges) {
    const na = byId.get(a);
    const nb = byId.get(b);

    if (!na || !nb) continue;
    if (na.level !== nb.level) continue;

    const distance = Math.hypot(
      na.x - nb.x,
      na.y - nb.y
    );

    adjacency.get(a).push({ id: b, distance });
    adjacency.get(b).push({ id: a, distance });
  }

  const distances = new Map(
    starts.map((id) => [id, 0])
  );

  const previous = new Map();
  const visited = new Set();
  const endSet = new Set(ends);

  let endNode = null;

  while (true) {
    let current = null;
    let best = Infinity;

    for (const [id, distance] of distances) {
      if (!visited.has(id) && distance < best) {
        current = id;
        best = distance;
      }
    }

    if (current === null) break;

    if (endSet.has(current)) {
      endNode = current;
      break;
    }

    visited.add(current);

    for (const neighbor of adjacency.get(current) || []) {
      if (visited.has(neighbor.id)) continue;

      const distance = best + neighbor.distance;

      if (
        distance <
        (distances.get(neighbor.id) ?? Infinity)
      ) {
        distances.set(neighbor.id, distance);
        previous.set(neighbor.id, current);
      }
    }
  }

  if (endNode === null) return null;

  const ids = [];
  let current = endNode;

  while (current !== undefined) {
    ids.unshift(current);
    current = previous.get(current);
  }

  if (!starts.includes(ids[0])) return null;

  const metres = Math.round(distances.get(endNode));

  return {
    ids,
    nodes: ids.map((id) => byId.get(id)),
    startDoor: ids[0],
    endDoor: endNode,
    metres,
    minutes: Math.max(1, Math.ceil(metres / 75)),
    provisional: true
  };
}

/**
 * Convertit le trajet en segments SVG
 * pour l'étage affiché.
 */
export function indoorFloorSegments(route, level, floorHeight) {
  if (!route?.nodes?.length) return [];

  const segments = [];
  let current = [];

  for (const node of route.nodes) {
    if (node.level !== level) {
      if (current.length >= 2) {
        segments.push(current);
      }
      current = [];
      continue;
    }

    current.push({
      x: node.x,
      y: floorHeight - node.y
    });
  }

  if (current.length >= 2) {
    segments.push(current);
  }

  return segments;
}
