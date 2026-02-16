import React, { useState, useEffect } from 'react';
import { Car, MapPin, Calendar, Users, Search, Plus, Menu, X, Home as HomeIcon, User, MessageSquare, Settings } from 'lucide-react';
import { RideCard } from './components/RideCard';
import { SearchSection } from './components/SearchSection';
import { OfferRideModal } from './components/OfferRideModal';
import { BookingModal } from './components/BookingModal';
import { MyRidesView } from './components/MyRidesView';
import { ProfileView } from './components/ProfileView';
import { HomeView } from './components/HomeView';
import { Header } from './components/Header';
import { RidesList } from './components/RidesList';
import { BottomNavigation } from './components/BottomNavigation';
import { RegistrationView } from './components/RegistrationView';
import { PendingApprovalView } from './components/PendingApprovalView';
import { SettingsView } from './components/SettingsView';
import { VehicleManagement, Vehicle } from './components/VehicleManagement';
import { RideDetailModal } from './components/RideDetailModal';
import { Footer } from './components/Footer';
import { LiveSupport } from './components/LiveSupport';
import { PrivacyPolicy } from './components/legal/PrivacyPolicy';
import { TermsOfService } from './components/legal/TermsOfService';
import { Imprint } from './components/legal/Imprint';
import { FAQ } from './components/quick-access/FAQ';
import { Safety } from './components/quick-access/Safety';
import { calculatePricePerPerson } from './utils/costCalculation';
// Logo is optional - will be replaced with text if not available
// import logoImage from './assets/JoinUs-Logo.png';

export interface Ride {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  driver: string;
  driverImage?: string;
  driverVerified?: boolean;
  driverGender?: 'male' | 'female';
  vehicle?: {
    model: string;
    fuelType: string;
    color?: string;
    consumption: number;
  };
  distance?: number; // in km
  availableSeats: number;
  totalSeats: number;
  pricePerPerson: number;
  recurring: boolean;
  recurringDays?: string[];
  description?: string;
  womensOnly?: boolean;
  childFriendly?: boolean;
  packageDelivery?: boolean;
  eventType?: string;
  eventName?: string;
}

interface RegistrationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  idDocument: File | null;
}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  birthDate: string;
  profileImage: string | null;
  paymentMethods: string[];
}

