import React, { useState, useEffect } from 'react';
import { mockService } from '../services/mockService';
import { Teacher, FormData, ClassRoom } from '../types';
import { CheckCircle2, AlertCircle, Search, ChevronDown, User, Clock, FileText, Camera, Upload, School } from 'lucide-react';

type StudentFormProps = {
  onBack: () => void;
};

const StudentForm: React.FC<StudentFormProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  
  const [inputCode, setInputCode] = useState('');
  const [showTeacherList, setShowTeacherList] = useState(false);
  
  const [formData, setFormData] = useState<Partial<FormData>>({
    kelas: '',
    guru: '',
    waktu: '',
    keterangan: '',
    foto: null
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [teachersData, classesData] = await Promise.all([
          mockService.getTeachers(),
          mockService.getClasses()
        ]);
        setTeachers(teachersData);
        setClasses(classesData);
        
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
        setFormData(prev => ({ ...prev, waktu: localISOTime }));
      } catch (e) {
        console.error("Gagal memuat data formulir.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase(); // Kode kelas might contain letters
    setInputCode(val);
    
    // Find class by Code
    const foundClass = classes.find(c => c.kode === val);
    
    if (foundClass) {
      setFormData(prev => ({ ...prev, kelas: foundClass.nama }));
    } else {
      setFormData(prev => ({ ...prev, kelas: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, foto: e.target.files![0] }));
    }
  };

  const filteredTeachers = teachers.filter(t => 
    t.nama.toLowerCase().includes((formData.guru || '').toLowerCase()) ||
    t.mapel.toLowerCase().includes((formData.guru || '').toLowerCase())
  );

  const handleTeacherSelect = (teacherName: string) => {
    setFormData(prev => ({ ...prev, guru: teacherName }));
    setShowTeacherList(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kelas || !formData.guru || !formData.keterangan || !formData.waktu || !formData.foto) {
      alert('Harap lengkapi semua bidang form!');
      return;
    }

    setSubmitting(true);
    try {
      await mockService.submitReport(formData as FormData);
      setShowSuccessPopup(true);
    } catch (err) {
      alert('Gagal mengirim laporan.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - offset).toISOString().slice(0, 16);
    setInputCode('');
    setFormData({
      kelas: '',
      guru: '',
      waktu: localISOTime,
      keterangan: '',
      foto: null
    });
    setShowSuccessPopup(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-500 font-medium">Memuat data...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 md:p-8 animate-fade-in-up">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Form Laporan</h2>
          <p className="text-slate-500 text-sm mt-1">Silakan isi data ketidakhadiran guru dengan benar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Kelas */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="bg-blue-100 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs">1</span>
              Kode Kelas
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputCode}
                onChange={handleCodeChange}
                placeholder="Masukkan Kode Kelas"
                className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
              />
            </div>
            {/* Class Indicator */}
            <div className={`mt-2 p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${formData.kelas ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-3">
                {formData.kelas ? (
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center">
                    <School className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kelas Terdeteksi</p>
                  <p className={`text-lg font-bold ${formData.kelas ? 'text-primary' : 'text-slate-400'}`}>
                    {formData.kelas || "---"}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 text-right">
              *Masukkan kode yang diberikan oleh admin
            </p>
          </div>

          {/* Section: Guru */}
          <div className="space-y-2 relative">
             <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="bg-blue-100 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs">2</span>
              Guru Mata Pelajaran
            </label>
            <div className="relative group">
              <Search className="absolute left-4 top-4 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                value={formData.guru}
                onChange={(e) => {
                  setFormData({ ...formData, guru: e.target.value });
                  setShowTeacherList(true);
                }}
                onFocus={() => setShowTeacherList(true)}
                onBlur={() => setTimeout(() => setShowTeacherList(false), 200)}
                placeholder="Cari nama guru..."
                className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium"
                autoComplete="off"
              />
              <ChevronDown className="absolute right-4 top-4 w-5 h-5 text-slate-400" />
            </div>

            {/* Dropdown */}
            {showTeacherList && (formData.guru || '').length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-float max-h-60 overflow-y-auto">
                {filteredTeachers.length > 0 ? (
                  filteredTeachers.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => handleTeacherSelect(t.nama)}
                      className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none flex items-center gap-3 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-50 text-primary flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{t.nama}</p>
                        <p className="text-xs text-slate-500">{t.mapel} {t.nip && t.nip !== '-' ? `• ${t.nip}` : ''}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center text-slate-500 text-sm">
                    Guru tidak ditemukan
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Waktu */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="bg-blue-100 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs">3</span>
              Waktu
            </label>
            <div className="relative">
              <Clock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="datetime-local"
                value={formData.waktu}
                readOnly
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed outline-none font-medium"
              />
            </div>
          </div>

          {/* Section: Keterangan */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="bg-blue-100 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs">4</span>
              Keterangan
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
              <textarea
                value={formData.keterangan}
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                placeholder="Deskripsikan situasi kelas saat ini..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-medium min-h-[120px] resize-y"
              ></textarea>
            </div>
          </div>

          {/* Section: Foto */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="bg-blue-100 text-primary w-5 h-5 rounded-full flex items-center justify-center text-xs">5</span>
              Bukti Foto
            </label>
            <div className="relative">
              <input
                id="foto-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <label 
                htmlFor="foto-input"
                className={`flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                  formData.foto 
                    ? 'border-green-400 bg-green-50 text-green-700' 
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:border-primary/50 hover:text-primary'
                }`}
              >
                {formData.foto ? (
                  <>
                    <CheckCircle2 className="w-8 h-8 mb-2" />
                    <span className="font-semibold text-sm truncate max-w-full px-4">{formData.foto.name}</span>
                    <span className="text-xs mt-1">Ketuk untuk ganti foto</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 mb-2" />
                    <span className="font-semibold text-sm">Ambil Foto / Upload</span>
                    <span className="text-xs mt-1 text-slate-400">Pastikan kondisi kelas terlihat</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !formData.kelas || !formData.guru}
            className="w-full py-4 px-6 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>Memproses <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span></>
            ) : (
              'Kirim Laporan'
            )}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex justify-center items-center p-4 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl text-center max-w-sm w-full shadow-2xl transform scale-100 transition-all">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Terima Kasih!</h3>
            <p className="text-slate-500 mb-8">Laporan Anda telah berhasil dikirim ke sistem guru piket.</p>
            <button 
              onClick={resetForm}
              className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentForm;