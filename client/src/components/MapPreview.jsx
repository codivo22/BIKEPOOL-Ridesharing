import { MapContainer, Marker, Polyline, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

const defaultPosition = [29.9497, 76.8236];

function FitRoute({ points }) {
  const map = useMap();
  useEffect(() => { if (points.length === 2) map.fitBounds(points, { padding: [28, 28] }); }, [map, points]);
  return null;
}

export default function MapPreview({ source, destination }) {
  const points = [source, destination].filter((place) => place?.coordinates?.length === 2).map((place) => [place.coordinates[1], place.coordinates[0]]);
  const center = points[0] || defaultPosition;
  return <div className="map-preview">
    <MapContainer center={center} zoom={13} scrollWheelZoom={false} aria-label="Route map">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {points.map((point, index) => <Marker position={point} key={`${point[0]}-${index}`} />)}
      {points.length === 2 && <><Polyline positions={points} pathOptions={{ color: '#e96d45', weight: 4 }} /><FitRoute points={points} /></>}
    </MapContainer>
    {points.length < 2 && <p className="map-hint">Choose suggested locations to preview your route.</p>}
  </div>;
}
