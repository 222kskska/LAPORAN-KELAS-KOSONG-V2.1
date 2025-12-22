import React, { useEffect, useState } from 'react';
import { UserRole, AdminUser } from '../types';
import { mockService } from '../services/mockService';
import { Trash2, Key, UserPlus, Shield, User, ShieldAlert, X } from 'lucide-react';

interface Props {
  currentUser: AdminUser;
}

const AdminUserManagement: React.FC<Props> = ({ currentUser }) => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState<string | null>(null); // ID of user to change pass
  
  // Form States
  const [newUser, setNewUser] = useState({ username: '', name: '', password: '', role: UserRole.OPERATOR });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    const data = await mockService.getAdminUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await mockService.addAdminUser(newUser);
    if (success) {
      setShowAddModal(false);
      setNewUser({ username: '', name: '', password: '', role: UserRole.OPERATOR });
      loadUsers();
    } else {
      alert('Username sudah ada atau terjadi kesalahan.');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      await mockService.deleteAdminUser(id);
      loadUsers();
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (showPassModal) {
      await mockService.updatePassword(showPassModal, newPassword);
      setShowPassModal(null);
      setNewPassword('');
      alert('Password berhasil diubah.');
    }
  };

  const canManageRole = (targetRole: UserRole) => {
    if (currentUser.role === UserRole.SUPER_ADMIN) return true;
    if (currentUser.role === UserRole.ADMIN && targetRole === UserRole.OPERATOR) return true;
    return false;
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-200">Super Admin</span>;
      case UserRole.ADMIN:
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-200">Admin</span>;
      default:
        return <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold border border-slate-200">Operator</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Manajemen Pengguna</h2>
          <p className="text-sm text-slate-500">Kelola akses admin dan operator sistem</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Pengguna
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-800">Nama Pengguna</th>
              <th className="px-6 py-4 font-semibold text-slate-800">Role</th>
              <th className="px-6 py-4 font-semibold text-slate-800">Username</th>
              <th className="px-6 py-4 font-semibold text-slate-800 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4 font-mono text-xs">{user.username}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Tidak bisa edit diri sendiri */}
                    {user.id !== currentUser.id && canManageRole(user.role) && (
                      <>
                        <button 
                          onClick={() => setShowPassModal(user.id)}
                          title="Ganti Password"
                          className="p-1.5 hover:bg-yellow-100 text-yellow-600 rounded transition-colors"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          title="Hapus User"
                          className="p-1.5 hover:bg-red-100 text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && !loading && (
          <div className="p-8 text-center text-slate-500">Belum ada data pengguna.</div>
        )}
      </div>

      {/* Modal Tambah User */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Tambah Pengguna Baru</h3>
              <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Nama Lengkap</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Username</label>
                <input required type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Password</label>
                <input required type="password" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Role</label>
                <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                  value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value as UserRole})}>
                  <option value={UserRole.OPERATOR}>Operator</option>
                  {currentUser.role === UserRole.SUPER_ADMIN && (
                    <option value={UserRole.ADMIN}>Admin</option>
                  )}
                </select>
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ganti Password */}
      {showPassModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Ganti Password</h3>
              <button onClick={() => setShowPassModal(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Password Baru</label>
                <input required type="password" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" 
                  value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="pt-2">
                <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold hover:bg-yellow-600">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;