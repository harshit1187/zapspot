import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Station from '../models/Station.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Station.deleteMany({});

    // Create owner
    const hashedPassword = await bcrypt.hash('owner123', 10);
    const owner = await User.create({
      name: 'Station Owner',
      email: 'owner@zapspot.in',
      password: hashedPassword,
      role: 'owner',
    });

    // Create demo user
    const userPassword = await bcrypt.hash('user123', 10);
    await User.create({
      name: 'Harpreet Singh',
      email: 'harpreet@email.com',
      password: userPassword,
      role: 'user',
      vehicles: [
        { name: 'Tata Nexon EV', type: '4-wheeler', batteryCapacity: 40.5, connector: 'CCS2' },
        { name: 'Ather 450X', type: '2-wheeler', batteryCapacity: 3.7, connector: 'Type 2' },
      ],
      rewards: { points: 2450, level: 'Silver', carbonSaved: 127.5, totalCharges: 34 },
    });

    // Create stations
    const stations = [
      {
        name: 'Tata Power EV Station - Hall Gate',
        address: 'Hall Gate, Near Golden Temple, Amritsar, Punjab 143001',
        location: { type: 'Point', coordinates: [74.8765, 31.6200] },
        rating: 4.6, totalSlots: 6, availableSlots: 3,
        chargerTypes: ['CCS2', 'Type 2'], vehicleTypes: ['4-wheeler'],
        speed: 'Fast', pricePerKwh: 9.5,
        amenities: ['Restroom', 'Cafe', 'WiFi', 'Parking'],
        status: 'available',
        image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=300&fit=crop',
        chargers: [
          { type: 'CCS2', power: 50, status: 'available' },
          { type: 'CCS2', power: 50, status: 'occupied' },
          { type: 'Type 2', power: 22, status: 'available' },
          { type: 'Type 2', power: 22, status: 'available' },
          { type: 'CCS2', power: 50, status: 'occupied' },
          { type: 'Type 2', power: 22, status: 'faulty' },
        ],
        openingTime: '06:00', closingTime: '23:00', owner: owner._id,
      },
      {
        name: 'ChargeZone Hub — GT Road',
        address: 'GT Road, Putlighar, Amritsar 143001',
        location: { type: 'Point', coordinates: [74.8591, 31.6367] },
        rating: 4.8, totalSlots: 8, availableSlots: 5,
        chargerTypes: ['CCS2', 'CHAdeMO', 'Type 2'], vehicleTypes: ['4-wheeler'],
        speed: 'Fast', pricePerKwh: 11.0,
        amenities: ['Restroom', 'Cafe', 'WiFi', 'Parking', 'Lounge'],
        status: 'available',
        image: 'https://images.unsplash.com/photo-1647469289073-0b70be82a2c0?w=600&h=300&fit=crop',
        chargers: [
          { type: 'CCS2', power: 60, status: 'available' },
          { type: 'CCS2', power: 60, status: 'available' },
          { type: 'CHAdeMO', power: 50, status: 'available' },
          { type: 'Type 2', power: 22, status: 'occupied' },
          { type: 'CCS2', power: 60, status: 'available' },
          { type: 'Type 2', power: 22, status: 'occupied' },
          { type: 'CHAdeMO', power: 50, status: 'available' },
          { type: 'CCS2', power: 60, status: 'occupied' },
        ],
        openingTime: '00:00', closingTime: '23:59', owner: owner._id,
      },
      {
        name: 'Tata Power SuperCharger — Airport Road',
        address: 'Airport Road, Near Raja Sansi, Amritsar 143101',
        location: { type: 'Point', coordinates: [74.8015, 31.7017] },
        rating: 4.7, totalSlots: 10, availableSlots: 7,
        chargerTypes: ['CCS2', 'CHAdeMO', 'Type 2', 'GB/T'], vehicleTypes: ['2-wheeler', '4-wheeler'],
        speed: 'Fast', pricePerKwh: 10.5,
        amenities: ['Restroom', 'Cafe', 'WiFi', 'Parking', 'Lounge', 'Kids Area'],
        status: 'available',
        image: 'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=600&h=300&fit=crop',
        chargers: [
          { type: 'CCS2', power: 120, status: 'available' },
          { type: 'CCS2', power: 120, status: 'available' },
          { type: 'CHAdeMO', power: 50, status: 'available' },
          { type: 'Type 2', power: 22, status: 'available' },
          { type: 'GB/T', power: 60, status: 'available' },
          { type: 'CCS2', power: 120, status: 'occupied' },
          { type: 'Type 2', power: 22, status: 'available' },
          { type: 'CHAdeMO', power: 50, status: 'occupied' },
          { type: 'CCS2', power: 120, status: 'available' },
          { type: 'GB/T', power: 60, status: 'occupied' },
        ],
        openingTime: '00:00', closingTime: '23:59', owner: owner._id,
      },
      {
        name: 'Bolt Charge — Wagah Border Road',
        address: 'Wagah Border Road, Near Attari, Amritsar 143104',
        location: { type: 'Point', coordinates: [74.5721, 31.6048] },
        rating: 4.5, totalSlots: 6, availableSlots: 4,
        chargerTypes: ['CCS2', 'CHAdeMO', 'GB/T'], vehicleTypes: ['4-wheeler'],
        speed: 'Fast', pricePerKwh: 10.0,
        amenities: ['Restroom', 'Cafe', 'Parking', 'Lounge'],
        status: 'available',
        image: 'https://images.unsplash.com/photo-1571987502227-9231b837d92a?w=600&h=300&fit=crop',
        chargers: [
          { type: 'CCS2', power: 60, status: 'available' },
          { type: 'CHAdeMO', power: 50, status: 'available' },
          { type: 'GB/T', power: 60, status: 'occupied' },
          { type: 'CCS2', power: 60, status: 'available' },
          { type: 'CHAdeMO', power: 50, status: 'available' },
          { type: 'CCS2', power: 60, status: 'occupied' },
        ],
        openingTime: '05:00', closingTime: '23:00', owner: owner._id,
      },
      {
        name: 'PowerGrid Fast Hub — Jalandhar Bypass',
        address: 'Jalandhar Bypass, Near Verka Chowk, Amritsar 143001',
        location: { type: 'Point', coordinates: [74.8420, 31.6590] },
        rating: 4.4, totalSlots: 8, availableSlots: 6,
        chargerTypes: ['CCS2', 'CHAdeMO', 'Type 2', 'GB/T'], vehicleTypes: ['2-wheeler', '4-wheeler'],
        speed: 'Fast', pricePerKwh: 9.0,
        amenities: ['Restroom', 'Cafe', 'WiFi', 'Parking', 'Kids Area'],
        status: 'available',
        image: 'https://images.unsplash.com/photo-1609344483067-b3027bec4dc2?w=600&h=300&fit=crop',
        chargers: [
          { type: 'CCS2', power: 60, status: 'available' },
          { type: 'CCS2', power: 60, status: 'available' },
          { type: 'CHAdeMO', power: 50, status: 'available' },
          { type: 'Type 2', power: 22, status: 'available' },
          { type: 'GB/T', power: 60, status: 'available' },
          { type: 'CCS2', power: 60, status: 'occupied' },
          { type: 'Type 2', power: 22, status: 'available' },
          { type: 'CHAdeMO', power: 50, status: 'occupied' },
        ],
        openingTime: '00:00', closingTime: '23:59', owner: owner._id,
      },
    ];

    await Station.insertMany(stations);
    
    console.log('✅ Database seeded successfully!');
    console.log(`   - 1 owner: owner@zapspot.in / owner123`);
    console.log(`   - 1 user: harpreet@email.com / user123`);
    console.log(`   - ${stations.length} stations created`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
