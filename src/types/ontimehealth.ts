export type UserRole = 'pasien' | 'pendamping';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  category: 'Pagi' | 'Siang' | 'Malam' | 'Custom';
  status: 'diminum' | 'menunggu' | 'terlewat';
  notes?: string;
}

export interface Caregiver {
  id: string;
  name: string;
  phone: string;
  relation: string;
  status: 'online' | 'offline';
}

export interface PatientSummary {
  name: string;
  familyCode: string;
  todayComplianceRate: number; // percentage e.g. 75%
  totalMedicinesToday: number;
  takenCount: number;
}
