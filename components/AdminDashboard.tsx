import React, { useEffect, useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Search, Download, ExternalLink, Calendar, Clock, LayoutDashboard, Users, LogOut, AlertOctagon, UserCog, School, ArrowUpDown, Bell, Check, Menu, X, ChevronRight, Trash2, CheckCircle, XCircle, MoreVertical, FileSpreadsheet, Instagram, ClipboardList, Eye, FileText } from 'lucide-react';
import { apiService } from '../src/services/apiService';
import { Report, AdminUser, UserRole, TeacherLeave, LeaveType } from '../types';
import AdminUserManagement from './AdminUserManagement';
import AdminTeacherManagement from './AdminTeacherManagement';
import AdminClassManagement from './AdminClassManagement';
import { utils, writeFile } from 'xlsx';

interface AdminDashboardProps {
  user: AdminUser;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const canManageUsers = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.ADMIN;
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'teachers' | 'classes' | 'leaves'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar toggle
  const [isDesktopOpen, setIsDesktopOpen] = useState(true); // Desktop sidebar toggle
  
  const [reports, setReports] = useState<Report[]>([]);
  const [teacherLeaves, setTeacherLeaves] = useState<TeacherLeave[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<TeacherLeave | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Notification State
  const [notifications, setNotifications] = useState<Report[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Sorting State
  const [sortKey, setSortKey] = useState<'tanggal' | 'guru' | 'kelas'>('tanggal');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadReports();
    } else if (activeTab === 'leaves') {
      loadTeacherLeaves();
    }
  }, [activeTab]);

  // Real-time listener
  useEffect(() => {
    const unsubscribe = apiService.subscribeToNewReports((newReports) => {
      // Get only new reports
      const newItems = newReports.filter(r => !reports.some(existing => existing.id === r.id));
      if (newItems.length > 0) {
        setNotifications(prev => [...newItems, ...prev]);
        setReports(newReports);
      }
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const data = await apiService.getReports();
    setReports(data);
    setLoading(false);
    setSelectedIds([]);
  };

  const loadTeacherLeaves = async () => {
    setLoading(true);
    const data = await apiService.getTeacherLeaves();
    setTeacherLeaves(data);
    setLoading(false);
  };

  const deleteReport = async (id: string) => {
    if (window.confirm('Apakah anda yakin ingin menghapus laporan ini?')) {
      await apiService.deleteReport(id);
      loadReports();
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Yakin ingin menghapus ${selectedIds.length} laporan terpilih?`)) {
      await apiService.deleteReportsBulk(selectedIds);
      loadReports();
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(reports.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const updateStatus = async (id: string, status: 'verified' | 'rejected' | 'pending') => {
    await apiService.updateReportStatus(id, status);
    loadReports();
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifDropdown(false);
  };

  // Logic Calculations
  const reportsByTeacher = reports.reduce((acc, curr) => {
    acc[curr.guru] = (acc[curr.guru] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(reportsByTeacher).map(key => ({
    name: key.split(' ').slice(0, 2).join(' '),
    fullName: key,
    count: reportsByTeacher[key]
  }));

  const filteredReports = reports.filter(r => 
    r.guru.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedReports = [...filteredReports].sort((a, b) => {
    const modifier = sortOrder === 'asc' ? 1 : -1;
    if (sortKey === 'tanggal') return (new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime()) * modifier;
    if (sortKey === 'guru') return a.guru.localeCompare(b.guru) * modifier;
    if (sortKey === 'kelas') return a.kelas.localeCompare(b.kelas) * modifier;
    return 0;
  });

  // --- DOWNLOAD LOGIC ---
  const handleDownloadReports = () => {
    if (sortedReports.length === 0) {
      alert("Tidak ada data laporan untuk diunduh.");
      return;
    }

    // Format data for Excel
    const dataToExport = sortedReports.map((r, index) => ({
      "No": index + 1,
      "Tanggal": new Date(r.tanggal).toLocaleDateString('id-ID'),
      "Waktu Lapor": new Date(r.tanggal).toLocaleTimeString('id-ID'),
      "Guru": r.guru,
      "Kelas": r.kelas,
      "Jam Pelajaran": r.waktu,
      "Keterangan": r.keterangan,
      "Status": r.status === 'verified' ? 'Diterima' : r.status === 'rejected' ? 'Ditolak' : 'Menunggu',
      "Link Foto": r.fotoUrl
    }));

    const ws = utils.json_to_sheet(dataToExport);
    
    // Auto-width columns roughly
    const wscols = [
      {wch: 5},  // No
      {wch: 15}, // Tanggal
      {wch: 15}, // Waktu
      {wch: 30}, // Guru
      {wch: 10}, // Kelas
      {wch: 15}, // Jam Pelajaran
      {wch: 50}, // Keterangan
      {wch: 15}, // Status
      {wch: 30}, // Link
    ];
    ws['!cols'] = wscols;

    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Laporan Absensi");
    
    const filename = `Laporan_SiswaConnect_${new Date().toISOString().slice(0,10)}.xlsx`;
    writeFile(wb, filename);
  };

  const COLORS = ['#4361ee', '#3f37c9', '#4cc9f0', '#7209b7'];

  // Teacher Leave Helper Functions
  const handleApproveLeave = async (leaveId: string, catatan?: string) => {
    await apiService.approveTeacherLeave(leaveId, catatan);
    loadTeacherLeaves();
    setSelectedLeave(null);
  };

  const handleRejectLeave = async (leaveId: string, catatan: string) => {
    if (!catatan.trim()) {
      alert('Catatan penolakan harus diisi');
      return;
    }
    await apiService.rejectTeacherLeave(leaveId, catatan);
    loadTeacherLeaves();
    setSelectedLeave(null);
  };

  const handleNotifyClass = async (leaveId: string, assignmentId: string) => {
    await apiService.updateAssignmentNotification(assignmentId, user.name);
    loadTeacherLeaves();
    // Refresh selected leave if it's open
    if (selectedLeave && selectedLeave.id === leaveId) {
      const updated = await apiService.getTeacherLeaves();
      const updatedLeave = updated.find(l => l.id === leaveId);
      if (updatedLeave) {
        setSelectedLeave(updatedLeave);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock, label: 'Menunggu' },
      approved: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: 'Disetujui' },
      rejected: { color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle, label: 'Ditolak' },
      notified: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle, label: 'Tersampaikan' },
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {badge.label}
      </span>
    );
  };

  const getJenisIzinLabel = (jenis: LeaveType) => {
    const labels = {
      [LeaveType.SAKIT]: 'Sakit',
      [LeaveType.IZIN]: 'Izin',
      [LeaveType.DINAS]: 'Dinas',
      [LeaveType.CUTI]: 'Cuti',
      [LeaveType.LAINNYA]: 'Lainnya',
    };
    return labels[jenis] || jenis;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const pendingLeavesCount = teacherLeaves.filter(l => l.status === 'pending').length;

  // Navigation Item Component
  const NavItem = ({ id, label, icon: Icon, badge }: any) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false); // Auto hide sidebar on mobile when item clicked
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
        activeTab === id 
          ? 'bg-primary text-white shadow-lg shadow-primary/30' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="whitespace-nowrap">{label}</span>
      {badge && badge > 0 && (
        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-bold ${
          activeTab === id ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
        }`}>
          {badge}
        </span>
      )}
      {activeTab === id && !badge && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
  );

  const toggleSidebar = () => {
    if (window.innerWidth >= 768) {
      setIsDesktopOpen(!isDesktopOpen);
    } else {
      setIsSidebarOpen(!isSidebarOpen);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 
        bg-white border-r border-slate-200 
        shadow-xl md:shadow-none 
        transition-all duration-300 ease-in-out
        overflow-hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${isDesktopOpen ? 'w-64' : 'w-64 md:w-0 md:border-none'}
      `}>
        <div className={`h-full flex flex-col ${!isDesktopOpen ? 'md:invisible' : ''} transition-all duration-200`}>
          {/* Logo Area */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100 flex-shrink-0">
            <div className="bg-primary/10 p-2 rounded-lg">
              <School className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight whitespace-nowrap">SiswaConnect</span>
          </div>

          {/* User Profile Mini */}
          <div className="p-6 pb-2 overflow-y-auto">
             <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-xs text-slate-500 font-medium capitalize truncate">{user.role.replace('_', ' ').toLowerCase()}</p>
                </div>
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">Menu Utama</p>
             <div className="space-y-1">
                <NavItem id="dashboard" label="Laporan" icon={LayoutDashboard} />
                <NavItem id="leaves" label="Izin Guru" icon={ClipboardList} badge={pendingLeavesCount > 0 ? pendingLeavesCount : undefined} />
                {canManageUsers && (
                  <>
                    <NavItem id="teachers" label="Data Guru" icon={UserCog} />
                    <NavItem id="classes" label="Data Kelas" icon={School} />
                    <NavItem id="users" label="Pengguna" icon={Users} />
                  </>
                )}
             </div>
          </div>

          <div className="mt-auto p-6 border-t border-slate-100 flex-shrink-0 flex flex-col gap-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-nowrap">Keluar</span>
            </button>
            
            <a 
              href="https://www.instagram.com/arifwbo/" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-pink-600 transition-colors group pb-2"
            >
              <span>Created by</span>
              <span className="font-bold group-hover:underline">ArifWbo</span>
              <Instagram className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative transition-all duration-300">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-30">
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg focus:outline-none"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden md:block">
              {activeTab === 'dashboard' && 'Dashboard Laporan'}
              {activeTab === 'leaves' && 'Izin Guru'}
              {activeTab === 'teachers' && 'Manajemen Guru'}
              {activeTab === 'classes' && 'Manajemen Kelas'}
              {activeTab === 'users' && 'Manajemen Pengguna'}
            </h1>
            <h1 className="text-lg font-bold text-slate-800 md:hidden">SiswaConnect</h1>
          </div>

          <div className="flex items-center gap-4">
             {/* Notification Bell */}
            <div className="relative" ref={notifDropdownRef}>
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-slate-500 hover:bg-slate-100 hover:text-primary rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-float border border-slate-100 z-50 overflow-hidden animate-fade-in-up">
                  <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-semibold text-sm text-slate-800">Notifikasi ({notifications.length})</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={clearNotifications}
                        className="text-xs text-primary hover:text-primary-dark font-medium flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Tandai dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        Tidak ada laporan baru
                      </div>
                    ) : (
                      <ul className="divide-y divide-slate-50">
                        {notifications.map((notif, idx) => (
                          <li key={`${notif.id}-${idx}`} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-500">
                                <AlertOctagon className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800 line-clamp-1">{notif.guru}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">Kelas {notif.kelas}</span>
                                  <span className="text-xs text-slate-400">• {new Date(notif.tanggal).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="hidden md:block w-px h-8 bg-slate-200"></div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-800">{user.name}</span>
              <span className="text-xs text-slate-500 capitalize">{user.role.toLowerCase()}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
           <div className="max-w-7xl mx-auto space-y-6">
              
              {/* CONTENT SWITCHER */}
              {activeTab === 'users' && canManageUsers ? (
                <AdminUserManagement currentUser={user} />
              ) : activeTab === 'teachers' && canManageUsers ? (
                <AdminTeacherManagement />
              ) : activeTab === 'classes' && canManageUsers ? (
                <AdminClassManagement />
              ) : activeTab === 'leaves' ? (
                /* TEACHER LEAVES VIEW */
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                      <h2 className="text-xl font-bold text-slate-800">Pengajuan Izin Guru</h2>
                      <p className="text-sm text-slate-600 mt-1">
                        Kelola pengajuan izin dari guru dan tandai penyampaian ke kelas
                      </p>
                    </div>

                    {loading ? (
                      <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-500">Memuat data...</p>
                      </div>
                    ) : teacherLeaves.length === 0 ? (
                      <div className="p-12 text-center">
                        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Belum ada pengajuan izin guru</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-200">
                        {teacherLeaves.map((leave) => (
                          <div key={leave.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-lg font-bold text-slate-800">{leave.namaGuru}</h3>
                                  {getStatusBadge(leave.status)}
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-400" />
                                    <span>{formatDate(leave.tanggalMulai)} - {formatDate(leave.tanggalSelesai)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    <span>{getJenisIzinLabel(leave.jenisIzin)}</span>
                                  </div>
                                  {leave.nip && (
                                    <div>
                                      <span className="text-slate-500">NIP:</span>
                                      <span className="ml-1 font-medium">{leave.nip}</span>
                                    </div>
                                  )}
                                  {leave.mapel && (
                                    <div>
                                      <span className="text-slate-500">Mapel:</span>
                                      <span className="ml-1 font-medium">{leave.mapel}</span>
                                    </div>
                                  )}
                                </div>
                                <p className="mt-2 text-sm text-slate-700">
                                  <span className="font-semibold">Alasan:</span> {leave.alasan}
                                </p>
                                {leave.nomorSurat && (
                                  <p className="mt-1 text-sm text-slate-600">
                                    <span className="font-semibold">No. Surat:</span> {leave.nomorSurat}
                                  </p>
                                )}
                                <p className="mt-2 text-xs text-slate-500">
                                  {leave.assignments.length} kelas terpengaruh
                                </p>
                              </div>
                              <button
                                onClick={() => setSelectedLeave(leave)}
                                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Detail
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* DASHBOARD VIEW */
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-50 rounded-xl">
                          <AlertOctagon className="w-6 h-6 text-red-500" />
                        </div>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">+2 hari ini</span>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">Total Laporan</p>
                      <h3 className="text-3xl font-bold text-slate-800">{reports.length}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 hover:shadow-lg transition-shadow">
                       <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-50 rounded-xl">
                          <UserCog className="w-6 h-6 text-orange-500" />
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">Guru Terlapor</p>
                      <h3 className="text-3xl font-bold text-slate-800">{Object.keys(reportsByTeacher).length}</h3>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 hover:shadow-lg transition-shadow">
                       <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue-50 rounded-xl">
                          <Calendar className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-xs font-bold text-primary bg-blue-50 px-2 py-1 rounded-full">Live</span>
                      </div>
                      <p className="text-slate-500 text-sm font-medium">Laporan Hari Ini</p>
                      <h3 className="text-3xl font-bold text-slate-800">
                        {reports.filter(r => new Date(r.tanggal).toDateString() === new Date().toDateString()).length}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Table Section */}
                    <div className="xl:col-span-2 bg-white rounded-2xl shadow-card border border-slate-100 flex flex-col h-[600px]">
                      {/* Table Header & Filters */}
                      <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                        <h3 className="font-bold text-lg text-slate-800">Aktivitas Terbaru</h3>
                        
                        {selectedIds.length > 0 && (
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 animate-fade-in mr-auto sm:ml-4">
                            <span className="text-xs font-bold text-blue-700">{selectedIds.length} dipilih</span>
                            <button 
                              onClick={handleBulkDelete}
                              className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Hapus
                            </button>
                            <button 
                              onClick={() => setSelectedIds([])}
                              className="text-xs text-slate-500 hover:text-slate-700"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          <div className="relative">
                             <select 
                                value={`${sortKey}-${sortOrder}`}
                                onChange={(e) => {
                                  const [key, order] = e.target.value.split('-');
                                  setSortKey(key as any);
                                  setSortOrder(order as any);
                                }}
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 appearance-none cursor-pointer hover:bg-slate-100 focus:outline-none"
                              >
                                <option value="tanggal-desc">Terbaru</option>
                                <option value="guru-asc">Guru (A-Z)</option>
                                <option value="kelas-asc">Kelas</option>
                              </select>
                              <ArrowUpDown className="absolute right-2.5 top-2.5 w-4 h-4 text-slate-400 pointer-events-none" />
                          </div>
                          
                          <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Cari..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="w-full sm:w-48 pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Responsive Table Wrapper */}
                      <div className="flex-1 overflow-auto">
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-slate-50 sticky top-0 z-10">
                            <tr>
                              <th className="px-6 py-4 w-12">
                                 <input 
                                  type="checkbox" 
                                  className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                  checked={reports.length > 0 && selectedIds.length === reports.length}
                                  onChange={handleSelectAll}
                                 />
                              </th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Guru</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Kelas & Waktu</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">Ket</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {loading ? (
                              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Memuat data...</td></tr>
                            ) : sortedReports.length === 0 ? (
                               <tr><td colSpan={6} className="p-8 text-center text-slate-500">Data tidak ditemukan</td></tr>
                            ) : (
                              sortedReports.map((report) => (
                                <tr key={report.id} className={`hover:bg-slate-50 transition-colors group ${selectedIds.includes(report.id) ? 'bg-blue-50/50' : ''}`}>
                                  <td className="px-6 py-4">
                                     <input 
                                      type="checkbox" 
                                      className="rounded border-slate-300 text-primary focus:ring-primary h-4 w-4"
                                      checked={selectedIds.includes(report.id)}
                                      onChange={() => toggleSelect(report.id)}
                                     />
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                                        {report.guru.charAt(0)}
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-900 text-sm">{report.guru}</p>
                                        <p className="text-xs text-slate-400">{new Date(report.tanggal).toLocaleDateString()}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-primary mb-1">
                                      {report.kelas}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                      <Clock className="w-3 h-3" /> {report.waktu}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 hidden md:table-cell">
                                    <p className="text-sm text-slate-600 truncate max-w-[150px]" title={report.keterangan}>
                                      "{report.keterangan}"
                                    </p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                      report.status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' :
                                      report.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                      'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    }`}>
                                      {report.status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
                                      {report.status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                                      {(!report.status || report.status === 'pending') && 'Menunggu'}
                                      {report.status === 'verified' && 'Diterima'}
                                      {report.status === 'rejected' && 'Ditolak'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <a 
                                        href={report.fotoUrl} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        title="Lihat Bukti"
                                        className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-primary rounded transition-colors"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </a>
                                      
                                      {report.status !== 'verified' && (
                                        <button 
                                          onClick={() => updateStatus(report.id, 'verified')}
                                          title="Verifikasi"
                                          className="p-1.5 hover:bg-green-50 text-green-600 rounded transition-colors"
                                        >
                                          <Check className="w-4 h-4" />
                                        </button>
                                      )}
                                      
                                      {report.status !== 'rejected' && (
                                        <button 
                                          onClick={() => updateStatus(report.id, 'rejected')}
                                          title="Tolak"
                                          className="p-1.5 hover:bg-orange-50 text-orange-600 rounded transition-colors"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      )}

                                      <button 
                                        onClick={() => deleteReport(report.id)}
                                        title="Hapus"
                                        className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Chart & Actions */}
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100 h-80 flex flex-col">
                        <h3 className="font-bold text-slate-800 mb-6">Statistik Ketidakhadiran</h3>
                        <div className="flex-1 -ml-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" barSize={15}>
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                              <XAxis type="number" hide />
                              <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                              <Tooltip 
                                cursor={{fill: 'transparent'}}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                              />
                              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                         <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileSpreadsheet className="w-24 h-24" />
                         </div>
                         <h3 className="font-bold text-lg mb-2 relative z-10">Unduh Laporan</h3>
                         <p className="text-slate-300 text-sm mb-6 relative z-10">
                           Export {sortedReports.length > 0 ? sortedReports.length : ''} data kehadiran ke Excel (.xlsx) untuk arsip sekolah.
                         </p>
                         <button 
                            onClick={handleDownloadReports}
                            className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 relative z-10 active:scale-[0.98]"
                         >
                            <Download className="w-4 h-4" /> Unduh Excel
                         </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Teacher Leave Detail Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-4xl my-8 animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Detail Izin Guru</h2>
                <p className="text-sm text-slate-600 mt-1">{selectedLeave.namaGuru}</p>
              </div>
              <button onClick={() => setSelectedLeave(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status & Actions */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700">Status:</span>
                  {getStatusBadge(selectedLeave.status)}
                </div>
                {selectedLeave.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const catatan = prompt('Catatan persetujuan (opsional):');
                        if (catatan !== null) {
                          handleApproveLeave(selectedLeave.id, catatan || undefined);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Setujui
                    </button>
                    <button
                      onClick={() => {
                        const catatan = prompt('Alasan penolakan (wajib):');
                        if (catatan) {
                          handleRejectLeave(selectedLeave.id, catatan);
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      Tolak
                    </button>
                  </div>
                )}
              </div>

              {/* Leave Info */}
              <div>
                <h3 className="font-bold text-slate-800 mb-3">Informasi Izin</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Nama Guru:</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedLeave.namaGuru}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">NIP:</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedLeave.nip || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Mata Pelajaran:</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedLeave.mapel || '-'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Jenis Izin:</span>
                    <p className="font-semibold text-slate-800 mt-1">{getJenisIzinLabel(selectedLeave.jenisIzin)}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Periode:</span>
                    <p className="font-semibold text-slate-800 mt-1">
                      {formatDate(selectedLeave.tanggalMulai)} - {formatDate(selectedLeave.tanggalSelesai)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Tanggal Diajukan:</span>
                    <p className="font-semibold text-slate-800 mt-1">{formatDate(selectedLeave.tanggalDiajukan)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">Alasan:</span>
                    <p className="font-semibold text-slate-800 mt-1">{selectedLeave.alasan}</p>
                  </div>
                  {selectedLeave.nomorSurat && (
                    <div>
                      <span className="text-slate-500">Nomor Surat:</span>
                      <p className="font-semibold text-slate-800 mt-1">{selectedLeave.nomorSurat}</p>
                    </div>
                  )}
                  {selectedLeave.fileSurat && (
                    <div>
                      <span className="text-slate-500">File Surat:</span>
                      <a href={selectedLeave.fileSurat} target="_blank" rel="noreferrer" className="text-primary hover:underline mt-1 block">
                        Lihat Dokumen
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Assignments */}
              <div>
                <h3 className="font-bold text-slate-800 mb-3">Penugasan Kelas ({selectedLeave.assignments.length})</h3>
                <div className="space-y-3">
                  {selectedLeave.assignments.map((assignment, index) => (
                    <div key={assignment.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                        <h4 className="font-semibold text-slate-700">Penugasan {index + 1} - Kelas {assignment.namaKelas}</h4>
                        {selectedLeave.status === 'approved' && assignment.statusPenyampaian === 'belum' ? (
                          <button
                            onClick={() => handleNotifyClass(selectedLeave.id, assignment.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Sampaikan ke Kelas
                          </button>
                        ) : assignment.statusPenyampaian === 'sudah' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Sudah Disampaikan
                          </span>
                        ) : null}
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-500">Jam Pelajaran:</span>
                          <span className="ml-2 font-semibold text-slate-800">{assignment.jamPelajaran}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Mata Pelajaran:</span>
                          <span className="ml-2 font-semibold text-slate-800">{assignment.mataPelajaran}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500">Guru Pengganti:</span>
                          <span className="ml-2 font-semibold text-slate-800">{assignment.guruPengganti}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500">Tugas:</span>
                          <p className="text-slate-800 mt-1">{assignment.tugas}</p>
                        </div>
                        {assignment.waktuDisampaikan && (
                          <div className="col-span-2 text-xs text-slate-500 mt-1">
                            Disampaikan pada: {formatDate(assignment.waktuDisampaikan)} oleh {assignment.disampaikanOleh}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedLeave.catatan && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-bold text-slate-800 mb-2">Catatan Admin</h3>
                  <p className="text-sm text-slate-700">{selectedLeave.catatan}</p>
                  {selectedLeave.disetujuiOleh && (
                    <p className="text-xs text-slate-500 mt-2">
                      Oleh: {selectedLeave.disetujuiOleh} pada {selectedLeave.tanggalDisetujui ? formatDate(selectedLeave.tanggalDisetujui) : '-'}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={() => setSelectedLeave(null)}
                className="w-full px-6 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;