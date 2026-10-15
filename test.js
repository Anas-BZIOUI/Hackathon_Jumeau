const map = L.map('carte', { crs: L.CRS.Simple, minZoom: -2, maxZoom: 4 });
const bornes = [[0, 0], [60, 60]];               // [[0,0],[hauteur,largeur]] du niveau
L.imageOverlay('plan_R+1.png', bornes).addTo(map);
fetch('pieces_R+1.geojson').then(r => r.json()).then(g =>
  L.geoJSON(g, {
    style: f => ({ weight: 1, fillOpacity: f.properties.fiable ? 0.3 : 0.05 }),
    onEachFeature: (f, l) => l.bindPopup(`${f.properties.numero ?? ''} ${f.properties.libelle ?? ''}`)
  }).addTo(map));
map.fitBounds(bornes);
