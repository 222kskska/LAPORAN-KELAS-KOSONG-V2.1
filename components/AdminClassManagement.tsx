import React, { useEffect, useState, useRef } from 'react';
import { mockService } from '../services/mockService';
import { ClassRoom, Report } from '../types';
import { Trash2, Plus, Pencil, Upload, X, Save, FileText, School, FileSpreadsheet, Download, QrCode, CheckSquare, Square, History, Calendar, User, Clock, CheckCircle, XCircle, AlertCircle, ArrowUpDown } from 'lucide-react';
import { read, utils, writeFile } from 'xlsx';

const AdminClassManagement: React.FC = () => {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [selectedClassHistory, setSelectedClassHistory] = useState<ClassRoom | null>(null);
  const [historyReports, setHistoryReports] = useState<Report[]>([]);
  const [historySortOrder, setHistorySortOrder] = useState<'asc' | 'desc'>('desc');

  // Form States
  const [formData, setFormData] = useState({ kode: '', nama: '' });
  const [bulkText, setBulkText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    const data = await mockService.getClasses();
    setClasses(data);
    setLoading(false);
    setSelectedIds([]); // Reset selection on reload
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === classes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(classes.map(c => c.id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Yakin ingin menghapus ${selectedIds.length} kelas terpilih?`)) {
      setLoading(true);
      await mockService.deleteClassesBulk(selectedIds);
      loadClasses();
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      await mockService.updateClass(editingClass.id, formData);
    } else {
      await mockService.addClass(formData);
    }
    closeModals();
    loadClasses();
  };

  // --- History Logic ---
  const openHistory = async (cls: ClassRoom) => {
    setSelectedClassHistory(cls);
    const allReports = await mockService.getReports();
    const filtered = allReports.filter(r => r.kelas === cls.nama);
    
    setHistoryReports(filtered);
    setHistorySortOrder('desc'); // Default terbaru dulu
    setShowHistoryModal(true);
  };

  // --- Import Logic ---
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lines = bulkText.trim().split('\n');
    const newClasses: {kode: string, nama: string}[] = [];
    
    lines.forEach(line => {
      const parts = line.split(/[-;,]/);
      if (parts.length >= 2) {
        newClasses.push({
          kode: parts[0].trim().toUpperCase(),
          nama: parts.slice(1).join(' ').trim().toUpperCase()
        });
      }
    });

    if (newClasses.length > 0) {
      await mockService.addClassesBulk(newClasses);
      closeModals();
      loadClasses();
      alert(`Berhasil memproses ${newClasses.length} data kelas.`);
    } else {
      alert('Tidak ada data kelas yang valid. Pastikan format: Kode - Nama');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(worksheet);
      
      const newClasses: {kode: string, nama: string}[] = [];
      let skippedCount = 0;

      jsonData.forEach((row: any) => {
        const kode = row['Kode Kelas'];
        const nama = row['Nama Kelas'];

        if (kode && nama) {
          newClasses.push({
            kode: String(kode).trim().toUpperCase(),
            nama: String(nama).trim().toUpperCase()
          });
        } else {
          skippedCount++;
        }
      });

      if (newClasses.length > 0) {
        if (skippedCount > 0) {
          alert(`Ditemukan ${newClasses.length} data valid. ${skippedCount} baris dilewati.`);
        }
        await mockService.addClassesBulk(newClasses);
        closeModals();
        loadClasses();
        alert(`Berhasil menambahkan ${newClasses.length} kelas.`);
      } else {
        alert('Tidak ada data valid ditemukan. Pastikan header Excel: "Kode Kelas" dan "Nama Kelas".');
      }

    } catch (error) {
      console.error(error);
      alert('Gagal membaca file Excel.');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadTemplate = () => {
    const ws = utils.json_to_sheet([
      { "Kode Kelas": "0071", "Nama Kelas": "VII-1" },
      { "Kode Kelas": "0072", "Nama Kelas": "VII-2" },
      { "Kode Kelas": "0091", "Nama Kelas": "IX-1" }
    ]);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data Kelas");
    writeFile(wb, "Template_Import_Kelas.xlsx");
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Hapus kelas ${name}?`)) {
      await mockService.deleteClass(id);
      loadClasses();
    }
  };

  const openEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setFormData({ kode: cls.kode, nama: cls.nama });
    setShowAddModal(true);
  };

  const openAdd = () => {
    setEditingClass(null);
    setFormData({ kode: '', nama: '' });
    setShowAddModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setShowBulkModal(false);
    setShowHistoryModal(false);
    setEditingClass(null);
    setSelectedClassHistory(null);
    setFormData({ kode: '', nama: '' });
    setBulkText('');
  };

  // Derived state for sorting history
  const sortedHistory = [...historyReports].sort((a, b) => {
    const dateA = new Date(a.tanggal).getTime();
    const dateB = new Date(b.tanggal).getTime();
    return historySortOrder === 'desc' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Kelas</h2>
          <p className="text-sm text-slate-500">Kelola daftar kelas dan kode absen</p>
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
          <div className="flex gap-2">
            <button 
              onClick={() => setShowBulkModal(true)}
              className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Import / Tambah Massal
            </button>
            <button 
              onClick={openAdd}
              className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Tambah Kelas
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
           <div className="p-8 text-center text-slate-500">Memuat data...</div>
        ) : (
          <>
            {/* Toolbar for Selection */}
            {classes.length > 0 && (
              <div className="px-6 pt-4 pb-2 flex items-center">
                 <button 
                    onClick={handleSelectAll}
                    className="text-sm font-medium text-slate-500 hover:text-primary flex items-center gap-2"
                 >
                    {selectedIds.length === classes.length && classes.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Pilih Semua
                 </button>
              </div>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-6 pt-2">
              {classes.map((cls) => {
                const isSelected = selectedIds.includes(cls.id);
                return (
                  <div 
                    key={cls.id} 
                    className={`group relative border rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      isSelected 
                      ? 'bg-blue-50 border-primary ring-1 ring-primary' 
                      : 'bg-slate-50 border-slate-200 hover:border-primary hover:shadow-md'
                    }`}
                    onClick={(e) => {
                      // Prevent toggling when clicking action buttons
                      if ((e.target as HTMLElement).closest('button')) return;
                      toggleSelect(cls.id);
                    }}
                  >
                    {/* Checkbox (Custom UI) */}
                    <div className="absolute top-2 left-2 z-10">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-primary border-primary text-white' : 'bg-white border-slate-300 text-transparent hover:border-primary'
                      }`}>
                        <CheckSquare className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                      <QrCode className="w-3 h-3" />
                      {cls.kode}
                    </div>

                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 mt-4 shadow-sm transition-colors ${
                      isSelected ? 'bg-white text-primary' : 'bg-white text-slate-600 group-hover:text-primary'
                    }`}>
                      <School className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-800 text-lg">{cls.nama}</span>
                    
                    {/* Action Buttons Overlay */}
                    {!isSelected && (
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-lg p-1 shadow-sm z-20">
                         <button 
                          onClick={(e) => { e.stopPropagation(); openHistory(cls); }}
                          className="p-1.5 hover:bg-orange-50 text-orange-600 rounded"
                          title="Lihat Riwayat Laporan"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openEdit(cls); }}
                          className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"
                          title="Edit Kelas"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(cls.id, cls.nama); }}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                          title="Hapus Kelas"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {classes.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                <FileText className="w-12 h-12 mb-3 opacity-50" />
                <p>Belum ada data kelas.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Tambah/Edit Single */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingClass ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}</h3>
              <button onClick={closeModals}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Kode Kelas</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Contoh: 0071"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none uppercase font-mono" 
                  value={formData.kode} 
                  onChange={e => setFormData({...formData, kode: e.target.value.toUpperCase()})} 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Kelas</label>
                <input 
                  required 
                  type="text" 
                  placeholder="Contoh: VII-1"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none uppercase" 
                  value={formData.nama} 
                  onChange={e => setFormData({...formData, nama: e.target.value.toUpperCase()})} 
                />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Riwayat (History) */}
      {showHistoryModal && selectedClassHistory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <School className="w-5 h-5 text-primary" />
                  Riwayat Kelas {selectedClassHistory.nama}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Kode: <span className="font-mono bg-white px-1 border rounded">{selectedClassHistory.kode}</span> • Total {historyReports.length} Laporan
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setHistorySortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                   className="flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                   title="Urutkan Tanggal"
                 >
                   <ArrowUpDown className="w-3.5 h-3.5" />
                   {historySortOrder === 'desc' ? 'Terbaru' : 'Terlama'}
                 </button>
                 <button onClick={closeModals}><X className="w-6 h-6 text-slate-400 hover:text-slate-600" /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              {sortedHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-slate-300" />
                  </div>
                  <h4 className="font-bold text-slate-700">Belum Ada Riwayat</h4>
                  <p className="text-slate-500 text-sm">Kelas ini belum pernah mengirim laporan ketidakhadiran.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-8">
                  {sortedHistory.map((report, idx) => (
                    <div key={report.id} className="relative pl-8">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                        report.status === 'verified' ? 'bg-green-500' : 
                        report.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-400'
                      }`}></div>
                      
                      <div className="bg-white rounded-lg border border-slate-100 shadow-sm p-4 hover:border-primary/30 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-2 mb-2">
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                             <Calendar className="w-3.5 h-3.5" />
                             {new Date(report.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          <span className={`self-start text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                             report.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' : 
                             report.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {report.status || 'Pending'}
                          </span>
                        </div>
                        
                        <div className="flex items-start gap-3 mb-3">
                           <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
                              {report.guru.charAt(0)}
                           </div>
                           <div>
                              <p className="font-bold text-slate-800">{report.guru}</p>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                <Clock className="w-3 h-3" /> Jam ke: {report.waktu}
                              </div>
                           </div>
                        </div>
                        
                        <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 italic border border-slate-100">
                          "{report.keterangan}"
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button 
                onClick={closeModals}
                className="bg-white border border-slate-300 text-slate-600 font-medium py-2 px-6 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Massal (Excel & Manual) */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Import Data Kelas</h3>
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
                     Upload file .xlsx dengan header kolom: <br/>
                     <code className="text-xs bg-slate-100 p-1 rounded">Kode Kelas</code> dan <code className="text-xs bg-slate-100 p-1 rounded">Nama Kelas</code>
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
                        Format: <span className="font-mono bg-slate-100 px-1">KODE - NAMA</span> per baris.
                      </p>
                      <textarea 
                        required 
                        rows={6}
                        placeholder="0071 - VII-1&#10;0072 - VII-2..."
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none font-mono text-sm uppercase mb-4 flex-grow" 
                        value={bulkText} 
                        onChange={e => setBulkText(e.target.value.toUpperCase())} 
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

export default AdminClassManagement;