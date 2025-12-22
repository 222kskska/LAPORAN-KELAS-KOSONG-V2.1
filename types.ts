export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  STUDENT = 'STUDENT',
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string; // Optional for display, required for creation
  role: UserRole;
  name: string;
}

export interface Teacher {
  id: string;
  nama: string;
  mapel: string;
  nip?: string;    // Data Dapodik
  nuptk?: string;  // Data Dapodik
}

export interface ClassRoom {
  id: string;
  kode: string;
  nama: string;
}

export interface Report {
  id: string;
  tanggal: string; // ISO String
  kelas: string;
  guru: string;
  waktu: string;
  keterangan: string;
  fotoUrl: string;
  status: 'pending' | 'verified' | 'rejected';
}

export interface FormData {
  kelas: string;
  guru: string;
  waktu: string;
  keterangan: string;
  foto: File | null;
}