import { createContext, useContext, useState } from 'react';
import { mockBookings } from '../data/mockStations';

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const [bookings, setBookings] = useState(mockBookings);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedCharger, setSelectedCharger] = useState(null);

  const addBooking = (booking) => {
    const newBooking = {
      ...booking,
      _id: 'b' + Date.now(),
      status: 'upcoming',
      kwhDelivered: 0,
      progress: 0,
    };
    setBookings(prev => [newBooking, ...prev]);
    return newBooking;
  };

  const cancelBooking = (bookingId) => {
    setBookings(prev => prev.map(b =>
      b._id === bookingId ? { ...b, status: 'cancelled' } : b
    ));
  };

  const startBooking = (station, charger) => {
    setSelectedStation(station);
    setSelectedCharger(charger);
    setShowBooking(true);
  };

  const closeBooking = () => {
    setShowBooking(false);
    setSelectedStation(null);
    setSelectedCharger(null);
  };

  return (
    <BookingContext.Provider value={{
      bookings, showBooking, selectedStation, selectedCharger,
      addBooking, cancelBooking, startBooking, closeBooking, setShowBooking
    }}>
      {children}
    </BookingContext.Provider>
  );
}

export const useBooking = () => useContext(BookingContext);
