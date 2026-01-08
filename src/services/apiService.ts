import axios, { AxiosInstance } from 'axios';
import { Teacher, Report, FormData, AdminUser, ClassRoom, TeacherLeave, TeacherLeaveFormData } from '../../types';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:1991/api';

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('current_user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// ============================================================
// API SERVICE
// ============================================================

export const apiService = {
  // --- Auth & User Management ---
  
  login: async (username: string, password: string): Promise<AdminUser | null> => {
    try {
      const response = await axiosInstance.post('/auth/login', { username, password });
      
      if (response.data.success) {
        // Store token and user info
        sessionStorage.setItem('auth_token', response.data.token);
        sessionStorage.setItem('current_user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('current_user');
    }
  },

  getCurrentUser: (): AdminUser | null => {
    const userStr = sessionStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getAdminUsers: async (): Promise<AdminUser[]> => {
    try {
      const response = await axiosInstance.get('/users');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Get users error:', error);
      return [];
    }
  },

  addAdminUser: async (newUser: Omit<AdminUser, 'id'>): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/users', newUser);
      return response.data.success;
    } catch (error) {
      console.error('Add user error:', error);
      return false;
    }
  },

  deleteAdminUser: async (id: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.delete(`/users/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  },

  updatePassword: async (id: string, newPassword: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.patch(`/users/${id}/password`, { newPassword });
      return response.data.success;
    } catch (error) {
      console.error('Update password error:', error);
      return false;
    }
  },

  // --- Teacher Management ---

  getTeachers: async (): Promise<Teacher[]> => {
    try {
      const response = await axiosInstance.get('/teachers');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Get teachers error:', error);
      return [];
    }
  },

  addTeacher: async (teacher: Omit<Teacher, 'id'>): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/teachers', teacher);
      return response.data.success;
    } catch (error) {
      console.error('Add teacher error:', error);
      return false;
    }
  },

  updateTeacher: async (teacher: Teacher): Promise<boolean> => {
    try {
      const response = await axiosInstance.put(`/teachers/${teacher.id}`, teacher);
      return response.data.success;
    } catch (error) {
      console.error('Update teacher error:', error);
      return false;
    }
  },

  deleteTeacher: async (id: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.delete(`/teachers/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Delete teacher error:', error);
      return false;
    }
  },

  deleteTeachersBulk: async (ids: string[]): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/teachers/bulk-delete', { ids });
      return response.data.success;
    } catch (error) {
      console.error('Bulk delete teachers error:', error);
      return false;
    }
  },

  addTeachersBulk: async (teachers: Omit<Teacher, 'id'>[]): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/teachers/bulk', { teachers });
      return response.data.success;
    } catch (error) {
      console.error('Bulk add teachers error:', error);
      return false;
    }
  },

  // --- Class Management ---

  getClasses: async (): Promise<ClassRoom[]> => {
    try {
      const response = await axiosInstance.get('/classes');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Get classes error:', error);
      return [];
    }
  },

  addClass: async (data: { kode: string; nama: string }): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/classes', data);
      return response.data.success;
    } catch (error) {
      console.error('Add class error:', error);
      return false;
    }
  },

  updateClass: async (id: string, data: { kode: string; nama: string }): Promise<boolean> => {
    try {
      const response = await axiosInstance.put(`/classes/${id}`, data);
      return response.data.success;
    } catch (error) {
      console.error('Update class error:', error);
      return false;
    }
  },

  deleteClass: async (id: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.delete(`/classes/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Delete class error:', error);
      return false;
    }
  },

  deleteClassesBulk: async (ids: string[]): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/classes/bulk-delete', { ids });
      return response.data.success;
    } catch (error) {
      console.error('Bulk delete classes error:', error);
      return false;
    }
  },

  addClassesBulk: async (classes: { kode: string; nama: string }[]): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/classes/bulk', { classes });
      return response.data.success;
    } catch (error) {
      console.error('Bulk add classes error:', error);
      return false;
    }
  },

  // --- Report Management ---

  submitReport: async (formData: FormData): Promise<boolean> => {
    try {
      let foto_base64: string | null = null;
      
      if (formData.foto) {
        foto_base64 = await fileToBase64(formData.foto);
      }

      const reportData = {
        tanggal: new Date().toISOString(),
        kelas: formData.kelas,
        guru: formData.guru,
        waktu: formData.waktu,
        keterangan: formData.keterangan,
        foto_base64,
      };

      const response = await axiosInstance.post('/reports', reportData);
      return response.data.success;
    } catch (error) {
      console.error('Submit report error:', error);
      return false;
    }
  },

  getReports: async (): Promise<Report[]> => {
    try {
      const response = await axiosInstance.get('/reports');
      if (response.data.success) {
        // Convert foto_base64 to fotoUrl for compatibility
        return response.data.data.map((report: any) => ({
          ...report,
          fotoUrl: report.foto_base64 || '',
        }));
      }
      return [];
    } catch (error) {
      console.error('Get reports error:', error);
      return [];
    }
  },

  deleteReport: async (id: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.delete(`/reports/${id}`);
      return response.data.success;
    } catch (error) {
      console.error('Delete report error:', error);
      return false;
    }
  },

  deleteReportsBulk: async (ids: string[]): Promise<boolean> => {
    try {
      const response = await axiosInstance.post('/reports/bulk-delete', { ids });
      return response.data.success;
    } catch (error) {
      console.error('Bulk delete reports error:', error);
      return false;
    }
  },

  updateReportStatus: async (id: string, status: 'pending' | 'verified' | 'rejected', note?: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.patch(`/reports/${id}/status`, { 
        status, 
        rejection_note: note 
      });
      return response.data.success;
    } catch (error) {
      console.error('Update report status error:', error);
      return false;
    }
  },

  // --- Teacher Leave Management ---

  submitTeacherLeave: async (formData: TeacherLeaveFormData): Promise<boolean> => {
    try {
      let file_surat_base64: string | null = null;
      
      if (formData.fileSurat) {
        file_surat_base64 = await fileToBase64(formData.fileSurat);
      }

      const leaveData = {
        guru_id: formData.guruId,
        tanggal_mulai: formData.tanggalMulai,
        tanggal_selesai: formData.tanggalSelesai,
        jenis_izin: formData.jenisIzin,
        alasan: formData.alasan,
        nomor_surat: formData.nomorSurat || null,
        file_surat_base64,
        assignments: formData.assignments.map((a: any) => ({
          kelas_id: null, // Will be looked up by server if needed
          nama_kelas: a.namaKelas,
          jam_pelajaran: a.jamPelajaran,
          mata_pelajaran: a.mataPelajaran,
          guru_pengganti: a.guruPengganti,
          guru_pengganti_id: a.guruPenggantiId || null,
          tugas: a.tugas,
        })),
      };

      const response = await axiosInstance.post('/teacher-leaves', leaveData);
      return response.data.success;
    } catch (error) {
      console.error('Submit teacher leave error:', error);
      return false;
    }
  },

  getTeacherLeaves: async (): Promise<TeacherLeave[]> => {
    try {
      const response = await axiosInstance.get('/teacher-leaves');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Get teacher leaves error:', error);
      return [];
    }
  },

  getTeacherLeavesByGuruId: async (guruId: string): Promise<TeacherLeave[]> => {
    try {
      const response = await axiosInstance.get(`/teacher-leaves?guru_id=${guruId}`);
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Get teacher leaves by guru error:', error);
      return [];
    }
  },

  approveTeacherLeave: async (id: string, catatan?: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.patch(`/teacher-leaves/${id}/approve`, { catatan });
      return response.data.success;
    } catch (error) {
      console.error('Approve teacher leave error:', error);
      return false;
    }
  },

  rejectTeacherLeave: async (id: string, catatan?: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.patch(`/teacher-leaves/${id}/reject`, { catatan });
      return response.data.success;
    } catch (error) {
      console.error('Reject teacher leave error:', error);
      return false;
    }
  },

  updateAssignmentNotification: async (assignmentId: string, disampaikanOleh?: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.patch(`/class-assignments/${assignmentId}/notify`, { 
        disampaikan_oleh: disampaikanOleh 
      });
      return response.data.success;
    } catch (error) {
      console.error('Update assignment notification error:', error);
      return false;
    }
  },

  // --- Real-time Updates (Polling) ---

  subscribeToNewReports: (callback: (reports: Report[]) => void): (() => void) => {
    const intervalId = setInterval(async () => {
      const reports = await apiService.getReports();
      callback(reports);
    }, 30000); // Poll every 30 seconds

    // Return cleanup function
    return () => clearInterval(intervalId);
  },
};

// Export as default and named export
export default apiService;
