import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Zap } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { mockStations } from '../../data/mockStations';
import { getStatusColor } from '../../utils/helpers';
import './Hero.css';

function createIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 16px; height: 16px; 
      background: ${color}; 
      border-radius: 50%; 
      border: 3px solid white; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      ${color === '#30D158' ? 'animation: markerPulse 2s infinite;' : ''}
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero" id="hero-section">
      {/* Ambient blurred blobs */}
      <div className="hero-blob hero-blob-1"></div>
      <div className="hero-blob hero-blob-2"></div>
      <div className="hero-blob hero-blob-3"></div>

      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={14} />
            <span>Real-time EV Station Finder</span>
          </div>
          <h1 className="hero-title">
            Find & Book<br />
            <span className="hero-highlight">EV Charging Stations</span><br />
            in Real-Time Across India
          </h1>
          <p className="hero-subtitle">
            Locate nearby chargers, pre-book your slot, and charge with confidence. 
            Join 50,000+ EV drivers already using Zapspot.
          </p>
          <div className="hero-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/map')}
              id="hero-find-cta"
            >
              <MapPin size={18} />
              Find Stations Near Me
              <ArrowRight size={16} />
            </button>
            <button
              className="btn btn-glass btn-lg"
              onClick={() => navigate('/map')}
            >
              Explore Map
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-number">2,400+</span>
              <span className="stat-label">Stations</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">15</span>
              <span className="stat-label">Cities</span>
            </div>
            <div className="hero-stat-divider"></div>
            <div className="hero-stat">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Happy Drivers</span>
            </div>
          </div>
        </div>

        <div className="hero-map-wrapper">
          <div className="hero-map-card glass-card-static">
            <MapContainer
              center={[31.634, 74.872]}
              zoom={13}
              style={{ height: '100%', width: '100%', borderRadius: '16px' }}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {mockStations.slice(0, 6).map(station => (
                <Marker
                  key={station._id}
                  position={[station.lat, station.lng]}
                  icon={createIcon(getStatusColor(station))}
                >
                  <Popup>
                    <strong>{station.name}</strong><br />
                    {station.availableSlots}/{station.totalSlots} slots available
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
            <div className="map-overlay-badge">
              <div className="live-dot"></div>
              Live Map Preview
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes markerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(48,209,88,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(48,209,88,0); }
        }
      `}</style>
    </section>
  );
}
