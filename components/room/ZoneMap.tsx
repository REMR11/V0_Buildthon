"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon paths broken by webpack
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FlyTo({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15);
  }, [lat, lng, map]);
  return null;
}

export default function ZoneMap({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[lat, lng]} icon={DefaultIcon} />
      <Circle
        center={[lat, lng]}
        radius={300}
        pathOptions={{ color: "#D85A30", fillColor: "#D85A30", fillOpacity: 0.15, weight: 1.5 }}
      />
      <FlyTo lat={lat} lng={lng} />
    </MapContainer>
  );
}
