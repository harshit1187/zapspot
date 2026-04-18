import { Leaf, Award, TrendingUp, Zap } from 'lucide-react';
import './CarbonWidget.css';

export default function CarbonWidget() {
  return (
    <section className="section-lg carbon-section" id="carbon-widget">
      <div className="container">
        <div className="carbon-grid">
          <div className="carbon-content">
            <div className="hero-badge" style={{ marginBottom: '20px' }}>
              <Leaf size={14} />
              <span>Impact Tracker</span>
            </div>
            <h2>Drive Green,<br />Earn Rewards</h2>
            <p className="carbon-desc">
              Every charge counts. Track your carbon footprint reduction, 
              earn loyalty points, and unlock exclusive rewards as you 
              contribute to a cleaner planet.
            </p>
            <div className="carbon-stats-row">
              <div className="carbon-stat-card glass-card-static">
                <Leaf size={20} color="#30D158" />
                <div>
                  <span className="carbon-stat-value">127.5 kg</span>
                  <span className="carbon-stat-label">CO₂ Saved</span>
                </div>
              </div>
              <div className="carbon-stat-card glass-card-static">
                <Award size={20} color="#FF9F0A" />
                <div>
                  <span className="carbon-stat-value">2,450</span>
                  <span className="carbon-stat-label">Reward Points</span>
                </div>
              </div>
            </div>
          </div>

          <div className="carbon-visual">
            <div className="carbon-feature-cards">
              <div className="feature-card glass-card">
                <div className="feature-icon" style={{ background: 'rgba(48,209,88,0.1)' }}>
                  <TrendingUp size={22} color="#30D158" />
                </div>
                <div>
                  <h4>Monthly Impact</h4>
                  <p className="text-secondary">Track your green journey with detailed monthly charts</p>
                </div>
              </div>
              <div className="feature-card glass-card">
                <div className="feature-icon" style={{ background: 'rgba(0,113,227,0.08)' }}>
                  <Award size={22} color="#0071E3" />
                </div>
                <div>
                  <h4>Loyalty Tiers</h4>
                  <p className="text-secondary">Bronze → Silver → Gold → Platinum. Unlock exclusive perks</p>
                </div>
              </div>
              <div className="feature-card glass-card">
                <div className="feature-icon" style={{ background: 'rgba(255,159,10,0.1)' }}>
                  <Zap size={22} color="#FF9F0A" />
                </div>
                <div>
                  <h4>Free Charges</h4>
                  <p className="text-secondary">Redeem points for free charging sessions & partner discounts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