// Calculate dynamic prices based on actual costs
const mockRidesRaw = [
  {
    id: '1',
    from: 'Solothurn',
    to: 'Bern',
    date: '2026-02-17',
    time: '07:30',
    driver: 'Anna Müller',
    driverImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'VW Golf',
      fuelType: 'petrol',
      color: 'Silber',
      consumption: 6.5
    },
    distance: 35,
    availableSeats: 2,
    totalSeats: 3,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Regelmässige Fahrt zur Arbeit, Abfahrt pünktlich um 7:30 Uhr.'
  },
  {
    id: '2',
    from: 'Zürich',
    to: 'Bern',
    date: '2026-02-17',
    time: '08:00',
    driver: 'Markus Weber',
    driverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'BMW 3er',
      fuelType: 'diesel',
      color: 'Schwarz',
      consumption: 6.0
    },
    distance: 125,
    availableSeats: 3,
    totalSeats: 3,
    recurring: false,
    description: 'Einmalige Fahrt, Nichtraucher bevorzugt.'
  },
  {
    id: '3',
    from: 'Bern',
    to: 'Zürich',
    date: '2026-02-17',
    time: '17:30',
    driver: 'Sarah Schmidt',
    driverImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Audi A4',
      fuelType: 'petrol',
      color: 'Weiss',
      consumption: 7.0
    },
    distance: 125,
    availableSeats: 1,
    totalSeats: 2,
    recurring: true,
    recurringDays: ['Mo', 'Mi', 'Fr'],
    description: 'Rückfahrt nach der Arbeit.'
  },
  {
    id: '4',
    from: 'Basel',
    to: 'Bern',
    date: '2026-02-18',
    time: '09:00',
    driver: 'Thomas Klein',
    driverImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Mercedes C-Klasse',
      fuelType: 'diesel',
      color: 'Blau',
      consumption: 6.5
    },
    distance: 95,
    availableSeats: 2,
    totalSeats: 3,
    recurring: false,
    description: 'Entspannte Fahrt mit Musik.'
  },
  {
    id: '5',
    from: 'Solothurn',
    to: 'Bern',
    date: '2026-02-17',
    time: '08:15',
    driver: 'Lisa Berger',
    driverImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'VW Polo',
      fuelType: 'petrol',
      color: 'Rot',
      consumption: 5.5
    },
    distance: 35,
    availableSeats: 1,
    totalSeats: 2,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Pendel-Fahrt zur Uni Bern.'
  },
  {
    id: '6',
    from: 'Zürich',
    to: 'St. Gallen',
    date: '2026-02-17',
    time: '07:00',
    driver: 'Daniel Meier',
    driverImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Tesla Model 3',
      fuelType: 'electric',
      color: 'Rot',
      consumption: 16.5
    },
    distance: 80,
    availableSeats: 3,
    totalSeats: 3,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Tägliche Pendelfahrt, sehr pünktlich. Elektroauto, leise und umweltfreundlich.'
  },
  {
    id: '7',
    from: 'Genf',
    to: 'Lausanne',
    date: '2026-02-17',
    time: '08:30',
    driver: 'Sophie Dubois',
    driverImage: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop',
    driverVerified: true,
    driverGender: 'female' as const,
    vehicle: {
      model: 'Renault Zoe',
      fuelType: 'electric',
      color: 'Blau',
      consumption: 17.0
    },
    distance: 62,
    availableSeats: 2,
    totalSeats: 3,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Regelmässige Fahrt nach Lausanne. Nichtraucher, Elektroauto.',
    womensOnly: true,
    childFriendly: true
  },
  {
    id: '8',
    from: 'Luzern',
    to: 'Zürich',
    date: '2026-02-17',
    time: '06:45',
    driver: 'Peter Huber',
    driverImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'BMW 5er',
      fuelType: 'diesel',
      color: 'Grau',
      consumption: 6.8
    },
    distance: 55,
    availableSeats: 2,
    totalSeats: 2,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Frühe Abfahrt für Pendler. Komfortables Auto.'
  },
  {
    id: '9',
    from: 'Basel',
    to: 'Zürich',
    date: '2026-02-18',
    time: '10:00',
    driver: 'Julia Fischer',
    driverImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Audi Q5',
      fuelType: 'diesel',
      color: 'Schwarz',
      consumption: 7.2
    },
    distance: 85,
    availableSeats: 3,
    totalSeats: 4,
    recurring: false,
    description: 'Wochenendfahrt nach Zürich. Grosses SUV mit viel Platz.'
  },
  {
    id: '10',
    from: 'Thun',
    to: 'Bern',
    date: '2026-02-17',
    time: '07:15',
    driver: 'Michael Steiner',
    driverImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Skoda Octavia',
      fuelType: 'petrol',
      color: 'Weiss',
      consumption: 6.2
    },
    distance: 28,
    availableSeats: 2,
    totalSeats: 3,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Kurze Pendelstrecke, zuverlässig.'
  },
  {
    id: '11',
    from: 'Winterthur',
    to: 'Zürich',
    date: '2026-02-17',
    time: '07:45',
    driver: 'Andrea Keller',
    driverImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop',
    driverVerified: false,
    vehicle: {
      model: 'Toyota Prius',
      fuelType: 'hybrid',
      color: 'Silber',
      consumption: 4.5
    },
    distance: 25,
    availableSeats: 2,
    totalSeats: 3,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Hybrid-Fahrzeug, sehr sparsam. Umweltbewusste Fahrerin.'
  },
  {
    id: '12',
    from: 'Chur',
    to: 'Zürich',
    date: '2026-02-18',
    time: '06:30',
    driver: 'Marco Bianchi',
    driverImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Mercedes E-Klasse',
      fuelType: 'diesel',
      color: 'Schwarz',
      consumption: 6.3
    },
    distance: 120,
    availableSeats: 3,
    totalSeats: 3,
    recurring: false,
    description: 'Lange Strecke aus Graubünden. Komfortables Fahrzeug.'
  },
  {
    id: '13',
    from: 'Fribourg',
    to: 'Bern',
    date: '2026-02-17',
    time: '08:00',
    driver: 'Caroline Martin',
    driverImage: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Opel Astra',
      fuelType: 'petrol',
      color: 'Rot',
      consumption: 6.0
    },
    distance: 34,
    availableSeats: 2,
    totalSeats: 3,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Zuverlässige Pendelfahrt.'
  },
  {
    id: '14',
    from: 'Lugano',
    to: 'Bellinzona',
    date: '2026-02-17',
    time: '07:30',
    driver: 'Giuseppe Rossi',
    driverImage: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Fiat 500',
      fuelType: 'petrol',
      color: 'Gelb',
      consumption: 5.0
    },
    distance: 28,
    availableSeats: 1,
    totalSeats: 2,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Kleine Pendelfahrt im Tessin.'
  },
  {
    id: '15',
    from: 'Neuchâtel',
    to: 'Biel',
    date: '2026-02-17',
    time: '07:00',
    driver: 'Laurent Bernard',
    driverImage: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Peugeot 308',
      fuelType: 'diesel',
      color: 'Grau',
      consumption: 5.8
    },
    distance: 35,
    availableSeats: 2,
    totalSeats: 3,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Pendelfahrt am Bielersee entlang.'
  },
  {
    id: '16',
    from: 'Sion',
    to: 'Lausanne',
    date: '2026-02-18',
    time: '08:30',
    driver: 'Marie Fournier',
    driverImage: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=150&h=150&fit=crop',
    driverVerified: false,
    vehicle: {
      model: 'VW Tiguan',
      fuelType: 'petrol',
      color: 'Blau',
      consumption: 7.5
    },
    distance: 95,
    availableSeats: 3,
    totalSeats: 4,
    recurring: false,
    description: 'Fahrt durch das Rhonetal nach Lausanne.'
  },
  {
    id: '17',
    from: 'Aarau',
    to: 'Zürich',
    date: '2026-02-17',
    time: '07:20',
    driver: 'Stefan Zimmermann',
    driverImage: 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Audi A3',
      fuelType: 'petrol',
      color: 'Grau',
      consumption: 6.3
    },
    distance: 45,
    availableSeats: 2,
    totalSeats: 3,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Regelmässige Fahrt zur Arbeit.'
  },
  {
    id: '18',
    from: 'Zug',
    to: 'Zürich',
    date: '2026-02-17',
    time: '08:00',
    driver: 'Elena Kovac',
    driverImage: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'BMW X3',
      fuelType: 'diesel',
      color: 'Weiss',
      consumption: 7.0
    },
    distance: 28,
    availableSeats: 3,
    totalSeats: 4,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'SUV mit viel Platz für Mitfahrer.'
  },
  {
    id: '19',
    from: 'Schaffhausen',
    to: 'Zürich',
    date: '2026-02-18',
    time: '07:30',
    driver: 'Hans Müller',
    driverImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Ford Focus',
      fuelType: 'petrol',
      color: 'Blau',
      consumption: 6.5
    },
    distance: 48,
    availableSeats: 2,
    totalSeats: 3,
    recurring: false,
    description: 'Gelegentliche Fahrt nach Zürich.'
  },
  {
    id: '20',
    from: 'Olten',
    to: 'Basel',
    date: '2026-02-17',
    time: '07:45',
    driver: 'Sandra Gerber',
    driverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Skoda Fabia',
      fuelType: 'petrol',
      color: 'Grün',
      consumption: 5.3
    },
    distance: 42,
    availableSeats: 2,
    totalSeats: 2,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Kleine aber feine Pendelfahrt.'
  },
  {
    id: '21',
    from: 'Lausanne',
    to: 'Genf',
    date: '2026-02-17',
    time: '08:00',
    driver: 'Pierre Blanc',
    driverImage: 'https://images.unsplash.com/photo-1559291001-693fb9166cda?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'BMW i3',
      fuelType: 'electric',
      color: 'Weiss',
      consumption: 15.0
    },
    distance: 62,
    availableSeats: 1,
    totalSeats: 2,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Elektroauto, ruhige Fahrt.'
  },
  {
    id: '22',
    from: 'St. Gallen',
    to: 'Winterthur',
    date: '2026-02-18',
    time: '09:00',
    driver: 'Christian Bauer',
    driverImage: 'https://images.unsplash.com/photo-1522556189639-b150ed9c4330?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'VW Passat',
      fuelType: 'diesel',
      color: 'Silber',
      consumption: 6.2
    },
    distance: 55,
    availableSeats: 3,
    totalSeats: 3,
    recurring: false,
    description: 'Wochenendfahrt, entspannt.'
  },
  {
    id: '23',
    from: 'Biel',
    to: 'Neuchâtel',
    date: '2026-02-17',
    time: '17:00',
    driver: 'Isabelle Roth',
    driverImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Toyota RAV4',
      fuelType: 'hybrid',
      color: 'Grau',
      consumption: 5.5
    },
    distance: 35,
    availableSeats: 3,
    totalSeats: 4,
    recurring: true,
    recurringDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
    description: 'Rückfahrt nach Feierabend. Hybrid SUV.'
  },
  {
    id: '24',
    from: 'Zürich',
    to: 'Luzern',
    date: '2026-02-17',
    time: '18:00',
    driver: 'Robert König',
    driverImage: 'https://images.unsplash.com/photo-1564564321837-a57b7070ac4f?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Audi e-tron',
      fuelType: 'electric',
      color: 'Schwarz',
      consumption: 21.0
    },
    distance: 55,
    availableSeats: 2,
    totalSeats: 3,
    recurring: true,
    recurringDays: ['Mo', 'Mi', 'Fr'],
    description: 'Elektrisches SUV, sehr komfortabel.'
  },
  {
    id: '25',
    from: 'Basel',
    to: 'Luzern',
    date: '2026-02-18',
    time: '10:30',
    driver: 'Nina Vogel',
    driverImage: 'https://images.unsplash.com/photo-1601412436009-d964bd02edbc?w=150&h=150&fit=crop',
    driverVerified: true,
    vehicle: {
      model: 'Tesla Model Y',
      fuelType: 'electric',
      color: 'Rot',
      consumption: 18.0
    },
    distance: 95,
    availableSeats: 4,
    totalSeats: 4,
    recurring: false,
    description: 'Wochenend-Ausflug nach Luzern. Viel Platz.'
  }
];

