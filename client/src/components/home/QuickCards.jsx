import { useNavigate } from 'react-router-dom';
import { Navigation, Clock, CalendarDays, BatteryWarning } from 'lucide-react';
import './QuickCards.css';

const cards = [
  {
    id: 'nearest',
    icon: Navigation,
    title: 'Nearest Now',
    description: 'Find the closest available charging station to your current location',
    color: '#0071E3',
    bgColor: 'rgba(0, 113, 227, 0.06)',
  },
  {
    id: 'available-soon',
    icon: Clock,
    title: 'Available in <10 min',
    description: 'Stations with slots opening up in the next 10 minutes',
    color: '#30D158',
    bgColor: 'rgba(48, 209, 88, 0.06)',
  },
  {
    id: 'pre-book',
    icon: CalendarDays,
    title: 'Pre-book Tomorrow',
    description: 'Reserve your charging slot in advance for tomorrow',
    color: '#FF9F0A',
    bgColor: 'rgba(255, 159, 10, 0.06)',
  },
  {
    id: 'emergency',
    icon: BatteryWarning,
    title: 'Emergency Finder',
    description: 'Low battery? Find the fastest route to an available charger',
    color: '#FF453A',
    bgColor: 'rgba(255, 69, 58, 0.06)',
  },
];

export default function QuickCards() {
  const navigate = useNavigate();

  return (
    <section className="section quick-cards-section" id="quick-cards">
      <div className="container">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p className="text-secondary">Get to what you need in one click</p>
        </div>
        <div className="grid-4 quick-cards-grid">
          {cards.map(card => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="glass-card quick-card"
                onClick={() => navigate('/map')}
                id={`quick-card-${card.id}`}
              >
                <div className="quick-card-icon" style={{ background: card.bgColor }}>
                  <Icon size={24} color={card.color} strokeWidth={1.5} />
                </div>
                <h4 className="quick-card-title">{card.title}</h4>
                <p className="quick-card-desc">{card.description}</p>
                <div className="quick-card-arrow" style={{ color: card.color }}>→</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
