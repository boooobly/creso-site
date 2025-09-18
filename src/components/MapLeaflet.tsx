'use client';
import dynamic from 'next/dynamic';
import { BRAND } from '@/lib/constants';

const Map = dynamic(async () => (await import('react-leaflet')).MapContainer, { ssr: false });
const TileLayer = dynamic(async () => (await import('react-leaflet')).TileLayer, { ssr: false });
const Marker = dynamic(async () => (await import('react-leaflet')).Marker, { ssr: false });
const Popup = dynamic(async () => (await import('react-leaflet')).Popup, { ssr: false });

const POSITION: [number, number] = [44.6221, 41.9449]; // Невинномысск (примерно)

export default function MapLeaflet() {
  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl ring-1 ring-black/5">
      <Map center={POSITION} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
        <Marker position={POSITION}>
          <Popup>
            {BRAND.name}<br />{BRAND.address}
          </Popup>
        </Marker>
      </Map>
    </div>
  );
}