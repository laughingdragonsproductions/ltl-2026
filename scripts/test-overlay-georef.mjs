/**
 * Quick smoke test for overlay georef math (run: node scripts/test-overlay-georef.mjs)
 */
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

// Inline minimal copies — overlay-georef imports georef.json
const georefData = JSON.parse(readFileSync("data/georef.json", "utf8"));

function boundsToCoordinates(b) {
  return [
    [b.west, b.north],
    [b.east, b.north],
    [b.east, b.south],
    [b.west, b.south],
  ];
}

function getCoordinatesCenter(coords) {
  const lng = coords.reduce((s, [x]) => s + x, 0) / 4;
  const lat = coords.reduce((s, [, y]) => s + y, 0) / 4;
  return [lng, lat];
}

function translateCoordinates(coords, dLng, dLat) {
  return coords.map(([lng, lat]) => [lng + dLng, lat + dLat]);
}

function scaleCoordinates(coords, factor) {
  const lngs = coords.map(([x]) => x);
  const lats = coords.map(([, y]) => y);
  const cLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const cLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  return coords.map(([lng, lat]) => [
    cLng + (lng - cLng) * factor,
    cLat + (lat - cLat) * factor,
  ]);
}

function rotateCoordinatesAroundCenter(coords, deltaDeg, center) {
  const [cLng, cLat] = center ?? getCoordinatesCenter(coords);
  const rad = (deltaDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return coords.map(([lng, lat]) => {
    const dx = lng - cLng;
    const dy = lat - cLat;
    return [cLng + dx * cos - dy * sin, cLat + dx * sin + dy * cos];
  });
}

function pointInQuad(lng, lat, coords) {
  let inside = false;
  for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
    const [xi, yi] = coords[i];
    const [xj, yj] = coords[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi + Number.EPSILON) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

let failed = 0;
function assert(name, cond) {
  if (!cond) {
    console.error("FAIL:", name);
    failed++;
  } else {
    console.log("OK:", name);
  }
}

let c = boundsToCoordinates(georefData.bounds);
const orig = JSON.stringify(c);

c = translateCoordinates(c, 0.001, -0.0005);
assert("translate moves coords", JSON.stringify(c) !== orig);

c = scaleCoordinates(c, 1.1);
const beforeRot = JSON.stringify(c);
c = rotateCoordinatesAroundCenter(c, 90);
assert("rotate changes coords", JSON.stringify(c) !== beforeRot);

const center = getCoordinatesCenter(c);
assert("center inside rotated quad", pointInQuad(center[0], center[1], c));

assert("rotate 360 returns ~same", (() => {
  const base = boundsToCoordinates(georefData.bounds);
  const r360 = rotateCoordinatesAroundCenter(base, 360);
  return Math.abs(r360[0][0] - base[0][0]) < 1e-10;
})());

console.log(failed ? `\n${failed} test(s) failed` : "\nAll overlay georef tests passed");
process.exit(failed ? 1 : 0);
