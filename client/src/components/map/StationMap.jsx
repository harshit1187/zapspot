import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, List, Map as MapIcon, Filter, X } from 'lucide-react';
import { mockStations } from '../../data/mockStations';
import { getStatusColor, getStatusLabel, getDistance } from '../../utils/helpers';
import StationDetail from '../station/StationDetail';
import './MapFinder.css';

function createMarkerIcon(color, slots) {
  return L.divIcon({
    className: 'station-marker',
    html: `
      <div class="marker-pin" style="background:${color}">
        <span class="marker-slots">${slots}</span>
      </div>
    `,
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

function LocateButton({ onLocate }) {
  const map = useMap();
  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.flyTo([latitude, longitude], 14);
          onLocate([latitude, longitude]);
        },
        () => {
          map.flyTo([31.634, 74.872], 13);
        }
      );
    }
  };
  return (
    <button className="locate-btn btn btn-glass" onClick={handleLocate} id="locate-me-btn" title="Locate Me">
      <Crosshair size={18} />
    </button>
  );
}

export default function StationMap() {
  const [stations, setStations] = useState(mockStations);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showList, setShowList] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [userLocation, setUserLocation] = useState([31.634, 74.872]);
  const [filters, setFilters] = useState({
    chargerType: 'all',
    vehicleType: 'all',
    speed: 'all',
    amenities: [],
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStations(prev => prev.map(station => {
        const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
        const newAvailable = Math.max(0, Math.min(station.totalSlots, station.availableSlots + change));
        return {
          ...station,
          availableSlots: newAvailable,
          status: newAvailable === 0 ? 'full' : newAvailable <= 1 ? 'limited' : 'available'
        };
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const filteredStations = stations.filter(s => {
    if (filters.chargerType !== 'all' && !s.chargerTypes.includes(filters.chargerType)) return false;
    if (filters.vehicleType !== 'all' && !s.vehicleTypes.includes(filters.vehicleType)) return false;
    if (filters.speed !== 'all' && s.speed !== filters.speed) return false;
    return true;
  });

  return (
    <div className="map-finder" id="map-finder">
      {/* Filter Sidebar */}
      <div className={`filter-sidebar ${showFilters ? 'open' : ''}`}>
        <div className="filter-header">
          <h4>Filters</h4>
          <button className="btn btn-icon filter-close" onClick={() => setShowFilters(false)}>
            <X size={18} />
          </button>
        </div>

        <div className="filter-group">
          <label className="filter-label">Charger Type</label>
          <select
            value={filters.chargerType}
            onChange={e => setFilters(f => ({ ...f, chargerType: e.target.value }))}
            className="input-glass"
            id="filter-charger-type"
          >
            <option value="all">All Types</option>
            <option value="CCS2">CCS2</option>
            <option value="Type 2">Type 2</option>
            <option value="CHAdeMO">CHAdeMO</option>
            <option value="GB/T">GB/T</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Vehicle Type</label>
          <select
            value={filters.vehicleType}
            onChange={e => setFilters(f => ({ ...f, vehicleType: e.target.value }))}
            className="input-glass"
            id="filter-vehicle-type"
          >
            <option value="all">All Vehicles</option>
            <option value="2-wheeler">2-Wheeler</option>
            <option value="4-wheeler">4-Wheeler</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Speed</label>
          <select
            value={filters.speed}
            onChange={e => setFilters(f => ({ ...f, speed: e.target.value }))}
            className="input-glass"
            id="filter-speed"
          >
            <option value="all">Any Speed</option>
            <option value="Fast">Fast Charging</option>
            <option value="Slow">Slow Charging</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Amenities</label>
          <div className="amenity-tags">
            {['Restroom', 'Cafe', 'WiFi', 'Parking', 'Lounge', 'Kids Area'].map(a => (
              <button
                key={a}
                className={`amenity-tag ${filters.amenities.includes(a) ? 'active' : ''}`}
                onClick={() => setFilters(f => ({
                  ...f,
                  amenities: f.amenities.includes(a)
                    ? f.amenities.filter(x => x !== a)
                    : [...f.amenities, a]
                }))}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-count">
          Showing {filteredStations.length} of {stations.length} stations
        </div>
      </div>

      {/* Map Area */}
      <div className="map-area">
        <div className="map-controls">
          <button
            className={`btn btn-glass btn-sm ${!showFilters ? '' : 'active'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={15} />
            Filters
          </button>
          <button
            className={`btn btn-glass btn-sm ${showList ? 'active' : ''}`}
            onClick={() => setShowList(!showList)}
          >
            {showList ? <MapIcon size={15} /> : <List size={15} />}
            {showList ? 'Map View' : 'List View'}
          </button>
        </div>

        {!showList ? (
          <MapContainer
            center={[31.634, 74.872]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />
            <LocateButton onLocate={setUserLocation} />
            {filteredStations.map(station => (
              <Marker
                key={station._id}
                position={[station.lat, station.lng]}
                icon={createMarkerIcon(getStatusColor(station), station.availableSlots)}
                eventHandlers={{
                  click: () => setSelectedStation(station),
                }}
              >
                <Popup className="station-popup">
                  <div className="popup-content">
                    <strong>{station.name}</strong>
                    <div className="popup-meta">
                      <span className={`badge badge-${station.availableSlots === 0 ? 'danger' : station.availableSlots <= 1 ? 'warning' : 'success'}`}>
                        {station.availableSlots}/{station.totalSlots} slots
                      </span>
                      <span>{getDistance(userLocation[0], userLocation[1], station.lat, station.lng)} km</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <div className="list-view">
            {filteredStations
              .sort((a, b) =>
                parseFloat(getDistance(userLocation[0], userLocation[1], a.lat, a.lng)) -
                parseFloat(getDistance(userLocation[0], userLocation[1], b.lat, b.lng))
              )
              .map(station => (
                <div
                  key={station._id}
                  className="glass-card list-card"
                  onClick={() => setSelectedStation(station)}
                >
                  <div className="list-card-left">
                    <img src={station.image} alt={station.name} className="list-card-img" />
                  </div>
                  <div className="list-card-info">
                    <h4>{station.name}</h4>
                    <p className="text-secondary">{station.address}</p>
                    <div className="list-card-meta">
                      <span className={`badge badge-${station.availableSlots === 0 ? 'danger' : station.availableSlots <= 1 ? 'warning' : 'success'}`}>
                        {station.availableSlots}/{station.totalSlots} available
                      </span>
                      <span className="badge badge-accent">{station.speed}</span>
                      <span className="list-distance">
                        {getDistance(userLocation[0], userLocation[1], station.lat, station.lng)} km
                      </span>
                    </div>
                    <div className="list-card-types">
                      {station.chargerTypes.map(t => (
                        <span key={t} className="charger-type-tag">{t}</span>
                      ))}
                    </div>
                  </div>
                  <div className="list-card-price">
                    <span className="price-value">₹{station.pricePerKwh}</span>
                    <span className="price-unit">/kWh</span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Station Detail Panel */}
      {selectedStation && (
        <StationDetail
          station={selectedStation}
          userLocation={userLocation}
          onClose={() => setSelectedStation(null)}
        />
      )}

      <style>{`
        .marker-pin {
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
        .marker-slots {
          transform: rotate(45deg);
          color: white;
          font-size: 12px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
