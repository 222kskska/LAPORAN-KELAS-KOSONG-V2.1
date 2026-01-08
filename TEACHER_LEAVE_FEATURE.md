# Teacher Leave Form Feature - Implementation Guide

## 🎯 Overview
This feature adds a complete teacher leave management system with approval workflow and class assignment notifications.

## 📋 Features Implemented

### 1. Teacher Portal
- **Login System**: Separate teacher login with role validation
- **Dashboard**: View leave request history with statistics
- **Leave Form**: Comprehensive form to submit leave requests with:
  - Leave period (start and end dates)
  - Leave type (Sakit, Izin, Dinas, Cuti, Lainnya)
  - Reason and optional letter number
  - Document upload (PDF, JPG, PNG up to 5MB)
  - Dynamic class assignments with:
    - Class selection
    - Period/hours
    - Subject
    - Substitute teacher
    - Student tasks

### 2. Admin Portal
- **Izin Guru Tab**: New dedicated tab for managing leave requests
- **Pending Badge**: Visual indicator for pending approvals
- **Approval Workflow**:
  - Review all leave details
  - Approve with optional notes
  - Reject with required notes
- **Class Notification**:
  - "Sampaikan ke Kelas" button for approved leaves
  - Track which assignments have been communicated
  - Timestamps for delivery confirmation

## 🔐 User Credentials

### Teacher Accounts
- **Username**: `guru1` | **Password**: `password`
  - Name: Bpk. Joko Widodo
  - Subject: Matematika
  - NIP: 19610621 198503 1 001

- **Username**: `guru2` | **Password**: `password`
  - Name: Ibu Sri Mulyani
  - Subject: Ekonomi
  - NIP: 19620826 198703 2 005

### Admin Account
- **Username**: `admin` | **Password**: `password`

## 🚀 User Flow

### Teacher Flow
1. Click "Akses Guru" button on homepage
2. Login with teacher credentials
3. View dashboard with statistics
4. Click "Ajukan Izin Baru"
5. Fill in leave details:
   - Period dates
   - Leave type and reason
   - Optional letter number and document
6. Add class assignments (minimum 1 required)
7. Submit for approval
8. View status updates in dashboard

### Admin Flow
1. Click "Akses Admin" button on homepage
2. Login with admin credentials
3. Navigate to "Izin Guru" tab (shows badge if pending)
4. Review leave request details
5. Actions based on status:
   - **Pending**: Approve or Reject with notes
   - **Approved**: Click "Sampaikan ke Kelas" for each assignment
   - **Rejected/Notified**: View only

## 📊 Data Structure

### TeacherLeave
```typescript
{
  id: string
  guruId: string
  namaGuru: string
  nip?: string
  mapel?: string
  tanggalMulai: string
  tanggalSelesai: string
  jenisIzin: LeaveType
  alasan: string
  nomorSurat?: string
  fileSurat?: string
  status: 'pending' | 'approved' | 'rejected' | 'notified'
  disetujuiOleh?: string
  disetujuiOlehId?: string
  tanggalDiajukan: string
  tanggalDisetujui?: string
  catatan?: string
  assignments: ClassAssignment[]
}
```

### ClassAssignment
```typescript
{
  id: string
  leaveId: string
  kelasId: string
  namaKelas: string
  jamPelajaran: string
  mataPelajaran: string
  guruPengganti: string
  tugas: string
  statusPenyampaian: 'belum' | 'sudah'
  waktuDisampaikan?: string
  disampaikanOleh?: string
}
```

## 💾 Data Persistence
- Uses localStorage for client-side persistence
- Data keys:
  - `SC_DB_TEACHER_LEAVES`: All leave requests
  - Integrated with existing user management

## 🎨 Design System
- **Teacher Theme**: Green gradient (from-green-50 to-emerald-50)
- **Status Badges**:
  - Pending: Yellow
  - Approved: Green
  - Rejected: Red
  - Notified: Blue
- **Responsive**: Mobile-first design with adaptive layouts

## 🔧 Technical Implementation

### Files Created
1. `components/TeacherDashboard.tsx` - Teacher portal dashboard
2. `components/TeacherLeaveForm.tsx` - Leave request form

### Files Modified
1. `types.ts` - Added new interfaces and enums
2. `services/mockService.ts` - Added CRUD operations for leaves
3. `components/AdminDashboard.tsx` - Added Izin Guru tab
4. `components/Login.tsx` - Added loginType differentiation
5. `App.tsx` - Added teacher routes and navigation

### New Types
- `LeaveType` enum
- `LeaveStatus` type
- `TeacherLeave` interface
- `ClassAssignment` interface
- `TeacherLeaveFormData` interface

### Service Methods
- `submitTeacherLeave()` - Create new leave request
- `getTeacherLeaves()` - Get all leaves (admin)
- `getTeacherLeavesByGuruId()` - Get leaves for specific teacher
- `approveTeacherLeave()` - Approve leave request
- `rejectTeacherLeave()` - Reject leave request
- `updateAssignmentNotification()` - Mark assignment as delivered

## ✅ Testing Checklist

### Teacher Portal
- [ ] Login with teacher credentials
- [ ] View empty dashboard
- [ ] Create new leave request with all fields
- [ ] Upload document (PDF/JPG/PNG)
- [ ] Add multiple class assignments
- [ ] Submit leave request
- [ ] View request in history
- [ ] Check pending status
- [ ] View detail modal

### Admin Portal
- [ ] Login with admin credentials
- [ ] See pending badge on "Izin Guru" tab
- [ ] Navigate to Izin Guru tab
- [ ] View all leave requests
- [ ] Click detail on pending request
- [ ] Approve leave with note
- [ ] Reject leave with note
- [ ] Click "Sampaikan ke Kelas" for approved leave
- [ ] Verify status changes to "Sudah Disampaikan"
- [ ] Check final status is "Tersampaikan" when all done

### Data Persistence
- [ ] Submit leave request
- [ ] Refresh page
- [ ] Verify data persists in localStorage
- [ ] Approve/reject request
- [ ] Refresh page
- [ ] Verify status updates persist

## 🐛 Known Limitations
- File upload stores base64 in localStorage (size limitations)
- No backend API integration (uses mock service)
- No email notifications
- Simple approval/rejection (no multi-level approval)

## 🔜 Future Enhancements
- Backend API integration
- Email/SMS notifications
- Multi-level approval workflow
- Calendar view of leaves
- Export to PDF
- Integration with school management system
- Real file storage system
- Mobile app version

## 📝 Notes
- All data is stored in browser's localStorage
- File uploads are converted to base64 strings
- Maximum file size: 5MB
- Supported file types: PDF, JPG, PNG
- Demo data includes 2 teacher accounts

## 🏗️ Architecture Decisions
1. **LocalStorage**: Quick implementation, no backend required
2. **Base64 Files**: Simple file handling for demo
3. **Mock Service**: Simulates real API behavior
4. **Role-based Routing**: Separate teacher/admin flows
5. **Status Workflow**: Linear progression (pending → approved/rejected → notified)

---

**Created by**: ArifWbo
**Date**: January 2025
**Version**: 2.1
