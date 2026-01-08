export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export interface AdminUser {
  id: string;
  username: string;
  password?: string; // Optional for display, required for creation
  role: UserRole;
  name: string;
  nip?: string; // NIP for teachers
  mapel?: string; // Subject for teachers
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

// Teacher Leave Types
export enum LeaveType {
  SAKIT = 'SAKIT',
  IZIN = 'IZIN',
  DINAS = 'DINAS',
  CUTI = 'CUTI',
  LAINNYA = 'LAINNYA',
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'notified';

export interface ClassAssignment {
  id: string;
  leaveId: string;
  kelasId: string;
  namaKelas: string;
  jamPelajaran: string;
  mataPelajaran: string;
  guruPengganti: string;
  guruPenggantiId?: string;
  tugas: string;
  statusPenyampaian: 'belum' | 'sudah';
  waktuDisampaikan?: string;
  disampaikanOleh?: string;
}

export interface TeacherLeave {
  id: string;
  guruId: string;
  namaGuru: string;
  nip?: string;
  mapel?: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jenisIzin: LeaveType;
  alasan: string;
  nomorSurat?: string;
  fileSurat?: string;
  status: LeaveStatus;
  disetujuiOleh?: string;
  disetujuiOlehId?: string;
  tanggalDiajukan: string;
  tanggalDisetujui?: string;
  catatan?: string;
  catatanPenyampaian?: string;
  assignments: ClassAssignment[];
}

export interface TeacherLeaveFormData {
  guruId: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jenisIzin: LeaveType;
  alasan: string;
  nomorSurat?: string;
  fileSurat?: File;
  assignments: Omit<ClassAssignment, 'id' | 'leaveId' | 'statusPenyampaian' | 'waktuDisampaikan' | 'disampaikanOleh'>[];
}