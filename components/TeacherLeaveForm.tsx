import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Upload, FileText, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { AdminUser, LeaveType, TeacherLeaveFormData, ClassRoom } from '../types';
import { apiService } from '../src/services/apiService';

interface TeacherLeaveFormProps {
  teacher: AdminUser;
  onClose: () => void;
  onSuccess: () => void;
}

const TeacherLeaveForm: React.FC<TeacherLeaveFormProps> = ({ teacher, onClose, onSuccess }) => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<TeacherLeaveFormData>({
    tanggalMulai: '',
    tanggalSelesai: '',
    jenisIzin: LeaveType.SAKIT,
    alasan: '',
    nomorSurat: '',
    assignments: []
  });

  const [fileSurat, setFileSurat] = useState<File | null>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const data = await apiService.getClasses();
    setClasses(data);
  };

  const addAssignment = () => {
    setFormData({
      ...formData,
      assignments: [
        ...formData.assignments,
        {
          kelasId: '',
          namaKelas: '',
          jamPelajaran: '',
          mataPelajaran: '',
          guruPengganti: '',
          tugas: ''
        }
      ]
    });
  };

  const removeAssignment = (index: number) => {
    setFormData({
      ...formData,
      assignments: formData.assignments.filter((_, i) => i !== index)
    });
  };

  const updateAssignment = (index: number, field: string, value: string) => {
    const newAssignments = [...formData.assignments];
    if (field === 'kelasId') {
      const selectedClass = classes.find(c => c.id === value);
      newAssignments[index] = {
        ...newAssignments[index],
        kelasId: value,
        namaKelas: selectedClass?.nama || ''
      };
    } else {
      newAssignments[index] = {
        ...newAssignments[index],
        [field]: value
      };
    }
    setFormData({ ...formData, assignments: newAssignments });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Format file harus PDF, JPG, atau PNG');
        return;
      }
      setFileSurat(file);
      setError('');
    }
  };

  const validateForm = (): boolean => {
    if (!formData.tanggalMulai || !formData.tanggalSelesai) {
      setError('Tanggal mulai dan selesai harus diisi');
      return false;
    }
    if (new Date(formData.tanggalMulai) > new Date(formData.tanggalSelesai)) {
      setError('Tanggal mulai tidak boleh lebih dari tanggal selesai');
      return false;
    }
    if (!formData.alasan.trim()) {
      setError('Alasan izin harus diisi');
      return false;
    }
    if (formData.assignments.length === 0) {
      setError('Minimal harus ada 1 penugasan kelas');
      return false;
    }
    // Validate each assignment
    for (let i = 0; i < formData.assignments.length; i++) {
      const a = formData.assignments[i];
      if (!a.kelasId || !a.jamPelajaran || !a.mataPelajaran || !a.guruPengganti || !a.tugas) {
        setError(`Penugasan kelas ke-${i + 1} belum lengkap`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData: TeacherLeaveFormData = {
        ...formData,
        fileSurat: fileSurat || undefined
      };
      
      await apiService.submitTeacherLeave(submitData);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err) {
      setError('Gagal mengajukan izin. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const jamPelajaranOptions = [
    'Jam 1-2',
    'Jam 3-4',
    'Jam 5-6',
    'Jam 7-8'
  ];

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Berhasil!</h3>
          <p className="text-slate-600">Pengajuan izin telah disubmit dan menunggu persetujuan admin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl my-8 animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-green-50 to-emerald-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Ajukan Izin Guru</h2>
            <p className="text-sm text-slate-600 mt-1">Lengkapi form di bawah untuk mengajukan izin</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Teacher Info Section */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Data Guru
            </h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Nama:</span>
                <span className="ml-2 font-semibold text-slate-800">{teacher.name}</span>
              </div>
              <div>
                <span className="text-slate-500">NIP:</span>
                <span className="ml-2 font-semibold text-slate-800">{teacher.nip || '-'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">Mata Pelajaran:</span>
                <span className="ml-2 font-semibold text-slate-800">{teacher.mapel || '-'}</span>
              </div>
            </div>
          </div>

          {/* Leave Period Section */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3">Periode Izin</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Tanggal Mulai *</label>
                <input
                  type="date"
                  value={formData.tanggalMulai}
                  onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Tanggal Selesai *</label>
                <input
                  type="date"
                  value={formData.tanggalSelesai}
                  onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                  required
                />
              </div>
            </div>
          </div>

          {/* Leave Details Section */}
          <div>
            <h3 className="font-bold text-slate-800 mb-3">Detail Izin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Jenis Izin *</label>
                <select
                  value={formData.jenisIzin}
                  onChange={(e) => setFormData({ ...formData, jenisIzin: e.target.value as LeaveType })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                  required
                >
                  <option value={LeaveType.SAKIT}>Sakit</option>
                  <option value={LeaveType.IZIN}>Izin</option>
                  <option value={LeaveType.DINAS}>Dinas</option>
                  <option value={LeaveType.CUTI}>Cuti</option>
                  <option value={LeaveType.LAINNYA}>Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Alasan *</label>
                <textarea
                  value={formData.alasan}
                  onChange={(e) => setFormData({ ...formData, alasan: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all resize-none"
                  placeholder="Jelaskan alasan izin..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Nomor Surat (Opsional)</label>
                <input
                  type="text"
                  value={formData.nomorSurat}
                  onChange={(e) => setFormData({ ...formData, nomorSurat: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none transition-all"
                  placeholder="Contoh: 123/SK/2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">Upload Surat (Opsional)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                  <input
                    type="file"
                    id="fileSurat"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="fileSurat" className="cursor-pointer">
                    {fileSurat ? (
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <FileText className="w-5 h-5" />
                        <span className="font-medium">{fileSurat.name}</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-600">Klik untuk upload file</p>
                        <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Class Assignments Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">Penugasan Kelas *</h3>
              <button
                type="button"
                onClick={addAssignment}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                Tambah Kelas
              </button>
            </div>

            {formData.assignments.length === 0 ? (
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                <p className="text-slate-500">Belum ada penugasan kelas. Klik "Tambah Kelas" untuk menambah.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.assignments.map((assignment, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-700">Penugasan {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeAssignment(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Kelas *</label>
                        <select
                          value={assignment.kelasId}
                          onChange={(e) => updateAssignment(index, 'kelasId', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                          required
                        >
                          <option value="">Pilih Kelas</option>
                          {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.nama}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Jam Pelajaran *</label>
                        <select
                          value={assignment.jamPelajaran}
                          onChange={(e) => updateAssignment(index, 'jamPelajaran', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                          required
                        >
                          <option value="">Pilih Jam</option>
                          {jamPelajaranOptions.map(jam => (
                            <option key={jam} value={jam}>{jam}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Mata Pelajaran *</label>
                        <input
                          type="text"
                          value={assignment.mataPelajaran}
                          onChange={(e) => updateAssignment(index, 'mataPelajaran', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                          placeholder="Contoh: Matematika"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Guru Pengganti *</label>
                        <input
                          type="text"
                          value={assignment.guruPengganti}
                          onChange={(e) => updateAssignment(index, 'guruPengganti', e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm"
                          placeholder="Nama guru pengganti"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Tugas untuk Siswa *</label>
                        <textarea
                          value={assignment.tugas}
                          onChange={(e) => updateAssignment(index, 'tugas', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none text-sm resize-none"
                          placeholder="Jelaskan tugas yang harus dikerjakan siswa..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Mengirim...' : 'Ajukan Izin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherLeaveForm;
