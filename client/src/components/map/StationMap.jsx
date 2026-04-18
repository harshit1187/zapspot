import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, List, Map as MapIcon, Filter, X, Zap, MapPin, Clock, CalendarCheck, Activity } from 'lucide-react';
import { getStatusColor, getStatusLabel, getDistance } from '../../utils/helpers';
import { generateNearbyStations } from '../../utils/generateStations';
import StationDetail from '../station/StationDetail';
import BookingCountdown from './BookingCountdown';
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

function createUserIcon(battery) {
  const batteryColor = battery > 60 ? '#30D158' : battery > 25 ? '#FF9F0A' : '#FF453A';
  const circumference = 2 * Math.PI * 18;
  const dashoffset = circumference - (battery / 100) * circumference;
  return L.divIcon({
    className: 'user-location-marker',
    html: `
      <div class="user-marker-container">
        <div class="user-marker-pulse"></div>
        <svg class="user-battery-ring" width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(0,0,0,0.08)" stroke-width="3.5"/>
          <circle cx="24" cy="24" r="18" fill="none" stroke="${batteryColor}" stroke-width="3.5"
            stroke-dasharray="${circumference}" stroke-dashoffset="${dashoffset}"
            stroke-linecap="round" transform="rotate(-90 24 24)"/>
        </svg>
        <div class="user-marker-dot">
          <span class="user-battery-text">${battery}%</span>
        </div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -28],
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

// Automatically centers map on user location when it changes
function MapCenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function StationMap() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [showList, setShowList] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [userLocation, setUserLocation] = useState([31.634, 74.872]);
  const [userLocated, setUserLocated] = useState(false);
  const [batteryLevel] = useState(() => Math.floor(Math.random() * 60) + 20); // Simulated 20-80%
  const [filters, setFilters] = useState({
    chargerType: 'all',
    vehicleType: 'all',
    speed: 'all',
    amenities: [],
  });

  // Generate stations around a location
  const generateStationsAroundLocation = useCallback((lat, lng) => {
    const newStations = generateNearbyStations(lat, lng, 15);
    setStations(newStations);
  }, []);

  // Auto-detect user location on mount and generate stations
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation([latitude, longitude]);
          setUserLocated(true);
          generateStationsAroundLocation(latitude, longitude);
        },
        () => {
          // Fallback: generate stations around default location
          setUserLocated(true);
          generateStationsAroundLocation(31.634, 74.872);
        }
      );
    } else {
      setUserLocated(true);
      generateStationsAroundLocation(31.634, 74.872);
    }
  }, [generateStationsAroundLocation]);

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

  const handleInstantBook = () => {
    // Find the nearest available station
    const availableStations = filteredStations
      .filter(s => s.availableSlots > 0)
      .sort((a, b) =>
        parseFloat(getDistance(userLocation[0], userLocation[1], a.lat, a.lng)) -
        parseFloat(getDistance(userLocation[0], userLocation[1], b.lat, b.lng))
      );
    if (availableStations.length > 0) {
      setSelectedStation(availableStations[0]);
    }
  };

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
            <option value="any">Any Speed</option>
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
        {/* Booking Countdown Widget */}
        <BookingCountdown stations={filteredStations} />

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
            <MapCenterUpdater center={userLocated ? userLocation : null} />
            <LocateButton onLocate={(loc) => {
              setUserLocation(loc);
              setUserLocated(true);
              generateStationsAroundLocation(loc[0], loc[1]);
            }} />

            {/* User Location Marker */}
            {userLocated && (
              <Marker
                position={userLocation}
                icon={createUserIcon(batteryLevel)}
                zIndexOffset={1000}
              >
                <Popup className="station-popup">
                  <div className="popup-content">
                    <strong>📍 Your Location</strong>
                    <div className="popup-meta" style={{ marginTop: '6px' }}>
                      <span className={`badge badge-${batteryLevel > 60 ? 'success' : batteryLevel > 25 ? 'warning' : 'danger'}`}>
                        🔋 {batteryLevel}% Battery
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#6E6E73', marginTop: '4px' }}>
                      {batteryLevel <= 25 ? 'Low battery — charge soon!' : batteryLevel <= 60 ? 'Moderate charge remaining' : 'Battery in good shape'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Station Markers */}
            {filteredStations.map(station => {
              const dist = getDistance(userLocation[0], userLocation[1], station.lat, station.lng);
              return (
                <Marker
                  key={station._id}
                  position={[station.lat, station.lng]}
                  icon={createMarkerIcon(getStatusColor(station), station.availableSlots)}
                  eventHandlers={{
                    click: () => setSelectedStation(station),
                  }}
                >
                  <Tooltip
                    direction="top"
                    offset={[0, -44]}
                    className="station-tooltip"
                    interactive={true}
                    sticky={false}
                  >
                    <div className="tooltip-content">
                      <strong className="tooltip-name">{station.name}</strong>
                      <div className="tooltip-info">
                        <span className={`tooltip-slots ${station.availableSlots === 0 ? 'full' : station.availableSlots <= 1 ? 'limited' : 'available'}`}>
                          {station.availableSlots}/{station.totalSlots} slots
                        </span>
                        <span className="tooltip-dist">{dist} km</span>
                      </div>
                      <a
                        className="tooltip-directions"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                      >
                        📍 Get Directions
                      </a>
                    </div>
                  </Tooltip>
                  <Popup className="station-popup">
                    <div className="popup-content">
                      <strong>{station.name}</strong>
                      <div className="popup-meta">
                        <span className={`badge badge-${station.availableSlots === 0 ? 'danger' : station.availableSlots <= 1 ? 'warning' : 'success'}`}>
                          {station.availableSlots}/{station.totalSlots} slots
                        </span>
                        <span>{dist} km</span>
                      </div>
                      <a
                        className="popup-directions"
                        href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        📍 Get Directions
                      </a>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
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

        {/* Instant Station Booking Panel */}
        <div className="instant-booking-panel" id="instant-booking-panel">
          <div className="instant-booking-features">
            <div className="instant-feature">
              <div className="instant-feature-icon">
                <MapPin size={16} />
              </div>
              <span>Locate nearby stations</span>
            </div>
            <div className="instant-feature-divider" />
            <div className="instant-feature">
              <div className="instant-feature-icon live">
                <Clock size={16} />
              </div>
              <span>Real-time availability</span>
            </div>
            <div className="instant-feature-divider" />
            <div className="instant-feature">
              <div className="instant-feature-icon">
                <CalendarCheck size={16} />
              </div>
              <span>Book & pre-book slots</span>
            </div>
            <div className="instant-feature-divider" />
            <div className="instant-feature">
              <div className="instant-feature-icon">
                <Activity size={16} />
              </div>
              <span>Live traffic updates</span>
            </div>
          </div>
          <button className="btn btn-primary instant-book-btn" id="instant-book-btn" onClick={handleInstantBook}>
            <Zap size={18} />
            Instant Book Nearest Station
          </button>
        </div>
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

        /* User Location Marker */
        .user-location-marker {
          background: none !important;
          border: none !important;
        }
        .user-marker-container {
          position: relative;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-marker-pulse {
          position: absolute;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(0, 113, 227, 0.15);
          animation: userPulse 2s ease-in-out infinite;
        }
        @keyframes userPulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }
        .user-battery-ring {
          position: absolute;
          top: 0;
          left: 0;
          filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15));
        }
        .user-marker-dot {
          position: absolute;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .user-battery-text {
          font-size: 9px;
          font-weight: 700;
          font-family: 'Inter', sans-serif;
          color: #1D1D1F;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}

