import { API_BASE_URL } from '@/constants/api';
import {
  Caregiver,
  CaregiverDTO,
  Medicine,
  MedicineDTO,
} from '@/types/ontimehealth';

export function mapMedicine(dto: MedicineDTO): Medicine {
  return {
    id: String(dto.id),
    name: dto.name,
    dosage: dto.dosage,
    time: dto.time,
    category: dto.category,
    status: dto.status,
    ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
  };
}

export function mapCaregiver(dto: CaregiverDTO): Caregiver {
  return {
    id: String(dto.id),
    name: dto.name,
    phone: dto.phone,
    relation: dto.relation,
    status: dto.status,
  };
}

export async function fetchMedicines(): Promise<Medicine[]> {
  const response = await fetch(`${API_BASE_URL}/medicines`);
  if (!response.ok) {
    throw new Error(`Gagal memuat jadwal obat (HTTP ${response.status})`);
  }
  const data: MedicineDTO[] = await response.json();
  return data.map(mapMedicine);
}

export async function fetchCaregivers(): Promise<Caregiver[]> {
  const response = await fetch(`${API_BASE_URL}/caregivers`);
  if (!response.ok) {
    throw new Error(`Gagal memuat data pendamping (HTTP ${response.status})`);
  }
  const data: CaregiverDTO[] = await response.json();
  return data.map(mapCaregiver);
}
