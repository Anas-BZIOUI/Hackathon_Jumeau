const map = L.map('carte', { crs: L.CRS.Simple, minZoom: -2, maxZoom: 4 });
const bornes = [[0, 0], [130, 120]];
L.imageOverlay('plan_R+2.png', bornes).addTo(map);

fetch('pieces_R+2.geojson').then(r => r.json()).then(g =>
  L.geoJSON(g, {
    style: f => {
      const kind = f.properties.kind;
      if (kind === 'batiment') return { color: '#333', weight: 2, fillOpacity: 0 };
      if (kind === 'zone') return { color: '#2a7de1', weight: 1.5, fillOpacity: 0.08 };
      return { weight: 1, fillOpacity: f.properties.fiable ? 0.3 : 0.05 };
    },
    pointToLayer: (f, latlng) => L.circleMarker(latlng, {
      radius: 4,
      color: '#c0392b',
      weight: 1,
      fillColor: f.properties.fiable ? '#27ae60' : '#e67e22',
      fillOpacity: f.properties.fiable ? 0.7 : 0.35
    }),
    onEachFeature: (f, l) => {
      const p = f.properties;
      let html;
      if (p.kind === 'salle') {
        html = `<b>${p.numero ?? ''} ${p.libelle ?? ''}</b><br>` +
               `Type: ${p.type_piece ?? ''}<br>` +
               `Surface: ${p.surface ?? '?'} m²<br>` +
               `Fiable: ${p.fiable ? 'oui' : 'non'}`;
      } else {
        html = `<b>${p.nom}</b> (${p.kind})<br>Surface: ${p.surface ?? '?'} m²`;
      }
      l.bindPopup(html);
    }
  }).addTo(map));

map.fitBounds(bornes);
