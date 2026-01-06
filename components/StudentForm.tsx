import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Hash, 
  Users, 
  Clock, 
  FileText, 
  Camera, 
  Send, 
  CheckCircle2, 
  Loader2,
  Search,
  X
} from 'lucide-react';
import { mockService } from '../services/mockService';
import { Teacher, ClassRoom, FormData } from '../types';

interface StudentFormProps {
  onBack: () => void;
}

const StudentForm: React.FC<StudentFormProps> = ({ onBack }) => {
  // State management
  const [kodeKelas, setKodeKelas] = useState('');
  const [detectedClass, setDetectedClass] = useState<ClassRoom | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [waktu, setWaktu] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load teachers and classes on mount
  useEffect(() => {
    const loadData = async () => {
      const teachersData = await mockService.getTeachers();
      setTeachers(teachersData);
      setFilteredTeachers(teachersData);
    };
    loadData();

    // Set current datetime
    const now = new Date();
    const formatted = now.toISOString().slice(0, 16);
    setWaktu(formatted);
  }, []);

  // Auto-detect class from kode
  useEffect(() => {
    const detectClass = async () => {
      if (kodeKelas.length >= 4) {
        const classes = await mockService.getClasses();
        const found = classes.find(c => c.kode === kodeKelas);
        setDetectedClass(found || null);
      } else {
        setDetectedClass(null);
      }
    };
    detectClass();
  }, [kodeKelas]);

  // Filter teachers based on search
  useEffect(() => {
    if (teacherSearch.trim() === '') {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(t => 
        t.nama.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        t.mapel.toLowerCase().includes(teacherSearch.toLowerCase())
      );
      setFilteredTeachers(filtered);
    }
  }, [teacherSearch, teachers]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous error
    setErrorMessage('');
    
    if (!detectedClass) {
      setErrorMessage('Kode kelas tidak valid. Silakan masukkan kode yang benar.');
      return;
    }

    if (!selectedTeacher) {
      setErrorMessage('Silakan pilih nama guru.');
      return;
    }

    setIsSubmitting(true);

    const formData: FormData = {
      kelas: detectedClass.nama,
      guru: selectedTeacher.nama,
      waktu: waktu,
      keterangan: keterangan,
      foto: foto
    };

    try {
      const success = await mockService.submitReport(formData);
      if (success) {
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      setErrorMessage('Gagal mengirim laporan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    // Reset form
    setKodeKelas('');
    setDetectedClass(null);
    setSelectedTeacher(null);
    setTeacherSearch('');
    setKeterangan('');
    setFoto(null);
    setFotoPreview(null);
    setErrorMessage('');
    // Reset datetime
    const now = new Date();
    const formatted = now.toISOString().slice(0, 16);
    setWaktu(formatted);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 text-slate-700 hover:text-primary font-medium group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Kembali
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-3">
              Form Laporan Kelas Kosong
            </h1>
            <p className="text-slate-600 text-sm sm:text-base">
              Silakan isi form dengan lengkap dan benar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 animate-fade-in">
                <X className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Kode Kelas */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs">1</div>
                <Hash className="w-4 h-4" />
                Kode Kelas
              </label>
              <input
                type="text"
                value={kodeKelas}
                onChange={(e) => setKodeKelas(e.target.value)}
                placeholder="Contoh: 0071, 0082, 0093"
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
              />
              {detectedClass && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Kelas terdeteksi: <strong>{detectedClass.nama}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Step 2: Nama Guru */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs">2</div>
                <Users className="w-4 h-4" />
                Nama Guru yang Tidak Hadir
              </label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={selectedTeacher ? selectedTeacher.nama : teacherSearch}
                    onChange={(e) => {
                      setTeacherSearch(e.target.value);
                      setSelectedTeacher(null);
                      setShowTeacherDropdown(true);
                    }}
                    onFocus={() => setShowTeacherDropdown(true)}
                    placeholder="Cari nama guru atau mata pelajaran..."
                    required
                    className="w-full pl-10 pr-10 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400"
                  />
                  {(teacherSearch || selectedTeacher) && (
                    <button
                      type="button"
                      onClick={() => {
                        setTeacherSearch('');
                        setSelectedTeacher(null);
                        setShowTeacherDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {showTeacherDropdown && !selectedTeacher && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map((teacher) => (
                        <button
                          key={teacher.id}
                          type="button"
                          onClick={() => {
                            setSelectedTeacher(teacher);
                            setTeacherSearch('');
                            setShowTeacherDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0"
                        >
                          <div className="font-medium text-slate-800">{teacher.nama}</div>
                          <div className="text-sm text-slate-500">{teacher.mapel}</div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-slate-500 text-sm text-center">
                        Tidak ada guru ditemukan
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Waktu */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs">3</div>
                <Clock className="w-4 h-4" />
                Waktu Laporan
              </label>
              <input
                type="datetime-local"
                value={waktu}
                readOnly
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-600 cursor-not-allowed"
              />
            </div>

            {/* Step 4: Keterangan */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs">4</div>
                <FileText className="w-4 h-4" />
                Keterangan
              </label>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Jelaskan kondisi kelas kosong, berapa lama menunggu, dll..."
                required
                rows={4}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all placeholder:text-slate-400 resize-none"
              />
            </div>

            {/* Step 5: Foto */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs">5</div>
                <Camera className="w-4 h-4" />
                Foto Bukti (Opsional)
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                  aria-label="Upload foto bukti"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  {fotoPreview ? (
                    <div className="space-y-3">
                      <img 
                        src={fotoPreview} 
                        alt="Preview" 
                        className="max-h-48 mx-auto rounded-lg shadow-md"
                      />
                      <p className="text-sm text-slate-600">Klik untuk mengganti foto</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="w-12 h-12 mx-auto text-slate-400" />
                      <p className="text-slate-600">Klik untuk upload foto</p>
                      <p className="text-xs text-slate-400">Format: JPG, PNG, JPEG</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !detectedClass || !selectedTeacher}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Kirim Laporan
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-scale-in">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              Laporan Berhasil Dikirim!
            </h2>
            <p className="text-slate-600 mb-6">
              Terima kasih telah melaporkan. Laporan Anda akan segera diverifikasi oleh admin.
            </p>
            <button
              onClick={handleCloseSuccessModal}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentForm;