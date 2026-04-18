import Hero from '../components/home/Hero';
import QuickCards from '../components/home/QuickCards';
import CarbonWidget from '../components/home/CarbonWidget';
import './Home.css';

export default function Home() {
  return (
    <div className="home-page">
      <Hero />
      <QuickCards />
      <CarbonWidget />
    </div>
  );
}
