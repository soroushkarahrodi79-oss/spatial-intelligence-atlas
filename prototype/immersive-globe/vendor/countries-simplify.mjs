import fs from 'fs';
// One-time dev-time asset generator (NOT shipped/loaded at runtime).
// Douglas-Peucker simplify + 3-decimal rounding of Natural Earth 110m countries,
// preserving all 177 country features (so country outlines remain) while cutting
// vertex count to reduce three-globe tessellation cost.
const SRC = 'C:/workspace/spatial-intelligence-atlas/prototype/immersive-globe/vendor/countries-110m.geojson';
const OUT = 'C:/workspace/spatial-intelligence-atlas/prototype/immersive-globe/vendor/countries-110m.min.geojson';
const TOL = Number(process.argv[2] || 0.6); // degrees

function perp(p, a, b) {
  const [x, y] = p, [x1, y1] = a, [x2, y2] = b;
  const dx = x2 - x1, dy = y2 - y1;
  const L2 = dx * dx + dy * dy;
  if (L2 === 0) return Math.hypot(x - x1, y - y1);
  let t = ((x - x1) * dx + (y - y1) * dy) / L2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}
function dp(pts, tol) {
  if (pts.length < 3) return pts;
  let idx = 0, dmax = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const d = perp(pts[i], pts[0], pts[pts.length - 1]);
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax > tol) {
    const left = dp(pts.slice(0, idx + 1), tol);
    const right = dp(pts.slice(idx), tol);
    return left.slice(0, -1).concat(right);
  }
  return [pts[0], pts[pts.length - 1]];
}
const round = c => [Math.round(c[0] * 1000) / 1000, Math.round(c[1] * 1000) / 1000];
function ring(r) {
  const closed = r.length > 1 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1];
  let s = dp(r, TOL).map(round);
  // dedupe consecutive
  s = s.filter((p, i) => i === 0 || p[0] !== s[i - 1][0] || p[1] !== s[i - 1][1]);
  if (closed && s.length && (s[0][0] !== s[s.length - 1][0] || s[0][1] !== s[s.length - 1][1])) s.push(s[0]);
  return s;
}
function simplifyGeom(g) {
  if (g.type === 'Polygon') {
    const rings = g.coordinates.map(ring).filter(r => r.length >= 4);
    return rings.length ? { type: 'Polygon', coordinates: rings } : null;
  }
  if (g.type === 'MultiPolygon') {
    const polys = g.coordinates.map(poly => poly.map(ring).filter(r => r.length >= 4)).filter(p => p.length);
    return polys.length ? { type: 'MultiPolygon', coordinates: polys } : null;
  }
  return g;
}
function countVerts(fc) {
  let n = 0;
  fc.features.forEach(f => {
    const g = f.geometry; if (!g) return;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    polys.forEach(poly => poly.forEach(r => n += r.length));
  });
  return n;
}
const src = JSON.parse(fs.readFileSync(SRC, 'utf8'));
const before = countVerts(src);
const features = [];
src.features.forEach(f => {
  const g = simplifyGeom(f.geometry);
  if (g) features.push({ type: 'Feature', properties: { ADMIN: f.properties.ADMIN || f.properties.NAME || '' }, geometry: g });
});
const out = { type: 'FeatureCollection', features };
fs.writeFileSync(OUT, JSON.stringify(out));
const after = countVerts(out);
console.log(`tolerance=${TOL}`);
console.log(`features: ${src.features.length} -> ${features.length}`);
console.log(`vertices: ${before} -> ${after} (${(100 * after / before).toFixed(1)}%)`);
console.log(`bytes: ${fs.statSync(SRC).size} -> ${fs.statSync(OUT).size}`);
