import React, { useState, useEffect } from 'react';
import { LogOut, Plus, FileText, Clock, CheckCircle, XCircle, AlertCircle, Calendar, User, BookOpen, Hash, Eye, X } from 'lucide-react';
import { AdminUser, TeacherLeave, LeaveType } from '../types';
import { mockService } from '../services/mockService';
import TeacherLeaveForm from './TeacherLeaveForm';

interface TeacherDashboardProps {
  user: AdminUser;
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onLogout }) => {
  const [leaves, setLeaves] = useState<TeacherLeave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<TeacherLeave | null>(null);

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    setLoading(true);
    const data = await mockService.getTeacherLeavesByGuruId(user.id);
    setLeaves(data);
    setLoading(false);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    loadLeaves();
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

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved' || l.status === 'notified').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Dashboard Guru</h1>
                <p className="text-sm text-slate-600">{user.name} - {user.mapel || 'Guru'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-lg shadow-green-500/30"
              >
                <Plus className="w-5 h-5" />
                Ajukan Izin Baru
              </button>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Teacher Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-green-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Nama Lengkap</p>
                <p className="font-semibold text-slate-800">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">NIP</p>
                <p className="font-semibold text-slate-800">{user.nip || '-'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Mata Pelajaran</p>
                <p className="font-semibold text-slate-800">{user.mapel || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-slate-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Pengajuan</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Menunggu</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Disetujui</p>
                <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-400">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Ditolak</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Riwayat Pengajuan Izin</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500">Memuat data...</p>
            </div>
          ) : leaves.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Belum ada pengajuan izin</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Ajukan Izin Pertama
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Periode Izin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Jumlah Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Tanggal Diajukan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-800">
                            {formatDate(leave.tanggalMulai)} - {formatDate(leave.tanggalSelesai)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                          {getJenisIzinLabel(leave.jenisIzin)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700">{leave.assignments.length} kelas</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(leave.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(leave.tanggalDiajukan)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedLeave(leave)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Leave Form Modal */}
      {showForm && (
        <TeacherLeaveForm
          teacher={user}
          onClose={() => setShowForm(false)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Detail Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl my-8 animate-fade-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Detail Izin</h2>
              <button onClick={() => setSelectedLeave(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <span className="font-semibold text-slate-700">Status Pengajuan:</span>
                {getStatusBadge(selectedLeave.status)}
              </div>

              {/* Leave Info */}
              <div>
                <h3 className="font-bold text-slate-800 mb-3">Informasi Izin</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Periode:</span>
                    <p className="font-semibold text-slate-800 mt-1">
                      {formatDate(selectedLeave.tanggalMulai)} - {formatDate(selectedLeave.tanggalSelesai)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500">Jenis Izin:</span>
                    <p className="font-semibold text-slate-800 mt-1">{getJenisIzinLabel(selectedLeave.jenisIzin)}</p>
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
                  <div>
                    <span className="text-slate-500">Tanggal Diajukan:</span>
                    <p className="font-semibold text-slate-800 mt-1">{formatDate(selectedLeave.tanggalDiajukan)}</p>
                  </div>
                </div>
              </div>

              {/* Assignments */}
              <div>
                <h3 className="font-bold text-slate-800 mb-3">Penugasan Kelas ({selectedLeave.assignments.length})</h3>
                <div className="space-y-3">
                  {selectedLeave.assignments.map((assignment, index) => (
                    <div key={assignment.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-slate-700">Penugasan {index + 1}</h4>
                        {assignment.statusPenyampaian === 'sudah' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Sudah Disampaikan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Belum Disampaikan
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">Kelas:</span>
                          <span className="ml-2 font-semibold text-slate-800">{assignment.namaKelas}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Jam:</span>
                          <span className="ml-2 font-semibold text-slate-800">{assignment.jamPelajaran}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Mapel:</span>
                          <span className="ml-2 font-semibold text-slate-800">{assignment.mataPelajaran}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Guru Pengganti:</span>
                          <span className="ml-2 font-semibold text-slate-800">{assignment.guruPengganti}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-slate-500">Tugas:</span>
                          <p className="text-slate-800 mt-1">{assignment.tugas}</p>
                        </div>
                        {assignment.waktuDisampaikan && (
                          <div className="col-span-2 text-xs text-slate-500">
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
                  <h3 className="font-bold text-slate-800 mb-2">Catatan dari Admin</h3>
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

export default TeacherDashboard;
