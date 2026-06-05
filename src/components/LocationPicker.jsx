import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const userIcon = L.divIcon({
  className: '',
  html: `<div style="background:#2563eb;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:13px;font-weight:bold;">You</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const providerIcon = L.divIcon({
  className: '',
  html: `<div style="background:#dc2626;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);font-size:10px;font-weight:bold;">Pro</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const API_BASE = 'http://127.0.0.1:8000';
const distCache = new Map();

async function roadDistanceKm(lat1, lng1, lat2, lng2) {
  const key = `${lat1.toFixed(5)},${lng1.toFixed(5)}-${lat2.toFixed(5)},${lng2.toFixed(5)}`;
  if (distCache.has(key)) return distCache.get(key);
  try {
    const url = `${API_BASE}/services/distance?lat1=${lat1}&lng1=${lng1}&lat2=${lat2}&lng2=${lng2}`;
    const res = await fetch(url);
    const data = await res.json();
    const result = { km: data.km, method: data.method };
    distCache.set(key, result);
    return result;
  } catch {
    const fallback = { km: haversineKm(lat1, lng1, lat2, lng2), method: 'straight' };
    distCache.set(key, fallback);
    return fallback;
  }
}

function FlyTo({ lat, lng }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom() < 13 ? 13 : map.getZoom());
  }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

export default function LocationPicker({
  providerLat,
  providerLng,
  providerArea,
  showDistance = true,
  label = 'Your Location *',
  initialLat,
  initialLng,
  initialAddress,
  onLocationChange,
}) {
  const [searchQuery, setSearchQuery] = useState(initialAddress || '');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [userLat, setUserLat] = useState(initialLat || null);
  const [userLng, setUserLng] = useState(initialLng || null);
  const [userAddress, setUserAddress] = useState(initialAddress || '');
  const [searching, setSearching] = useState(false);
  const [roadDistance, setRoadDistance] = useState(null);
  const [distMethod, setDistMethod] = useState('road');
  const [distLoading, setDistLoading] = useState(false);

  const hasProvider = providerLat != null && providerLng != null;
  const defaultCenter = initialLat && initialLng ? [initialLat, initialLng]
    : hasProvider ? [providerLat, providerLng]
    : [23.8041, 90.4152];
  const defaultZoom = 12;

  useEffect(() => {
    if (!searchQuery.trim()) { setResults([]); setShowResults(false); return; }
    const timer = setTimeout(() => {
      setSearching(true);
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=BD`)
        .then(r => r.json())
        .then(data => { setResults(data); setShowResults(true); })
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (r) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    setUserLat(lat);
    setUserLng(lng);
    setUserAddress(r.display_name);
    setSearchQuery(r.display_name);
    setShowResults(false);
    onLocationChange?.(lat, lng, r.display_name);
  };

  const handleMapClick = async (latlng) => {
    setUserLat(latlng.lat);
    setUserLng(latlng.lng);
    setSearchQuery('Searching...');
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
      );
      const data = await res.json();
      const addr = data.display_name || `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;
      setUserAddress(addr);
      setSearchQuery(addr);
      onLocationChange?.(latlng.lat, latlng.lng, addr);
    } catch {
      setSearchQuery(`${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`);
      setUserAddress('');
      onLocationChange?.(latlng.lat, latlng.lng, '');
    }
  };

  useEffect(() => {
    if (userLat != null && hasProvider) {
      setDistLoading(true);
      roadDistanceKm(userLat, userLng, providerLat, providerLng).then(result => {
        setRoadDistance(result.km);
        setDistMethod(result.method);
        setDistLoading(false);
      });
    } else {
      setRoadDistance(null);
    }
  }, [userLat, userLng, providerLat, providerLng, hasProvider]);

  const polylinePositions = userLat != null && hasProvider
    ? [[userLat, userLng], [providerLat, providerLng]]
    : [];

  return (
    <div style={{ marginBottom: 16 }}>
      <label className="form-label">{label}</label>
      <div style={{ position: 'relative', marginTop: 6, marginBottom: 8 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search your address..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onFocus={() => results.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
        />
        {searching && <span style={{ position: 'absolute', right: 12, top: 12, fontSize: 12, color: '#888' }}>Searching...</span>}
        {showResults && results.length > 0 && (
          <ul style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
            background: '#fff', border: '1px solid #ddd', borderRadius: 8,
            listStyle: 'none', margin: '4px 0 0', padding: 0, maxHeight: 200, overflowY: 'auto',
            boxShadow: '0 4px 12px rgba(0,0,0,.1)',
          }}>
            {results.map((r, i) => (
              <li key={i} onMouseDown={() => handleSelectResult(r)}
                style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f0f0f0' }}>
                {r.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {roadDistance != null && (
        <div style={{
          background: distMethod === 'road' ? '#f0f9ff' : '#fef3c7',
          border: distMethod === 'road' ? '1px solid #bae6fd' : '1px solid #fde68a',
          borderRadius: 8,
          padding: '8px 12px', marginBottom: 8, fontSize: 14, display: 'flex',
          justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span>
            {distMethod === 'road' ? '🛣️ ' : '📏 '}
            Distance: <strong>{roadDistance < 1 ? `${(roadDistance * 1000).toFixed(0)} m` : `${roadDistance.toFixed(2)} km`}</strong>
            {distMethod === 'straight' && <span style={{ fontSize: 11, color: '#92400e', marginLeft: 6 }}>(straight line — road unavailable)</span>}
          </span>
          {providerArea && <span style={{ color: '#666', fontSize: 12 }}>({providerArea})</span>}
        </div>
      )}
      {distLoading && (
        <div style={{
          background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8,
          padding: '8px 12px', marginBottom: 8, fontSize: 13, color: '#666',
        }}>
          ⏳ Calculating road distance…
        </div>
      )}

      {!hasProvider && showDistance && (
        <div style={{
          background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8,
          padding: '8px 12px', marginBottom: 8, fontSize: 13, color: '#92400e',
        }}>
          Provider location not available — distance cannot be shown.
        </div>
      )}

      <div style={{ height: 350, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
        <MapContainer center={defaultCenter} zoom={defaultZoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {hasProvider && (
            <Marker position={[providerLat, providerLng]} icon={providerIcon}>
            </Marker>
          )}
          {userLat != null && userLng != null && (
            <>
              <Marker position={[userLat, userLng]} icon={userIcon} />
              <FlyTo lat={userLat} lng={userLng} />
            </>
          )}
          {polylinePositions.length === 2 && (
            <Polyline positions={polylinePositions} color="#2563eb" weight={2} dashArray="6 4" />
          )}
          <ClickHandler onMapClick={handleMapClick} />
        </MapContainer>
      </div>
      <p style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Click on the map or search above to set your location</p>
    </div>
  );
}
