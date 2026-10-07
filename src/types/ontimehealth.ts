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

// DTO: bentuk JSON mentah dari server (json-server). Field created_at/updated_at
// tidak dibutuhkan UI dan dibuang saat mapping (src/services/ontimehealth-api.ts).
export interface MedicineDTO {
  id: number; // json-server memakai id numerik
  name: string;
  dosage: string;
  time: string;
  category: 'Pagi' | 'Siang' | 'Malam' | 'Custom';
  status: 'diminum' | 'menunggu' | 'terlewat';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CaregiverDTO {
  id: number;
  name: string;
  phone: string;
  relation: string;
  status: 'online' | 'offline';
  created_at: string;
  updated_at: string;
}
