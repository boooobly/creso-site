'use client';

import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { BRAND } from '@/lib/constants';

const POSITION: [number, number] = [44.6221, 41.9449];

export default function MapLeafletInner() {
  return (
    <MapContainer center={POSITION} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      <Marker position={POSITION}>
        <Popup>
          {BRAND.name}<br />{BRAND.address}
        </Popup>
      </Marker>
    </MapContainer>
  );
}
