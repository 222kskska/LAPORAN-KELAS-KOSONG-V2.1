# SiswaConnect API Documentation

REST API documentation for SiswaConnect Backend v3.0.0

**Base URL:** `http://localhost:1991/api`

## Authentication

All endpoints except `/auth/login` and `/health` require JWT token.

**Header:**
```
Authorization: Bearer <token>
```

Token expires after 24 hours.

## API Endpoints

### Authentication

#### POST /auth/login
Login with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "username": "admin",
    "role": "ADMIN",
    "name": "Admin Sekolah"
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### POST /auth/logout
Logout (for logging only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Users

#### GET /users
Get all users.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "username": "admin",
      "role": "ADMIN",
      "name": "Admin Sekolah",
      "is_active": true,
      "created_at": "2026-01-08T10:00:00.000Z"
    }
  ]
}
```

#### POST /users
Create new user.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "username": "newuser",
  "password": "securepass",
  "role": "OPERATOR",
  "name": "New Operator",
  "nip": "optional",
  "mapel": "optional"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User created successfully",
  "id": 7
}
```

#### DELETE /users/:id
Delete user by ID.

#### PATCH /users/:id/password
Update user password.

**Request:**
```json
{
  "newPassword": "newSecurePassword"
}
```

---

### Teachers

#### GET /teachers
Get all teachers.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nama": "Bpk. Joko Widodo",
      "mapel": "Matematika",
      "nip": "19610621 198503 1 001",
      "nuptk": "1234567890123456",
      "email": "joko.widodo@smpn4smr.sch.id",
      "phone": "081234567801",
      "is_active": true
    }
  ]
}
```

#### POST /teachers
Create teacher.

**Request:**
```json
{
  "nama": "Ibu Siti",
  "mapel": "IPA",
  "nip": "optional",
  "nuptk": "optional",
  "email": "optional",
  "phone": "optional"
}
```

#### PUT /teachers/:id
Update teacher.

#### DELETE /teachers/:id
Soft delete teacher.

#### POST /teachers/bulk
Bulk insert teachers.

**Request:**
```json
{
  "teachers": [
    {"nama": "Teacher 1", "mapel": "Math"},
    {"nama": "Teacher 2", "mapel": "Science"}
  ]
}
```

#### POST /teachers/bulk-delete
Bulk delete teachers.

**Request:**
```json
{
  "ids": [1, 2, 3]
}
```

---

### Classes

#### GET /classes
Get all classes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "kode": "0071",
      "nama": "VII-1",
      "wali_kelas_id": 1,
      "wali_kelas_nama": "Bpk. Joko Widodo",
      "jumlah_siswa": 32,
      "tahun_ajaran": "2025/2026",
      "is_active": true
    }
  ]
}
```

#### POST /classes
Create class.

**Request:**
```json
{
  "kode": "0075",
  "nama": "VII-5",
  "wali_kelas_id": 2,
  "jumlah_siswa": 30,
  "tahun_ajaran": "2025/2026"
}
```

#### PUT /classes/:id
Update class.

#### DELETE /classes/:id
Delete class.

#### POST /classes/bulk
Bulk insert classes.

#### POST /classes/bulk-delete
Bulk delete classes.

---

### Reports

