'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, 
  BookOpen, 
  Calendar, 
  Clock, 
  FileText, 
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  GraduationCap
} from 'lucide-react';

// Type definitions
interface FormData {
  nama: string;
  kelas: string;
  guru_mapel: string;
  mapel: string;
  tanggal: string;
  jam: string;
  keterangan: string;
}

interface ClassOption {
  value: string;
  label: string;
  grade: string;
}

// Class options organized by grade
const classOptions: ClassOption[] = [
  // Grade 10
  { value: '10A', label: 'X A', grade: '10' },
  { value: '10B', label: 'X B', grade: '10' },
  { value: '10C', label: 'X C', grade: '10' },
  { value: '10D', label: 'X D', grade: '10' },
  { value: '10E', label: 'X E', grade: '10' },
  { value: '10F', label: 'X F', grade: '10' },
  // Grade 11
  { value: '11A', label: 'XI A', grade: '11' },
  { value: '11B', label: 'XI B', grade: '11' },
  { value: '11C', label: 'XI C', grade: '11' },
  { value: '11D', label: 'XI D', grade: '11' },
  { value: '11E', label: 'XI E', grade: '11' },
  { value: '11F', label: 'XI F', grade: '11' },
  // Grade 12
  { value: '12A', label: 'XII A', grade: '12' },
  { value: '12B', label: 'XII B', grade: '12' },
  { value: '12C', label: 'XII C', grade: '12' },
  { value: '12D', label: 'XII D', grade: '12' },
  { value: '12E', label: 'XII E', grade: '12' },
  { value: '12F', label: 'XII F', grade: '12' },
];

export default function StudentForm() {
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    kelas: '',
    guru_mapel: '',
    mapel: '',
    tanggal: '',
    jam: '',
    keterangan: ''
  });

  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // Set default date and time on component mount
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    
    setFormData(prev => ({
      ...prev,
      tanggal: dateStr,
      jam: timeStr
    }));
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClassSelect = (classValue: string) => {
    setFormData(prev => ({ ...prev, kelas: classValue }));
    setShowClassDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim laporan');
      }

      setSubmitStatus('success');
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setFormData({
          nama: '',
          kelas: '',
          guru_mapel: '',
          mapel: '',
          tanggal: new Date().toISOString().split('T')[0],
          jam: new Date().toTimeString().slice(0, 5),
          keterangan: ''
        });
        setSubmitStatus('idle');
      }, 2000);
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Terjadi kesalahan');
    }
  };

  const selectedClass = classOptions.find(opt => opt.value === formData.kelas);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Kode Kelas */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-slate-700 font-semibold text-base">
          <GraduationCap className="w-5 h-5 text-primary" />
          Kode Kelas
        </label>
        <input
          type="text"
          name="kelas"
          value={formData.kelas}
          onChange={handleInputChange}
          onClick={() => setShowClassDropdown(!showClassDropdown)}
          placeholder="Pilih kelas..."
          required
          readOnly
          className="w-full pl-4 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
        />
        {showClassDropdown && (
          <div className={`mt-2 p-4 rounded-xl border flex items-center justify-between transition-all duration-300 ${formData.kelas ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-200'}`}>
            <div className="grid grid-cols-3 gap-3 w-full">
              {['10', '11', '12'].map(grade => (
                <div key={grade} className="space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wide px-2">
                    Kelas {grade === '10' ? 'X' : grade === '11' ? 'XI' : 'XII'}
                  </div>
                  <div className="space-y-1">
                    {classOptions
                      .filter(opt => opt.grade === grade)
                      .map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleClassSelect(option.value)}
                          className={`w-full px-3 py-2 rounded-lg text-left text-sm font-medium transition-all ${
                            formData.kelas === option.value
                              ? 'bg-primary text-white shadow-md'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {selectedClass && (
          <div className="flex items-center gap-2 text-sm text-primary font-medium bg-primary/5 px-4 py-2 rounded-lg">
            <CheckCircle2 className="w-4 h-4" />
            Kelas terpilih: {selectedClass.label}
          </div>
        )}
      </div>

      {/* Guru Mata Pelajaran */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-slate-700 font-semibold text-base">
          <User className="w-5 h-5 text-primary" />
          Guru Mata Pelajaran
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            name="guru_mapel"
            value={formData.guru_mapel}
            onChange={handleInputChange}
            placeholder="Masukkan nama guru..."
            required
            className="w-full pl-12 pr-10 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          />
        </div>
      </div>

      {/* Mata Pelajaran */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-slate-700 font-semibold text-base">
          <BookOpen className="w-5 h-5 text-primary" />
          Mata Pelajaran
        </label>
        <div className="relative">
          <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            name="mapel"
            value={formData.mapel}
            onChange={handleInputChange}
            placeholder="Contoh: Matematika, Bahasa Indonesia..."
            required
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          />
        </div>
      </div>

      {/* Date and Time Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tanggal */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-slate-700 font-semibold text-base">
            <Calendar className="w-5 h-5 text-primary" />
            Tanggal
          </label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              name="tanggal"
              value={formData.tanggal}
              onChange={handleInputChange}
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
        </div>

        {/* Jam */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-slate-700 font-semibold text-base">
            <Clock className="w-5 h-5 text-primary" />
            Jam
          </label>
          <div className="relative">
            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="time"
              name="jam"
              value={formData.jam}
              onChange={handleInputChange}
              required
              className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Keterangan */}
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-slate-700 font-semibold text-base">
          <FileText className="w-5 h-5 text-primary" />
          Keterangan
        </label>
        <div className="relative">
          <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
          <textarea
            name="keterangan"
            value={formData.keterangan}
            onChange={handleInputChange}
            placeholder="Jelaskan situasi kelas kosong..."
            required
            rows={4}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none min-h-[120px]"
          />
        </div>
      </div>

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{errorMessage}</p>
        </div>
      )}

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-700 text-sm font-medium">Laporan berhasil dikirim!</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitStatus === 'loading'}
        className="w-full py-4 px-6 rounded-xl bg-primary text-white font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:bg-primary-dark active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitStatus === 'loading' ? (
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
  );
}