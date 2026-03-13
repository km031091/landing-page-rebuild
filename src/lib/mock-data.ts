export interface Service {
  id: string;
  name: string;
  duration: number;
  price?: number;
}

export interface Appointment {
  id: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'cancelled';
}

export const mockServices: Service[] = [
  { id: '1', name: 'Corte Masculino', duration: 30, price: 35 },
  { id: '2', name: 'Barba', duration: 20, price: 25 },
  { id: '3', name: 'Corte + Barba', duration: 45, price: 55 },
  { id: '4', name: 'Sobrancelha', duration: 15, price: 15 },
];

export const mockAppointments: Appointment[] = [
  { id: '1', clientName: 'João Silva', serviceId: '1', serviceName: 'Corte Masculino', date: '2026-03-12', time: '09:00', status: 'confirmed' },
  { id: '2', clientName: 'Carlos Souza', serviceId: '3', serviceName: 'Corte + Barba', date: '2026-03-12', time: '10:00', status: 'confirmed' },
  { id: '3', clientName: 'Pedro Lima', serviceId: '2', serviceName: 'Barba', date: '2026-03-12', time: '11:00', status: 'confirmed' },
  { id: '4', clientName: 'Ricardo Alves', serviceId: '1', serviceName: 'Corte Masculino', date: '2026-03-12', time: '14:00', status: 'confirmed' },
  { id: '5', clientName: 'Marcos Santos', serviceId: '4', serviceName: 'Sobrancelha', date: '2026-03-12', time: '15:00', status: 'cancelled' },
  { id: '6', clientName: 'André Costa', serviceId: '3', serviceName: 'Corte + Barba', date: '2026-03-13', time: '09:00', status: 'confirmed' },
  { id: '7', clientName: 'Lucas Ferreira', serviceId: '1', serviceName: 'Corte Masculino', date: '2026-03-13', time: '10:30', status: 'confirmed' },
];

export const availableTimes = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];
