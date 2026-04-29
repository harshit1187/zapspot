import { useState, useEffect, useRef } from 'react';
import { X, Battery, Clock, AlertTriangle, ChevronRight, MapPin, Zap, Navigation, Radio, Map } from 'lucide-react';
import { getManeuverIcon, getManeuverLabel, getTrafficSeverityLabel, estimateBatteryAtArrival } from '../../services/tomtomRouting';
import './DrivingMode.css';

function haversineMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dL = (lat2 - lat1) * Math.PI / 180;
  const dG = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dL / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dG / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DrivingMode({ routeData, routeType, station, batteryLevel, userLocation, onStop, onUpdatePosition }) {
  const [instrIdx, setInstrIdx] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [gpsError, setGpsError] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const watchRef = useRef(null);
  const simIdxRef = useRef(0);

  const { instructions = [], distanceKm, travelTimeMin, trafficDelaySeconds = 0, arrivalTime, tollSections = [], routePoints = [] } = routeData;

  const battEst = estimateBatteryAtArrival(batteryLevel, 40.5, parseFloat(distanceKm), 15, trafficDelaySeconds);
  const traffic = getTrafficSeverityLabel(trafficDelaySeconds);
  const isFastest = routeType === 'fastest';

  // GPS watch
  useEffect(() => {
    if (isSimulating) {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      return;
    }

    if (!navigator.geolocation) { setGpsError(true); return; }
    watchRef.current = navigator.geolocation.watchPosition(pos => {
      const { latitude, longitude, speed: spd } = pos.coords;
      onUpdatePosition([latitude, longitude]);
      setSpeed(spd ? Math.round(spd * 3.6) : 0);

      // Auto-advance instructions when within 40m of waypoint
      setInstrIdx(prev => {
        for (let i = prev; i < instructions.length; i++) {
          if (instructions[i].point) {
            const d = haversineMeters(latitude, longitude, instructions[i].point[0], instructions[i].point[1]);
            if (d < 40 && i > prev) return i;
          }
        }
        return prev;
      });
    }, () => setGpsError(true), { enableHighAccuracy: true, maximumAge: 3000 });
    
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [instructions, onUpdatePosition, isSimulating]);

  // Simulation Timer
  useEffect(() => {
    if (!isSimulating || !routePoints.length) return;
    
    const interval = setInterval(() => {
      simIdxRef.current += 1;
      if (simIdxRef.current >= routePoints.length) {
        clearInterval(interval);
        setSpeed(0);
        return;
      }
      
      const pt = routePoints[simIdxRef.current];
      const lat = pt.lat || pt[0];
      const lng = pt.lng || pt[1];
      
      onUpdatePosition([lat, lng]);
      setSpeed(Math.floor(Math.random() * 8) + 42); // simulated 42-50 km/h
      
      // Auto-advance instructions
      setInstrIdx(prev => {
        for (let i = prev; i < instructions.length; i++) {
          if (instructions[i].point) {
            const d = haversineMeters(lat, lng, instructions[i].point[0], instructions[i].point[1]);
            if (d < 60 && i > prev) return i;
          }
        }
        return prev;
      });
      
    }, 250); // Move every 250ms (4x real speed)
    
    return () => clearInterval(interval);
  }, [isSimulating, routePoints, instructions, onUpdatePosition]);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsedSec(p => p + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const remainMin = Math.max(0, travelTimeMin - Math.floor(elapsedSec / 60));
  const curr = instructions[instrIdx] || null;
  const next = instructions[instrIdx + 1] || null;
  const hasToll = tollSections.length > 0;

  // Distance remaining (rough)
  const totalM = (instructions[instructions.length - 1]?.distanceMeters) || (parseFloat(distanceKm) * 1000);
  const currM = curr?.distanceMeters || 0;
  const remKm = Math.max(0, (totalM - currM) / 1000).toFixed(1);

  // Format time (e.g., 1 hr 2 min)
  const formatTime = (mins) => {
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${hrs} hr ${m} min` : `${hrs} hr`;
  };

  return (
    <div className="dm-root" id="driving-mode-hud">
      
      {/* ── Top Panel (Green, Floating) ──────────────── */}
      <div className="dm-top-panel">
        <div className="dm-instruction-card">
          <div className="dm-maneuver-wrap">
            <div className="dm-maneuver-arrow">{curr ? getManeuverIcon(curr.maneuver) : '🏁'}</div>
            {curr?.distanceMeters && instrIdx < instructions.length - 1 && (
              <div className="dm-turn-distance">
                {curr.distanceMeters < 1000
                  ? `${curr.distanceMeters} m`
                  : `${(curr.distanceMeters / 1000).toFixed(1)} km`}
              </div>
            )}
          </div>
          <div className="dm-instruction-content">
            <div className="dm-instruction-text">
              {curr ? getManeuverLabel(curr.maneuver) : 'Arriving at destination'}
            </div>
            {curr?.street && <div className="dm-street-name">{curr.street}</div>}
          </div>
        </div>

        {/* Next turn pill */}
        {next && (
          <div className="dm-next-row">
            <span className="dm-then-label">Then</span>
            <span className="dm-next-arrow">{getManeuverIcon(next.maneuver)}</span>
            <span className="dm-next-text">{next.street || getManeuverLabel(next.maneuver)}</span>
          </div>
        )}
      </div>

      {/* ── Bottom Panel (White, Apple/Google Style) ─── */}
      <div className="dm-bottom-panel">
        
        {/* Alert Banners */}
        <div className="dm-banners-container">
          {trafficDelaySeconds > 60 && (
            <div className="dm-banner dm-banner-traffic">
              <Radio size={14} />
              <span>+{Math.round(trafficDelaySeconds / 60)} min traffic</span>
            </div>
          )}
          {hasToll && (
            <div className="dm-banner dm-banner-toll">
              <span>₹ Toll road</span>
            </div>
          )}
          {battEst.isLowBattery && (
            <div className={`dm-banner ${battEst.isCriticalBattery ? 'dm-banner-critical' : 'dm-banner-warn'}`}>
              <AlertTriangle size={14} />
              <span>{battEst.isCriticalBattery ? 'Critical battery' : 'Low battery'}</span>
            </div>
          )}
          {gpsError && (
            <div className="dm-banner dm-banner-gps">
              <AlertTriangle size={14} />
              <span>GPS unavailable</span>
            </div>
          )}
        </div>

        {/* Stats & Controls */}
        <div className="dm-bottom-content">
          <button className="dm-icon-btn dm-close-btn" onClick={onStop}>
            <X size={24} />
          </button>
          
          <div className="dm-main-stats">
            <div className="dm-time-val">{formatTime(remainMin)}</div>
            <div className="dm-sub-stats">
              <span>{remKm} km</span>
              <span className="dm-dot-sep">•</span>
              <span>{arrivalTime || '--'}</span>
              <span className="dm-dot-sep">•</span>
              <span className={battEst.isLowBattery ? 'dm-batt-warn' : 'dm-batt-ok'}>
                {battEst.batteryAtArrivalPercent}% at arrival
              </span>
            </div>
          </div>

          <button 
            className={`dm-icon-btn dm-route-btn ${isSimulating ? 'active' : ''}`}
            onClick={() => setIsSimulating(!isSimulating)}
            title={isSimulating ? 'Stop Simulation' : 'Simulate Driving'}
          >
            <Navigation size={22} style={{ transform: isSimulating ? 'rotate(0)' : 'rotate(45deg)', transition: 'transform 0.3s ease' }} />
          </button>
        </div>

        {/* Speed limit or current speed floating element (optional) */}
        {speed > 0 && (
          <div className="dm-speed-bubble">
            <div className="dm-speed-val">{speed}</div>
            <div className="dm-speed-lbl">km/h</div>
          </div>
        )}
      </div>
    </div>
  );
}
