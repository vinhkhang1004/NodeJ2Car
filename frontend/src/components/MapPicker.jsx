import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';

// Fix default marker icon path issue with Vite/webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition, onAddressFound }) => {
    const [geocoding, setGeocoding] = useState(false);

    useMapEvents({
        click: async (e) => {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            
            // Reverse geocode using Nominatim (free/open-source)
            try {
                setGeocoding(true);
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`
                );
                const data = await res.json();
                if (data.address) {
                    onAddressFound({
                        address: [
                            data.address.house_number,
                            data.address.road,
                            data.address.suburb,
                            data.address.quarter
                        ].filter(Boolean).join(', '),
                        city: data.address.city || data.address.town || data.address.county || data.address.state || '',
                        country: data.address.country || 'Việt Nam',
                        lat,
                        lng,
                        displayName: data.display_name,
                    });
                }
            } catch (err) {
                console.error('Geocoding error:', err);
            } finally {
                setGeocoding(false);
            }
        },
    });

    return position ? (
        <Marker position={[position.lat, position.lng]} />
    ) : null;
};

const MapPicker = ({ onLocationSelect, defaultPosition }) => {
    const [position, setPosition] = useState(
        defaultPosition ? { lat: defaultPosition.lat, lng: defaultPosition.lng } : null
    );
    const [geocoding, setGeocoding] = useState(false);

    // Vietnam center default
    const center = position 
        ? [position.lat, position.lng] 
        : [10.8231, 106.6297]; // Ho Chi Minh City

    const handleAddressFound = (data) => {
        setGeocoding(false);
        onLocationSelect(data);
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-xl relative" style={{ height: '380px' }}>
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker 
                    position={position} 
                    setPosition={setPosition}
                    onAddressFound={handleAddressFound}
                />
            </MapContainer>

            {/* Overlay hint */}
            {!position && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] bg-black/80 backdrop-blur-sm text-white px-5 py-2.5 rounded-full text-sm font-medium shadow-2xl pointer-events-none border border-white/10">
                    📍 Nhấp vào bản đồ để chọn vị trí
                </div>
            )}

            {geocoding && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[1000] flex items-center justify-center">
                    <div className="bg-[#18181b] rounded-2xl px-6 py-4 flex items-center gap-3 shadow-2xl border border-slate-700">
                        <Loader2 className="animate-spin text-primary" size={20} />
                        <span className="text-sm font-medium">Đang tìm địa chỉ...</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapPicker;
