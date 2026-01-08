import React, { useEffect, useState, useRef } from 'react';
import { Teacher } from '../types';
import { apiService } from '../src/services/apiService';
import { Trash2, Plus, Pencil, Upload, X, Save, FileText, FileSpreadsheet, Download, Search } from 'lucide-react';
import { read, utils, writeFile } from 'xlsx';

const AdminTeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form States
  const [formData, setFormData] = useState({ nama: '', mapel: '', nip: '', nuptk: '' });
  const [bulkText, setBulkText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    const data = await apiService.getTeachers();
    setTeachers(data);
    setLoading(false);
    setSelectedIds([]);
  };

  const filteredTeachers = teachers.filter(t => 
    t.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.nip?.includes(searchTerm) ||
    t.nuptk?.includes(searchTerm)
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredTeachers.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Yakin ingin menghapus ${selectedIds.length} guru terpilih?`)) {
      setLoading(true);
      await apiService.deleteTeachersBulk(selectedIds);
      loadTeachers();
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      await apiService.updateTeacher({ ...editingTeacher, ...formData });
    } else {
      await apiService.addTeacher(formData);
    }
    closeModals();
    loadTeachers();
  };

  // Handle Manual Text Import
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) return;

    const lines = bulkText.trim().split('\n');
    const newTeachers: Omit<Teacher, 'id'>[] = [];
    
    lines.forEach(line => {
      // Format: Nama - Mapel
      // ToDo: Support NIP via text separator if needed, but manual is usually just name/subject
      const parts = line.split(/[-;,]/);
      if (parts.length >= 2) {
        newTeachers.push({
          nama: parts[0].trim(),
          mapel: parts.slice(1).join(' ').trim(),
          nip: '-',
          nuptk: '-'
        });
      }
    });

    if (newTeachers.length > 0) {
      await processBulkData(newTeachers);
    } else {
      alert('Format teks tidak valid.');
    }
  };

  // Helper to fuzzy match column headers
  const findColumnValue = (row: any, possibleKeys: string[]): string => {
    const keys = Object.keys(row);
    // Exact match first
    for (const pKey of possibleKeys) {
      if (row[pKey] !== undefined) return String(row[pKey]).trim();
    }
    // Case insensitive match
    for (const key of keys) {
      const lowerKey = key.toLowerCase();
      for (const pKey of possibleKeys) {
        if (lowerKey.includes(pKey.toLowerCase())) return String(row[key]).trim();
      }
    }
    return '';
  };

  // Handle Excel Import (Smart Detection)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = utils.sheet_to_json(worksheet);
      
      const newTeachers: Omit<Teacher, 'id'>[] = [];
      let skippedCount = 0;

      jsonData.forEach((row: any) => {
        // Smart detection for Dapodik column names
        const nama = findColumnValue(row, ['Nama', 'Nama Lengkap', 'Nama Pendidik', 'nama_guru']);
        const mapel = findColumnValue(row, ['Mata Pelajaran', 'Mapel', 'Bidang Studi']);
        const nip = findColumnValue(row, ['NIP', 'NIP Baru']);
        const nuptk = findColumnValue(row, ['NUPTK', 'N.U.P.T.K']);

        if (nama) {
          newTeachers.push({
            nama: nama,
            mapel: mapel || 'Guru Mapel', // Default if mapel missing in simple list
            nip: nip || '-',
            nuptk: nuptk || '-'
          });
        } else {
          skippedCount++;
        }
      });

      if (newTeachers.length > 0) {
        if (skippedCount > 0) {
          alert(`Ditemukan ${newTeachers.length} data valid. ${skippedCount} baris dilewati.`);
        }
        await processBulkData(newTeachers);
      } else {
        alert('Tidak ada data valid ditemukan. Pastikan file Excel berisi kolom Nama Guru.');
      }

    } catch (error) {
      console.error(error);
      alert('Gagal membaca file Excel.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processBulkData = async (data: Omit<Teacher, 'id'>[]) => {
    await apiService.addTeachersBulk(data);
    closeModals();
    loadTeachers();
    alert(`Berhasil menambahkan ${data.length} guru.`);
  };

  const downloadTemplate = () => {
    const ws = utils.json_to_sheet([
      { "Nama Lengkap": "Bpk. Contoh, S.Pd", "NIP": "19800101 200501 1 001", "NUPTK": "1234567890123456", "Mata Pelajaran": "Matematika" },
      { "Nama Lengkap": "Ibu Guru, M.Pd", "NIP": "-", "NUPTK": "9876543210987654", "Mata Pelajaran": "Bahasa Indonesia" }
    ]);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data Guru");
    writeFile(wb, "Template_Import_Guru_Dapodik.xlsx");
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Hapus data guru ini?')) {
      await apiService.deleteTeacher(id);
      loadTeachers();
    }
  };

  const openEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({ 
      nama: teacher.nama, 
      mapel: teacher.mapel,
      nip: teacher.nip || '',
      nuptk: teacher.nuptk || ''
    });
    setShowAddModal(true);
  };

  const openAdd = () => {
    setEditingTeacher(null);
    setFormData({ nama: '', mapel: '', nip: '', nuptk: '' });
    setShowAddModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowBulkModal(false);
    setEditingTeacher(null);
    setFormData({ nama: '', mapel: '', nip: '', nuptk: '' });
    setBulkText('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Guru</h2>
          <p className="text-sm text-slate-500">Kelola daftar guru, NIP, dan NUPTK</p>
        </div>
        
        {selectedIds.length > 0 ? (
          <div className="flex gap-2 items-center bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 animate-fade-in">
             <span className="text-sm font-semibold text-blue-700 mr-2">{selectedIds.length} dipilih</span>
             <button 
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Hapus Terpilih
            </button>
             <button 
              onClick={() => setSelectedIds([])}
              className="text-slate-500 hover:text-slate-700 px-2 text-sm"
            >
              Batal
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setShowBulkModal(true)}
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import Data
            </button>
            <button 
              onClick={openAdd}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Guru
            </button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan Nama, NIP, atau NUPTK..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:w-80 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 w-12">
                   <input 
                    type="checkbox" 
                    className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                    checked={teachers.length > 0 && selectedIds.length === filteredTeachers.length}
                    onChange={handleSelectAll}
                   />
                </th>
                <th className="px-6 py-4 font-semibold text-slate-800">Nama Guru</th>
                <th className="px-6 py-4 font-semibold text-slate-800 hidden md:table-cell">NIP / NUPTK</th>
                <th className="px-6 py-4 font-semibold text-slate-800">Mata Pelajaran</th>
                <th className="px-6 py-4 font-semibold text-slate-800 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((teacher, index) => (
                <tr key={teacher.id} className={`hover:bg-slate-50 ${selectedIds.includes(teacher.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4">
                     <input 
                      type="checkbox" 
                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                      checked={selectedIds.includes(teacher.id)}
                      onChange={() => toggleSelect(teacher.id)}
                     />
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {teacher.nama}
                    <div className="md:hidden text-xs text-slate-400 mt-1">
                      {teacher.nip && teacher.nip !== '-' ? `NIP: ${teacher.nip}` : `NUPTK: ${teacher.nuptk || '-'}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      {teacher.nip && teacher.nip !== '-' && (
                         <span className="text-xs">NIP: <span className="font-mono text-slate-700">{teacher.nip}</span></span>
                      )}
                      {teacher.nuptk && teacher.nuptk !== '-' && (
                         <span className="text-xs">NUPTK: <span className="font-mono text-slate-700">{teacher.nuptk}</span></span>
                      )}
                      {(!teacher.nip || teacher.nip === '-') && (!teacher.nuptk || teacher.nuptk === '-') && (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {teacher.mapel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEdit(teacher)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(teacher.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTeachers.length === 0 && !loading && (
          <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
            <FileText className="w-12 h-12 mb-3 opacity-50" />
            <p>Data tidak ditemukan.</p>
          </div>
        )}
        {loading && <div className="p-8 text-center text-slate-500">Memuat data...</div>}
      </div>

      {/* Modal Tambah/Edit Single */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingTeacher ? 'Edit Data Guru' : 'Tambah Guru Baru'}</h3>
              <button onClick={closeModals}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Lengkap & Gelar</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Contoh: Bpk. Budi Santoso, S.Pd"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  value={formData.nama} 
                  onChange={e => setFormData({...formData, nama: e.target.value})} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">NIP (Opsional)</label>
                  <input 
                    type="text" 
                    placeholder="198xxxx"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                    value={formData.nip} 
                    onChange={e => setFormData({...formData, nip: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">NUPTK (Opsional)</label>
                  <input 
                    type="text" 
                    placeholder="123xxxx"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                    value={formData.nuptk} 
                    onChange={e => setFormData({...formData, nuptk: e.target.value})} 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Mata Pelajaran</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Contoh: Matematika"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  value={formData.mapel} 
                  onChange={e => setFormData({...formData, mapel: e.target.value})} 
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Massal (Manual & Excel) */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Import Data Guru</h3>
              <button onClick={closeModals}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Metode 1: Excel */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="bg-green-100 text-green-700 p-2 rounded-lg">
                       <FileSpreadsheet className="w-5 h-5" />
                     </div>
                     <h4 className="font-semibold text-slate-800">Metode 1: Upload Excel</h4>
                   </div>
                   <p className="text-sm text-slate-500 mb-4">
                     Mendukung format export <strong>Dapodik</strong> atau template custom.
                     Kolom yang dideteksi otomatis: <br/>
                     <code className="text-xs bg-slate-100 p-1 rounded">Nama</code>, <code className="text-xs bg-slate-100 p-1 rounded">NIP</code>, <code className="text-xs bg-slate-100 p-1 rounded">NUPTK</code>, <code className="text-xs bg-slate-100 p-1 rounded">Mapel</code>
                   </p>
                   
                   <div className="flex flex-col gap-3">
                     <button 
                        type="button"
                        onClick={downloadTemplate}
                        className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" /> Download Template Excel
                      </button>

                     <label className="block w-full border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors">
                        <input 
                          type="file" 
                          accept=".xlsx, .xls"
                          onChange={handleFileUpload}
                          ref={fileInputRef}
                          className="hidden" 
                        />
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-sm text-slate-600 font-medium">Klik untuk upload file</span>
                          <span className="text-xs text-slate-400 mt-1">Format: .xlsx</span>
                        </div>
                     </label>
                   </div>
                </div>

                {/* Divider for Mobile */}
                <div className="md:hidden border-t border-slate-200 my-2"></div>

                {/* Metode 2: Manual Text */}
                <div className="space-y-4">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="bg-blue-100 text-blue-700 p-2 rounded-lg">
                       <FileText className="w-5 h-5" />
                     </div>
                     <h4 className="font-semibold text-slate-800">Metode 2: Copy-Paste</h4>
                   </div>
                   
                   <form onSubmit={handleBulkSubmit} className="flex flex-col h-full">
                      <p className="text-sm text-slate-500 mb-2">
                        Format: <span className="font-mono bg-slate-100 px-1">Nama - Mapel</span> (per baris)
                        <br/><span className="text-xs text-slate-400">*NIP/NUPTK hanya via Excel atau Edit Manual</span>
                      </p>
                      <textarea 
                        rows={6}
                        placeholder="Bpk. Andi - Fisika&#10;Ibu Siti, Biologi"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm mb-4 flex-grow" 
                        value={bulkText} 
                        onChange={e => setBulkText(e.target.value)} 
                      ></textarea>
                      <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded-lg font-bold hover:bg-slate-900 flex items-center justify-center gap-2">
                        <Upload className="w-4 h-4" />
                        Proses Teks
                      </button>
                   </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeacherManagement;