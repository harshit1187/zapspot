import { useState, useMemo } from 'react';
import { X, Star, MapPin, Clock, Zap, Navigation, Wifi, Coffee, Car, Baby, Armchair, Bath, ExternalLink } from 'lucide-react';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { getDistance, estimateChargingTime, estimateCost, generateTimeSlots, formatCurrency } from '../../utils/helpers';
import './StationDetail.css';

const amenityIcons = {
  Restroom: Bath, Cafe: Coffee, WiFi: Wifi, Parking: Car, Lounge: Armchair, 'Kids Area': Baby
};

export default function StationDetail({ station, userLocation, onClose }) {
  const { startBooking } = useBooking();
  const { isAuthenticated, setShowLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('slots');
  const [batteryPercent, setBatteryPercent] = useState(20);
  const [targetPercent, setTargetPercent] = useState(80);
  const [selectedCharger, setSelectedCharger] = useState(station.chargers.find(c => c.status === 'available') || station.chargers[0]);

  const distance = getDistance(userLocation[0], userLocation[1], station.lat, station.lng);
  const timeSlots = useMemo(() => generateTimeSlots(station.openingTime, station.closingTime), [station]);

  const chargingTime = estimateChargingTime(
    batteryPercent, targetPercent,
    selectedCharger?.power > 20 ? 40.5 : 3.7,
    selectedCharger?.power || 22
  );

  const cost = estimateCost(
    batteryPercent, targetPercent,
    selectedCharger?.power > 20 ? 40.5 : 3.7,
    station.pricePerKwh
  );

  const handleBook = () => {
    if (!isAuthenticated) {
      setShowLogin(true);
      return;
    }
    startBooking(station, selectedCharger);
  };

  return (
    <div className="station-detail" id="station-detail-panel">
      <div className="detail-overlay" onClick={onClose}></div>
      <div className="detail-panel glass-card-static">
        <button className="detail-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Hero */}
        <div className="detail-hero">
          <img src={station.image} alt={station.name} className="detail-hero-img" />
          <div className="detail-hero-overlay">
            <div className="detail-rating">
              <Star size={14} fill="#FF9F0A" color="#FF9F0A" />
              <span>{station.rating}</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="detail-body">
          <h3 className="detail-name">{station.name}</h3>
          <div className="detail-meta">
            <span className="detail-address"><MapPin size={14} /> {station.address}</span>
            <span className="detail-distance"><Navigation size={14} /> {distance} km away</span>
            <span className="detail-hours"><Clock size={14} /> {station.openingTime} – {station.closingTime}</span>
          </div>

          {/* Charger Types */}
          <div className="detail-chargers">
            <label className="filter-label">Select Charger</label>
            <div className="charger-list">
              {station.chargers.map(charger => (
                <button
                  key={charger.id}
                  className={`charger-chip ${selectedCharger?.id === charger.id ? 'selected' : ''} ${charger.status}`}
                  onClick={() => charger.status !== 'faulty' && setSelectedCharger(charger)}
                  disabled={charger.status === 'faulty'}
                >
                  <Zap size={12} />
                  <span>{charger.type} • {charger.power}kW</span>
                  <span className={`chip-status ${charger.status}`}>
                    {charger.status === 'available' ? '✓' : charger.status === 'occupied' ? '⏳' : '✕'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs detail-tabs">
            <button className={`tab ${activeTab === 'slots' ? 'active' : ''}`} onClick={() => setActiveTab('slots')}>Time Slots</button>
            <button className={`tab ${activeTab === 'estimate' ? 'active' : ''}`} onClick={() => setActiveTab('estimate')}>Estimator</button>
            <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
            <button className={`tab ${activeTab === 'amenities' ? 'active' : ''}`} onClick={() => setActiveTab('amenities')}>Amenities</button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'slots' && (
              <div className="slots-grid">
                {timeSlots.map((slot, i) => (
                  <div key={i} className={`time-slot ${slot.available ? 'available' : 'booked'}`}>
                    <span className="slot-time">{slot.from}</span>
                    <span className="slot-status">{slot.available ? '✅' : '❌'}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'estimate' && (
              <div className="estimator">
                <div className="estimate-input">
                  <label>Current Battery %</label>
                  <div className="range-row">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={batteryPercent}
                      onChange={e => setBatteryPercent(Number(e.target.value))}
                      className="range-input"
                    />
                    <span className="range-value">{batteryPercent}%</span>
                  </div>
                </div>
                <div className="estimate-input">
                  <label>Target Battery %</label>
                  <div className="range-row">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={targetPercent}
                      onChange={e => setTargetPercent(Number(e.target.value))}
                      className="range-input"
                    />
                    <span className="range-value">{targetPercent}%</span>
                  </div>
                </div>
                <div className="estimate-results">
                  <div className="estimate-card glass-card-dark">
                    <Clock size={20} color="var(--color-accent)" />
                    <div>
                      <span className="estimate-value">{chargingTime} min</span>
                      <span className="estimate-label">Estimated Time</span>
                    </div>
                  </div>
                  <div className="estimate-card glass-card-dark">
                    <Zap size={20} color="#30D158" />
                    <div>
                      <span className="estimate-value">{formatCurrency(cost)}</span>
                      <span className="estimate-label">Estimated Cost</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-list">
                {station.reviews.length === 0 ? (
                  <p className="text-secondary" style={{ textAlign: 'center', padding: '20px' }}>No reviews yet</p>
                ) : (
                  station.reviews.map((review, i) => (
                    <div key={i} className="review-card">
                      <div className="review-header">
                        <span className="review-user">{review.user}</span>
                        <div className="review-stars">
                          {Array.from({ length: 5 }).map((_, j) => (
                            <Star key={j} size={12} fill={j < review.rating ? '#FF9F0A' : 'none'} color={j < review.rating ? '#FF9F0A' : '#D1D1D6'} />
                          ))}
                        </div>
                      </div>
                      <p className="review-text">{review.text}</p>
                      <span className="review-date">{review.date}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'amenities' && (
              <div className="amenities-grid">
                {station.amenities.map(amenity => {
                  const Icon = amenityIcons[amenity] || Wifi;
                  return (
                    <div key={amenity} className="amenity-card glass-card-dark">
                      <Icon size={20} color="var(--color-accent)" />
                      <span>{amenity}</span>
                    </div>
                  );
                })}
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="amenity-card glass-card-dark directions-link"
                >
                  <ExternalLink size={20} color="var(--color-accent)" />
                  <span>Get Directions</span>
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="detail-actions">
            {station.availableSlots > 0 ? (
              <button className="btn btn-success btn-lg detail-book-btn" onClick={handleBook} id="book-now-btn">
                <Zap size={18} />
                Book Now — {formatCurrency(cost)}/est
              </button>
            ) : (
              <button className="btn btn-primary btn-lg detail-book-btn" onClick={handleBook}>
                Join Waitlist
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
