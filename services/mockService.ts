import { Teacher, Report, FormData, AdminUser, UserRole, ClassRoom, TeacherLeave, TeacherLeaveFormData, LeaveType, ClassAssignment } from '../types';

// Broadcast Channel for Real-time simulation across tabs
// Menggunakan try-catch untuk kompatibilitas browser lama/environment tertentu
let broadcastChannel: BroadcastChannel | null = null;
try {
  broadcastChannel = new BroadcastChannel('siswa-connect-channel');
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment');
}

// --- DATABASE CONFIGURATION (LocalStorage) ---
const STORAGE_KEYS = {
  CLASSES: 'SC_DB_CLASSES',
  TEACHERS: 'SC_DB_TEACHERS',
  REPORTS: 'SC_DB_REPORTS',
  USERS: 'SC_DB_USERS',
  TEACHER_LEAVES: 'SC_DB_TEACHER_LEAVES'
};

// --- SEED DATA (Data Awal jika Database Kosong) ---
const SEED_CLASSES: ClassRoom[] = [
  { id: 'c1', kode: '0071', nama: 'VII-1' },
  { id: 'c2', kode: '0072', nama: 'VII-2' },
  { id: 'c3', kode: '0073', nama: 'VII-3' },
  { id: 'c4', kode: '0074', nama: 'VII-4' },
  { id: 'c5', kode: '0081', nama: 'VIII-1' },
  { id: 'c6', kode: '0082', nama: 'VIII-2' },
  { id: 'c7', kode: '0083', nama: 'VIII-3' },
  { id: 'c8', kode: '0084', nama: 'VIII-4' },
  { id: 'c9', kode: '0091', nama: 'IX-1' },
  { id: 'c10', kode: '0092', nama: 'IX-2' },
  { id: 'c11', kode: '0093', nama: 'IX-3' },
  { id: 'c12', kode: '0094', nama: 'IX-4' }
];

const SEED_TEACHERS: Teacher[] = [
  { id: '1', nama: 'Bpk. Joko Widodo', mapel: 'Matematika', nip: '19610621 198503 1 001', nuptk: '1234567890123456' },
  { id: '2', nama: 'Ibu Sri Mulyani', mapel: 'Ekonomi', nip: '19620826 198703 2 005', nuptk: '9876543210987654' },
  { id: '3', nama: 'Bpk. Ganjar Pranowo', mapel: 'Sejarah', nip: '-', nuptk: '5566778899001122' },
  { id: '4', nama: 'Ibu Retno Marsudi', mapel: 'Bahasa Inggris', nip: '19621127 198601 2 002', nuptk: '-' },
  { id: '5', nama: 'Bpk. Nadiem Makarim', mapel: 'TIK', nip: '-', nuptk: '-' },
];

const SEED_REPORTS: Report[] = [
  {
    id: 'r1',
    tanggal: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    kelas: 'IX-1',
    guru: 'Bpk. Joko Widodo',
    waktu: '1 - 2',
    keterangan: 'Guru belum hadir sampai jam ke-1 berakhir (45 menit).',
    fotoUrl: 'https://picsum.photos/200/200?random=1',
    status: 'pending'
  },
  {
    id: 'r2',
    tanggal: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    kelas: 'VIII-3',
    guru: 'Ibu Sri Mulyani',
    waktu: '5 - 6',
    keterangan: 'Hanya memberikan tugas lewat ketua kelas, guru ada rapat.',
    fotoUrl: 'https://picsum.photos/200/200?random=2',
    status: 'verified'
  }
];

const SEED_ADMIN_USERS: AdminUser[] = [
  { id: 'u1', username: 'superadmin', password: 'Samarinda88!', role: UserRole.SUPER_ADMIN, name: 'Super Administrator' },
  { id: 'u2', username: 'admin', password: 'password', role: UserRole.ADMIN, name: 'Admin Sekolah' },
  { id: 'u3', username: 'operator', password: 'password', role: UserRole.OPERATOR, name: 'Operator Piket' },
  { id: 'u4', username: 'guru1', password: 'password', role: UserRole.TEACHER, name: 'Bpk. Joko Widodo', nip: '19610621 198503 1 001', mapel: 'Matematika' },
  { id: 'u5', username: 'guru2', password: 'password', role: UserRole.TEACHER, name: 'Ibu Sri Mulyani', nip: '19620826 198703 2 005', mapel: 'Ekonomi' },
];

// --- HELPER FUNCTIONS ---
const loadFromStorage = <T>(key: string, seedData: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) {
      // Jika kosong, simpan seed data dan kembalikan
      localStorage.setItem(key, JSON.stringify(seedData));
      return seedData;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error(`Error loading ${key} from storage`, error);
    return seedData;
  }
};

const saveToStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage`, error);
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// --- INITIALIZE DATA FROM DB (LocalStorage) ---
let CLASSES: ClassRoom[] = loadFromStorage(STORAGE_KEYS.CLASSES, SEED_CLASSES);
let TEACHERS: Teacher[] = loadFromStorage(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
let REPORTS: Report[] = loadFromStorage(STORAGE_KEYS.REPORTS, SEED_REPORTS);
let ADMIN_USERS: AdminUser[] = loadFromStorage(STORAGE_KEYS.USERS, SEED_ADMIN_USERS);
let TEACHER_LEAVES: TeacherLeave[] = loadFromStorage(STORAGE_KEYS.TEACHER_LEAVES, []);

export const mockService = {
  // --- Auth & User Management ---
  login: async (username: string, password: string): Promise<AdminUser | null> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Reload users just in case they were updated in another tab
    ADMIN_USERS = loadFromStorage(STORAGE_KEYS.USERS, SEED_ADMIN_USERS);
    
    const user = ADMIN_USERS.find(u => u.username === username && u.password === password);
    if (user) {
      const { password, ...userWithoutPass } = user;
      return userWithoutPass as AdminUser;
    }
    return null;
  },

  getAdminUsers: async (): Promise<AdminUser[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    ADMIN_USERS = loadFromStorage(STORAGE_KEYS.USERS, SEED_ADMIN_USERS);
    return ADMIN_USERS.map(({ password, ...u }) => u as AdminUser);
  },

  addAdminUser: async (newUser: Omit<AdminUser, 'id'>): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (ADMIN_USERS.some(u => u.username === newUser.username)) return false;
    
    const user: AdminUser = {
      ...newUser,
      id: Math.random().toString(36).substr(2, 9)
    };
    ADMIN_USERS.push(user);
    saveToStorage(STORAGE_KEYS.USERS, ADMIN_USERS);
    return true;
  },

  deleteAdminUser: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    ADMIN_USERS = ADMIN_USERS.filter(u => u.id !== id);
    saveToStorage(STORAGE_KEYS.USERS, ADMIN_USERS);
    return true;
  },

  updatePassword: async (id: string, newPassword: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const idx = ADMIN_USERS.findIndex(u => u.id === id);
    if (idx !== -1) {
      ADMIN_USERS[idx].password = newPassword;
      saveToStorage(STORAGE_KEYS.USERS, ADMIN_USERS);
      return true;
    }
    return false;
  },

  // --- Teacher Management ---
  
  getTeachers: async (): Promise<Teacher[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    TEACHERS = loadFromStorage(STORAGE_KEYS.TEACHERS, SEED_TEACHERS);
    return [...TEACHERS];
  },

  addTeacher: async (teacher: Omit<Teacher, 'id'>): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newTeacher = { ...teacher, id: Math.random().toString(36).substr(2, 9) };
    TEACHERS.push(newTeacher);
    saveToStorage(STORAGE_KEYS.TEACHERS, TEACHERS);
    return true;
  },

  addTeachersBulk: async (teachers: Omit<Teacher, 'id'>[]): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newTeachers = teachers.map(t => ({ ...t, id: Math.random().toString(36).substr(2, 9) }));
    TEACHERS = [...TEACHERS, ...newTeachers];
    saveToStorage(STORAGE_KEYS.TEACHERS, TEACHERS);
    return true;
  },

  updateTeacher: async (teacher: Teacher): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const idx = TEACHERS.findIndex(t => t.id === teacher.id);
    if (idx !== -1) {
      TEACHERS[idx] = teacher;
      saveToStorage(STORAGE_KEYS.TEACHERS, TEACHERS);
      return true;
    }
    return false;
  },

  deleteTeacher: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    TEACHERS = TEACHERS.filter(t => t.id !== id);
    saveToStorage(STORAGE_KEYS.TEACHERS, TEACHERS);
    return true;
  },

  deleteTeachersBulk: async (ids: string[]): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    TEACHERS = TEACHERS.filter(t => !ids.includes(t.id));
    saveToStorage(STORAGE_KEYS.TEACHERS, TEACHERS);
    return true;
  },

  // --- Class Management ---

  getClasses: async (): Promise<ClassRoom[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    CLASSES = loadFromStorage(STORAGE_KEYS.CLASSES, SEED_CLASSES);
    return [...CLASSES].sort((a, b) => a.nama.localeCompare(b.nama));
  },

  addClass: async (data: {kode: string, nama: string}): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (CLASSES.some(c => c.kode === data.kode || c.nama === data.nama)) return false;
    
    CLASSES.push({
      id: Math.random().toString(36).substr(2, 9),
      kode: data.kode,
      nama: data.nama
    });
    saveToStorage(STORAGE_KEYS.CLASSES, CLASSES);
    return true;
  },

  updateClass: async (id: string, data: {kode: string, nama: string}): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const idx = CLASSES.findIndex(c => c.id === id);
    if (idx !== -1) {
      CLASSES[idx] = { ...CLASSES[idx], ...data };
      saveToStorage(STORAGE_KEYS.CLASSES, CLASSES);
      return true;
    }
    return false;
  },

  deleteClass: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    CLASSES = CLASSES.filter(c => c.id !== id);
    saveToStorage(STORAGE_KEYS.CLASSES, CLASSES);
    return true;
  },

  deleteClassesBulk: async (ids: string[]): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    CLASSES = CLASSES.filter(c => !ids.includes(c.id));
    saveToStorage(STORAGE_KEYS.CLASSES, CLASSES);
    return true;
  },

  addClassesBulk: async (newClasses: {kode: string, nama: string}[]): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const unique = newClasses.filter(nc => !CLASSES.some(c => c.kode === nc.kode || c.nama === nc.nama));
    const items = unique.map(v => ({
      id: Math.random().toString(36).substr(2, 9),
      ...v
    }));
    CLASSES = [...CLASSES, ...items];
    saveToStorage(STORAGE_KEYS.CLASSES, CLASSES);
    return true;
  },

  // --- Real-time Notification Subscription ---
  subscribeToNewReports: (callback: (report: Report) => void) => {
    if (!broadcastChannel) return () => {};

    const handler = (event: MessageEvent) => {
      if (event.data && event.data.type === 'NEW_REPORT') {
        // Sync local state when receiving message from another tab
        REPORTS = loadFromStorage(STORAGE_KEYS.REPORTS, SEED_REPORTS);
        callback(event.data.report);
      }
    };
    broadcastChannel.addEventListener('message', handler);
    return () => broadcastChannel?.removeEventListener('message', handler);
  },

  // --- Report Management (CRUD) ---

  submitReport: async (data: FormData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let fotoUrlString = `https://picsum.photos/200/200?random=${Math.random()}`;
    
    // Convert Foto to Base64 for Persistence (LocalStorage Friendly)
    if (data.foto) {
        try {
            fotoUrlString = await fileToBase64(data.foto);
        } catch (e) {
            console.error("Gagal convert gambar", e);
        }
    }

    const newReport: Report = {
      id: Math.random().toString(36).substr(2, 9),
      tanggal: new Date().toISOString(),
      kelas: data.kelas,
      guru: data.guru,
      waktu: data.waktu,
      keterangan: data.keterangan,
      fotoUrl: fotoUrlString,
      status: 'pending'
    };
    
    REPORTS.unshift(newReport); // Add to beginning
    saveToStorage(STORAGE_KEYS.REPORTS, REPORTS);
    
    if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'NEW_REPORT', report: newReport });
    }
    return true;
  },

  getReports: async (): Promise<Report[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    REPORTS = loadFromStorage(STORAGE_KEYS.REPORTS, SEED_REPORTS);
    return [...REPORTS];
  },

  deleteReport: async (id: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    REPORTS = REPORTS.filter(r => r.id !== id);
    saveToStorage(STORAGE_KEYS.REPORTS, REPORTS);
    return true;
  },

  deleteReportsBulk: async (ids: string[]): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    REPORTS = REPORTS.filter(r => !ids.includes(r.id));
    saveToStorage(STORAGE_KEYS.REPORTS, REPORTS);
    return true;
  },

  updateReportStatus: async (id: string, status: 'pending' | 'verified' | 'rejected'): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const idx = REPORTS.findIndex(r => r.id === id);
    if (idx !== -1) {
      REPORTS[idx].status = status;
      saveToStorage(STORAGE_KEYS.REPORTS, REPORTS);
      return true;
    }
    return false;
  },

  // --- Teacher Leave Management ---

  submitTeacherLeave: async (guruId: string, guruData: AdminUser, formData: TeacherLeaveFormData): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let fileSuratString: string | undefined = undefined;
    
    // Convert file to Base64 for persistence
    if (formData.fileSurat) {
      try {
        fileSuratString = await fileToBase64(formData.fileSurat);
      } catch (e) {
        console.error("Gagal convert file surat", e);
      }
    }

    const leaveId = Math.random().toString(36).substr(2, 9);
    
    // Create assignments with proper IDs
    const assignments: ClassAssignment[] = formData.assignments.map(a => ({
      id: Math.random().toString(36).substr(2, 9),
      leaveId: leaveId,
      kelasId: a.kelasId,
      namaKelas: a.namaKelas,
      jamPelajaran: a.jamPelajaran,
      mataPelajaran: a.mataPelajaran,
      guruPengganti: a.guruPengganti,
      guruPenggantiId: a.guruPenggantiId,
      tugas: a.tugas,
      statusPenyampaian: 'belum'
    }));

    const newLeave: TeacherLeave = {
      id: leaveId,
      guruId: guruId,
      namaGuru: guruData.name,
      nip: guruData.nip,
      mapel: guruData.mapel,
      tanggalMulai: formData.tanggalMulai,
      tanggalSelesai: formData.tanggalSelesai,
      jenisIzin: formData.jenisIzin,
      alasan: formData.alasan,
      nomorSurat: formData.nomorSurat,
      fileSurat: fileSuratString,
      status: 'pending',
      tanggalDiajukan: new Date().toISOString(),
      assignments: assignments
    };

    TEACHER_LEAVES.unshift(newLeave);
    saveToStorage(STORAGE_KEYS.TEACHER_LEAVES, TEACHER_LEAVES);
    return true;
  },

  getTeacherLeaves: async (): Promise<TeacherLeave[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    TEACHER_LEAVES = loadFromStorage(STORAGE_KEYS.TEACHER_LEAVES, []);
    return [...TEACHER_LEAVES];
  },

  getTeacherLeavesByGuruId: async (guruId: string): Promise<TeacherLeave[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    TEACHER_LEAVES = loadFromStorage(STORAGE_KEYS.TEACHER_LEAVES, []);
    return TEACHER_LEAVES.filter(l => l.guruId === guruId);
  },

  approveTeacherLeave: async (id: string, approvedBy: string, approvedById: string, catatan?: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const idx = TEACHER_LEAVES.findIndex(l => l.id === id);
    if (idx !== -1) {
      TEACHER_LEAVES[idx].status = 'approved';
      TEACHER_LEAVES[idx].disetujuiOleh = approvedBy;
      TEACHER_LEAVES[idx].disetujuiOlehId = approvedById;
      TEACHER_LEAVES[idx].tanggalDisetujui = new Date().toISOString();
      TEACHER_LEAVES[idx].catatan = catatan;
      saveToStorage(STORAGE_KEYS.TEACHER_LEAVES, TEACHER_LEAVES);
      return true;
    }
    return false;
  },

  rejectTeacherLeave: async (id: string, rejectedBy: string, rejectedById: string, catatan: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const idx = TEACHER_LEAVES.findIndex(l => l.id === id);
    if (idx !== -1) {
      TEACHER_LEAVES[idx].status = 'rejected';
      TEACHER_LEAVES[idx].disetujuiOleh = rejectedBy;
      TEACHER_LEAVES[idx].disetujuiOlehId = rejectedById;
      TEACHER_LEAVES[idx].tanggalDisetujui = new Date().toISOString();
      TEACHER_LEAVES[idx].catatan = catatan;
      saveToStorage(STORAGE_KEYS.TEACHER_LEAVES, TEACHER_LEAVES);
      return true;
    }
    return false;
  },

  updateAssignmentNotification: async (leaveId: string, assignmentId: string, notifiedBy: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const leaveIdx = TEACHER_LEAVES.findIndex(l => l.id === leaveId);
    if (leaveIdx !== -1) {
      const assignmentIdx = TEACHER_LEAVES[leaveIdx].assignments.findIndex(a => a.id === assignmentId);
      if (assignmentIdx !== -1) {
        TEACHER_LEAVES[leaveIdx].assignments[assignmentIdx].statusPenyampaian = 'sudah';
        TEACHER_LEAVES[leaveIdx].assignments[assignmentIdx].waktuDisampaikan = new Date().toISOString();
        TEACHER_LEAVES[leaveIdx].assignments[assignmentIdx].disampaikanOleh = notifiedBy;
        
        // Update leave status to notified if all assignments are notified
        const allNotified = TEACHER_LEAVES[leaveIdx].assignments.every(a => a.statusPenyampaian === 'sudah');
        if (allNotified) {
          TEACHER_LEAVES[leaveIdx].status = 'notified';
        }
        
        saveToStorage(STORAGE_KEYS.TEACHER_LEAVES, TEACHER_LEAVES);
        return true;
      }
    }
    return false;
  }
};