#### GET /reports
Get all reports.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "tanggal": "2026-01-08T09:00:00.000Z",
      "kelas": "IX-1",
      "guru": "Bpk. Joko Widodo",
      "waktu": "1-2",
      "keterangan": "Guru tidak hadir",
      "foto_base64": "data:image/jpeg;base64,...",
      "status": "pending",
      "verified_by": null,
      "verified_at": null,
      "verified_by_name": null
    }
  ]
}
```

#### POST /reports
Create report.

**Request:**
```json
{
  "tanggal": "2026-01-08T10:00:00Z",
  "kelas": "IX-1",
  "guru": "Bpk. Joko Widodo",
  "waktu": "1-2",
  "keterangan": "Guru tidak hadir",
  "foto_base64": "data:image/jpeg;base64,..."
}
```

#### DELETE /reports/:id
Delete report.

#### POST /reports/bulk-delete
Bulk delete reports.

**Request:**
```json
{
  "ids": [1, 2, 3]
}
```

#### PATCH /reports/:id/status
Update report status.

**Request:**
```json
{
  "status": "verified",
  "rejection_note": "optional"
}
```

Status values: `pending`, `verified`, `rejected`

---

### Teacher Leaves

#### GET /teacher-leaves
Get all teacher leaves.

**Query Parameters:**
- `guru_id` (optional): Filter by teacher ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "guru_id": 1,
      "nama_guru": "Bpk. Joko Widodo",
      "nip": "19610621 198503 1 001",
      "mapel": "Matematika",
      "tanggal_mulai": "2026-01-09",
      "tanggal_selesai": "2026-01-11",
      "jenis_izin": "SAKIT",
      "alasan": "Flu berat",
      "nomor_surat": "SK-001/2025",
      "status": "pending",
      "assignments": [
        {
          "id": 1,
          "nama_kelas": "VII-1",
          "jam_pelajaran": "1-2",
          "mata_pelajaran": "Matematika",
          "guru_pengganti": "Ibu Siti",
          "tugas": "Halaman 45-50",
          "status_penyampaian": "belum"
        }
      ]
    }
  ]
}
```

#### POST /teacher-leaves
Create teacher leave with assignments (transaction).

**Request:**
```json
{
  "guru_id": 1,
  "tanggal_mulai": "2026-01-10",
  "tanggal_selesai": "2026-01-12",
  "jenis_izin": "SAKIT",
  "alasan": "Demam tinggi",
  "nomor_surat": "SK-005/2025",
  "file_surat_base64": "data:application/pdf;base64,...",
  "assignments": [
    {
      "nama_kelas": "VII-1",
      "jam_pelajaran": "1-2",
      "mata_pelajaran": "Matematika",
      "guru_pengganti": "Ibu Siti",
      "tugas": "Bab 5 halaman 60-65"
    }
  ]
}
```

#### PATCH /teacher-leaves/:id/approve
Approve leave.

**Request:**
```json
{
  "catatan": "Disetujui. Semoga cepat sembuh."
}
```

#### PATCH /teacher-leaves/:id/reject
Reject leave.

**Request:**
```json
{
  "catatan": "Ditolak. Sudah ada 2 guru izin hari ini."
}
```

#### PATCH /class-assignments/:id/notify
Mark assignment as notified.

**Request:**
```json
{
  "disampaikan_oleh": "Operator Piket"
}
```

---

### Health Check

#### GET /health
Server health check (no auth required).

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2026-01-08T10:00:00.000Z"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Endpoint not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Username already exists"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Server error"
}
```

---

## Examples

### cURL

```bash
# Login
curl -X POST http://localhost:1991/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# Get teachers (authenticated)
curl -X GET http://localhost:1991/api/teachers \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create report
curl -X POST http://localhost:1991/api/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "tanggal":"2026-01-08T10:00:00Z",
    "kelas":"IX-1",
    "guru":"Bpk. Joko",
    "waktu":"1-2",
    "keterangan":"Test",
    "foto_base64":null
  }'
```

### JavaScript (axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:1991/api',
});

// Login
const login = async () => {
  const { data } = await api.post('/auth/login', {
    username: 'admin',
    password: 'password',
  });
  return data.token;
};

// Get teachers
const getTeachers = async (token) => {
  const { data } = await api.get('/teachers', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data.data;
};
```

---

## Rate Limiting

Currently no rate limiting. Future enhancement.

## Pagination

Currently returns all results. Future enhancement will add:
- `page` query parameter
- `per_page` query parameter
- Response metadata with total count

---

**API Version:** 3.0.0  
**Last Updated:** January 2026  
**Base URL:** http://localhost:1991/api