// Calculate price per person for each ride
const mockRides: Ride[] = mockRidesRaw.map(ride => ({
  ...ride,
  pricePerPerson: calculatePricePerPerson(ride.vehicle, ride.distance, ride.totalSeats)
}));

export default function App() {
  const [rides, setRides] = useState<Ride[]>(mockRides);
  const [filteredRides, setFilteredRides] = useState<Ride[]>(mockRides);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [currentPage, setCurrentPage] = useState<string | null>(null); // For legal/info pages
  const [registrationStatus, setRegistrationStatus] = useState<'pending' | 'submitted' | 'approved'>('approved'); // Changed to 'approved' for testing
  const [userEmail, setUserEmail] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showVehicles, setShowVehicles] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState<UserData>({
    firstName: 'Anna',
    lastName: 'Müller',
    email: 'anna.mueller@example.com',
    phone: '+41 79 123 45 67',
    city: 'Solothurn',
    birthDate: '1990-05-15',
    profileImage: null,
    paymentMethods: ['twint', 'cash']
  });

  // Vehicle data state
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      id: '1',
      brand: 'VW',
      model: 'VW Golf',
      year: 2022,
      fuelType: 'petrol',
      consumption: 6.2,
      isDefault: true
    }
  ]);

  const handleRegistration = (data: RegistrationData) => {
    setUserEmail(data.email);
    setRegistrationStatus('submitted');
  };

  const handleSaveSettings = (newUserData: UserData) => {
    setUserData(newUserData);
    setShowSettings(false);
  };

  const handleAddVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle: Vehicle = {
      ...vehicle,
      id: Date.now().toString()
    };
    
    // If this is set as default, remove default from other vehicles
    if (newVehicle.isDefault) {
      setVehicles(vehicles.map(v => ({ ...v, isDefault: false })).concat(newVehicle));
    } else {
      setVehicles([...vehicles, newVehicle]);
    }
  };

  const handleUpdateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(vehicles.map(v => {
      if (v.id === id) {
        return { ...v, ...updates };
      }
      // If updating to default, remove default from others
      if (updates.isDefault) {
        return { ...v, isDefault: false };
      }
      return v;
    }));
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
  };
  
  // Show registration if not approved
  if (registrationStatus === 'pending') {
    return <RegistrationView onSubmit={handleRegistration} />;
  }

  // Show pending approval if submitted but not approved
  if (registrationStatus === 'submitted') {
    return <PendingApprovalView email={userEmail} />;
  }

  const handleSearch = (from: string, to: string, date: string) => {
    const filtered = rides.filter(ride => {
      const matchFrom = !from || ride.from.toLowerCase().includes(from.toLowerCase());
      const matchTo = !to || ride.to.toLowerCase().includes(to.toLowerCase());
      const matchDate = !date || ride.date === date;
      return matchFrom && matchTo && matchDate;
    });
    setFilteredRides(filtered);
  };

  const handleOfferRide = (newRide: Omit<Ride, 'id'>) => {
    const ride: Ride = {
      ...newRide,
      id: Date.now().toString()
    };
    setRides([ride, ...rides]);
    setFilteredRides([ride, ...filteredRides]);
    setIsOfferModalOpen(false);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToMain = () => {
    setCurrentPage(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Show legal/info pages
  if (currentPage === 'privacy') {
    return (
      <>
        <button
          onClick={handleBackToMain}
          className="fixed top-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg shadow-lg border border-gray-200 transition-colors"
        >
          ← Zurück
        </button>
        <PrivacyPolicy />
      </>
    );
  }

  if (currentPage === 'terms') {
    return (
      <>
        <button
          onClick={handleBackToMain}
          className="fixed top-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg shadow-lg border border-gray-200 transition-colors"
        >
          ← Zurück
        </button>
        <TermsOfService />
      </>
    );
  }

  if (currentPage === 'imprint') {
    return (
      <>
        <button
          onClick={handleBackToMain}
          className="fixed top-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg shadow-lg border border-gray-200 transition-colors"
        >
          ← Zurück
        </button>
        <Imprint />
      </>
    );
  }

  if (currentPage === 'faq') {
    return (
      <>
        <button
          onClick={handleBackToMain}
          className="fixed top-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg shadow-lg border border-gray-200 transition-colors"
        >
          ← Zurück
        </button>
        <FAQ />
      </>
    );
  }

  if (currentPage === 'safety') {
    return (
      <>
        <button
          onClick={handleBackToMain}
          className="fixed top-4 left-4 z-50 bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg shadow-lg border border-gray-200 transition-colors"
        >
          ← Zurück
        </button>
        <Safety />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOfferRide={() => setIsOfferModalOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <HomeView onGoToSearch={() => setActiveTab('search')} />
        )}

        {activeTab === 'search' && (
          <>
            <SearchSection onSearch={handleSearch} />
            <RidesList 
              rides={filteredRides} 
              onSelectRide={setSelectedRide}
            />
          </>
        )}

        {activeTab === 'myrides' && (
          <MyRidesView 
            rides={rides}
            onSelectRide={setSelectedRide}
          />
        )}

        {activeTab === 'profile' && !showSettings && !showVehicles && (
          <ProfileView 
            userData={userData}
            onSettingsClick={() => setShowSettings(true)}
            onVehiclesClick={() => setShowVehicles(true)}
          />
        )}

        {activeTab === 'profile' && showSettings && (
          <SettingsView
            userData={userData}
            onSave={handleSaveSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {activeTab === 'profile' && showVehicles && (
          <VehicleManagement
            vehicles={vehicles}
            onAddVehicle={handleAddVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onClose={() => setShowVehicles(false)}
          />
        )}
      </main>

      <BottomNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {isOfferModalOpen && (
        <OfferRideModal
          onClose={() => setIsOfferModalOpen(false)}
          onSubmit={handleOfferRide}
          vehicles={vehicles}
        />
      )}

      {selectedRide && (
        <RideDetailModal
          ride={selectedRide}
          onClose={() => setSelectedRide(null)}
        />
      )}

      <Footer onNavigate={handleNavigate} />
      <LiveSupport />
    </div>
  );
}