import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { pool, testConnection, query } from './config/database';
import { authenticateToken, generateToken, AuthUser } from './middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1991;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:1991';

// ============================================================
// MIDDLEWARE
// ============================================================

app.use(helmet());
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// HELPER FUNCTIONS
// ============================================================

async function logActivity(
  userId: number | null,
  username: string | null,
  action: string,
  entityType: string | null,
  entityId: string | null,
  description: string | null,
  req: Request
) {
  try {
    const sql = `
      INSERT INTO activity_logs (user_id, username, action, entity_type, entity_id, description, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await query(sql, [userId, username, action, entityType, entityId, description, req.ip, req.headers['user-agent']]);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

// ============================================================
// HEALTH CHECK
// ============================================================

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'Server is running', 
    timestamp: new Date().toISOString() 
  });
});

// ============================================================
// AUTH ROUTES
// ============================================================

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password required' 
      });
    }

    const sql = 'SELECT id, username, password_hash, role, name, nip, mapel FROM users WHERE username = ? AND is_active = TRUE';
    const users = await query<RowDataPacket[]>(sql, [username]);

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Log activity
    await logActivity(user.id, user.username, 'LOGIN', 'user', user.id.toString(), 'User logged in successfully', req);

    // Generate token
    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      role: user.role,
      name: user.name
    };
    const token = generateToken(authUser);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        nip: user.nip,
        mapel: user.mapel
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Logout (optional - mainly for logging)
app.post('/api/auth/logout', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (req.user) {
      await logActivity(req.user.id, req.user.username, 'LOGOUT', 'user', req.user.id.toString(), 'User logged out', req);
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// USER ROUTES
// ============================================================

// Get all users
app.get('/api/users', authenticateToken, async (req: Request, res: Response) => {
  try {
    const sql = 'SELECT id, username, role, name, nip, mapel, is_active, created_at FROM users ORDER BY created_at DESC';
    const users = await query<RowDataPacket[]>(sql);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new user
app.post('/api/users', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { username, password, role, name, nip, mapel } = req.body;

    if (!username || !password || !role || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, password, role, and name are required' 
      });
    }

    // Check if username already exists
    const checkSql = 'SELECT id FROM users WHERE username = ?';
    const existing = await query<RowDataPacket[]>(checkSql, [username]);
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const insertSql = `
      INSERT INTO users (username, password_hash, role, name, nip, mapel)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query<ResultSetHeader>(insertSql, [username, passwordHash, role, name, nip || null, mapel || null]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'CREATE_USER', 'user', result.insertId.toString(), `Created user: ${username}`, req);

    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete user
app.delete('/api/users/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const sql = 'DELETE FROM users WHERE id = ?';
    await query(sql, [id]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'DELETE_USER', 'user', id, `Deleted user ID: ${id}`, req);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update password
app.patch('/api/users/:id/password', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password required' 
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    const sql = 'UPDATE users SET password_hash = ? WHERE id = ?';
    await query(sql, [passwordHash, id]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'UPDATE_PASSWORD', 'user', id, `Updated password for user ID: ${id}`, req);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// TEACHER ROUTES
// ============================================================

// Get all teachers
app.get('/api/teachers', authenticateToken, async (req: Request, res: Response) => {
  try {
    const sql = 'SELECT * FROM teachers WHERE is_active = TRUE ORDER BY nama';
    const teachers = await query<RowDataPacket[]>(sql);
    res.json({ success: true, data: teachers });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create teacher
app.post('/api/teachers', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { nama, mapel, nip, nuptk, email, phone } = req.body;

    if (!nama || !mapel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and subject are required' 
      });
    }

    const sql = `
      INSERT INTO teachers (nama, mapel, nip, nuptk, email, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query<ResultSetHeader>(sql, [nama, mapel, nip || null, nuptk || null, email || null, phone || null]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'CREATE_TEACHER', 'teacher', result.insertId.toString(), `Created teacher: ${nama}`, req);

    res.status(201).json({ 
      success: true, 
      message: 'Teacher created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update teacher
app.put('/api/teachers/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama, mapel, nip, nuptk, email, phone } = req.body;

    const sql = `
      UPDATE teachers 
      SET nama = ?, mapel = ?, nip = ?, nuptk = ?, email = ?, phone = ?
      WHERE id = ?
    `;
    await query(sql, [nama, mapel, nip || null, nuptk || null, email || null, phone || null, id]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'UPDATE_TEACHER', 'teacher', id, `Updated teacher: ${nama}`, req);

    res.json({ success: true, message: 'Teacher updated successfully' });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Soft delete teacher
app.delete('/api/teachers/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const sql = 'UPDATE teachers SET is_active = FALSE WHERE id = ?';
    await query(sql, [id]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'DELETE_TEACHER', 'teacher', id, `Soft deleted teacher ID: ${id}`, req);

    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Bulk insert teachers
app.post('/api/teachers/bulk', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { teachers } = req.body;

    if (!Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Teachers array required' 
      });
    }

    const values = teachers.map(t => [t.nama, t.mapel, t.nip || null, t.nuptk || null, t.email || null, t.phone || null]);
    const sql = 'INSERT INTO teachers (nama, mapel, nip, nuptk, email, phone) VALUES ?';
    
    await query(sql, [values]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'BULK_CREATE_TEACHERS', 'teacher', null, `Created ${teachers.length} teachers`, req);

    res.status(201).json({ 
      success: true, 
      message: `${teachers.length} teachers created successfully` 
    });
  } catch (error) {
    console.error('Bulk create teachers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Bulk delete teachers
app.post('/api/teachers/bulk-delete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'IDs array required' 
      });
    }

    const placeholders = ids.map(() => '?').join(',');
    const sql = `UPDATE teachers SET is_active = FALSE WHERE id IN (${placeholders})`;
    await query(sql, ids);

    await logActivity(req.user?.id || null, req.user?.username || null, 'BULK_DELETE_TEACHERS', 'teacher', null, `Deleted ${ids.length} teachers`, req);

    res.json({ 
      success: true, 
      message: `${ids.length} teachers deleted successfully` 
    });
  } catch (error) {
    console.error('Bulk delete teachers error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// CLASS ROUTES
// ============================================================

// Get all classes
app.get('/api/classes', authenticateToken, async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT c.*, t.nama as wali_kelas_nama
      FROM classes c
      LEFT JOIN teachers t ON c.wali_kelas_id = t.id
      WHERE c.is_active = TRUE
      ORDER BY c.nama
    `;
    const classes = await query<RowDataPacket[]>(sql);
    res.json({ success: true, data: classes });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create class
app.post('/api/classes', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { kode, nama, wali_kelas_id, jumlah_siswa, tahun_ajaran } = req.body;

    if (!kode || !nama) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code and name are required' 
      });
    }

    // Check for duplicates
    const checkSql = 'SELECT id FROM classes WHERE (kode = ? OR nama = ?) AND is_active = TRUE';
    const existing = await query<RowDataPacket[]>(checkSql, [kode, nama]);
    
    if (existing.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: 'Class code or name already exists' 
      });
    }

    const sql = `
      INSERT INTO classes (kode, nama, wali_kelas_id, jumlah_siswa, tahun_ajaran)
      VALUES (?, ?, ?, ?, ?)
    `;
    const result = await query<ResultSetHeader>(sql, [kode, nama, wali_kelas_id || null, jumlah_siswa || 0, tahun_ajaran || null]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'CREATE_CLASS', 'class', result.insertId.toString(), `Created class: ${nama}`, req);

    res.status(201).json({ 
      success: true, 
      message: 'Class created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update class
app.put('/api/classes/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { kode, nama, wali_kelas_id, jumlah_siswa, tahun_ajaran } = req.body;

    const sql = `
      UPDATE classes 
      SET kode = ?, nama = ?, wali_kelas_id = ?, jumlah_siswa = ?, tahun_ajaran = ?
      WHERE id = ?
    `;
    await query(sql, [kode, nama, wali_kelas_id || null, jumlah_siswa || 0, tahun_ajaran || null, id]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'UPDATE_CLASS', 'class', id, `Updated class: ${nama}`, req);

    res.json({ success: true, message: 'Class updated successfully' });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete class
app.delete('/api/classes/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const sql = 'UPDATE classes SET is_active = FALSE WHERE id = ?';
    await query(sql, [id]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'DELETE_CLASS', 'class', id, `Deleted class ID: ${id}`, req);

    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Bulk insert classes
app.post('/api/classes/bulk', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { classes } = req.body;

    if (!Array.isArray(classes) || classes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Classes array required' 
      });
    }

    const values = classes.map(c => [c.kode, c.nama, c.wali_kelas_id || null, c.jumlah_siswa || 0, c.tahun_ajaran || null]);
    const sql = 'INSERT INTO classes (kode, nama, wali_kelas_id, jumlah_siswa, tahun_ajaran) VALUES ?';
    
    await query(sql, [values]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'BULK_CREATE_CLASSES', 'class', null, `Created ${classes.length} classes`, req);

    res.status(201).json({ 
      success: true, 
      message: `${classes.length} classes created successfully` 
    });
  } catch (error) {
    console.error('Bulk create classes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Bulk delete classes
app.post('/api/classes/bulk-delete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'IDs array required' 
      });
    }

    const placeholders = ids.map(() => '?').join(',');
    const sql = `UPDATE classes SET is_active = FALSE WHERE id IN (${placeholders})`;
    await query(sql, ids);

    await logActivity(req.user?.id || null, req.user?.username || null, 'BULK_DELETE_CLASSES', 'class', null, `Deleted ${ids.length} classes`, req);

    res.json({ 
      success: true, 
      message: `${ids.length} classes deleted successfully` 
    });
  } catch (error) {
    console.error('Bulk delete classes error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// REPORT ROUTES
// ============================================================

// Get all reports
app.get('/api/reports', authenticateToken, async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT r.*, u.name as verified_by_name
      FROM reports r
      LEFT JOIN users u ON r.verified_by = u.id
      ORDER BY r.tanggal DESC
    `;
    const reports = await query<RowDataPacket[]>(sql);
    res.json({ success: true, data: reports });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create report
app.post('/api/reports', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tanggal, kelas, guru, waktu, keterangan, foto_base64 } = req.body;

    if (!tanggal || !kelas || !guru || !waktu || !keterangan) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    const sql = `
      INSERT INTO reports (tanggal, kelas, guru, waktu, keterangan, foto_base64)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query<ResultSetHeader>(sql, [tanggal, kelas, guru, waktu, keterangan, foto_base64 || null]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'CREATE_REPORT', 'report', result.insertId.toString(), `Created report for ${kelas}`, req);

    res.status(201).json({ 
      success: true, 
      message: 'Report created successfully',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete report
app.delete('/api/reports/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const sql = 'DELETE FROM reports WHERE id = ?';
    await query(sql, [id]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'DELETE_REPORT', 'report', id, `Deleted report ID: ${id}`, req);

    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Bulk delete reports
app.post('/api/reports/bulk-delete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'IDs array required' 
      });
    }

    const placeholders = ids.map(() => '?').join(',');
    const sql = `DELETE FROM reports WHERE id IN (${placeholders})`;
    await query(sql, ids);

    await logActivity(req.user?.id || null, req.user?.username || null, 'BULK_DELETE_REPORTS', 'report', null, `Deleted ${ids.length} reports`, req);

    res.json({ 
      success: true, 
      message: `${ids.length} reports deleted successfully` 
    });
  } catch (error) {
    console.error('Bulk delete reports error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update report status
app.patch('/api/reports/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, rejection_note } = req.body;

    if (!['pending', 'verified', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const sql = `
      UPDATE reports 
      SET status = ?, verified_by = ?, verified_at = NOW(), rejection_note = ?
      WHERE id = ?
    `;
    await query(sql, [status, req.user?.id || null, rejection_note || null, id]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'UPDATE_REPORT_STATUS', 'report', id, `Updated report status to ${status}`, req);

    res.json({ success: true, message: 'Report status updated successfully' });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// TEACHER LEAVE ROUTES
// ============================================================

// Get all teacher leaves
app.get('/api/teacher-leaves', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { guru_id } = req.query;
    
    let sql = `
      SELECT tl.*, t.nama as nama_guru, t.nip, t.mapel, u.name as disetujui_oleh_nama
      FROM teacher_leaves tl
      JOIN teachers t ON tl.guru_id = t.id
      LEFT JOIN users u ON tl.disetujui_oleh = u.id
    `;
    
    const params: any[] = [];
    if (guru_id) {
      sql += ' WHERE tl.guru_id = ?';
      params.push(guru_id);
    }
    
    sql += ' ORDER BY tl.created_at DESC';
    
    const leaves = await query<RowDataPacket[]>(sql, params);

    // Fetch assignments for each leave
    for (const leave of leaves) {
      const assignSql = 'SELECT * FROM class_assignments WHERE leave_id = ?';
      const assignments = await query<RowDataPacket[]>(assignSql, [leave.id]);
      leave.assignments = assignments;
    }

    res.json({ success: true, data: leaves });
  } catch (error) {
    console.error('Get teacher leaves error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create teacher leave with assignments (transaction)
app.post('/api/teacher-leaves', authenticateToken, async (req: Request, res: Response) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();

    const { guru_id, tanggal_mulai, tanggal_selesai, jenis_izin, alasan, nomor_surat, file_surat_base64, assignments } = req.body;

    if (!guru_id || !tanggal_mulai || !tanggal_selesai || !jenis_izin || !alasan) {
      await connection.rollback();
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields missing' 
      });
    }

    // Insert leave
    const leaveSql = `
      INSERT INTO teacher_leaves (guru_id, tanggal_mulai, tanggal_selesai, jenis_izin, alasan, nomor_surat, file_surat_base64)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [leaveResult] = await connection.execute<ResultSetHeader>(
      leaveSql, 
      [guru_id, tanggal_mulai, tanggal_selesai, jenis_izin, alasan, nomor_surat || null, file_surat_base64 || null]
    );

    const leaveId = leaveResult.insertId;

    // Insert assignments
    if (assignments && Array.isArray(assignments) && assignments.length > 0) {
      const assignSql = `
        INSERT INTO class_assignments (leave_id, kelas_id, nama_kelas, jam_pelajaran, mata_pelajaran, guru_pengganti, guru_pengganti_id, tugas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      for (const assign of assignments) {
        await connection.execute(assignSql, [
          leaveId,
          assign.kelas_id || null,
          assign.nama_kelas,
          assign.jam_pelajaran,
          assign.mata_pelajaran,
          assign.guru_pengganti,
          assign.guru_pengganti_id || null,
          assign.tugas
        ]);
      }
    }

    await connection.commit();

    await logActivity(req.user?.id || null, req.user?.username || null, 'CREATE_TEACHER_LEAVE', 'teacher_leave', leaveId.toString(), `Created teacher leave with ${assignments?.length || 0} assignments`, req);

    res.status(201).json({ 
      success: true, 
      message: 'Teacher leave created successfully',
      id: leaveId
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create teacher leave error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Approve teacher leave
app.patch('/api/teacher-leaves/:id/approve', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const sql = `
      UPDATE teacher_leaves 
      SET status = 'approved', disetujui_oleh = ?, tanggal_disetujui = NOW(), catatan = ?
      WHERE id = ?
    `;
    await query(sql, [req.user?.id || null, catatan || null, id]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'APPROVE_TEACHER_LEAVE', 'teacher_leave', id, `Approved teacher leave ID: ${id}`, req);

    res.json({ success: true, message: 'Teacher leave approved successfully' });
  } catch (error) {
    console.error('Approve teacher leave error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reject teacher leave
app.patch('/api/teacher-leaves/:id/reject', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { catatan } = req.body;

    const sql = `
      UPDATE teacher_leaves 
      SET status = 'rejected', disetujui_oleh = ?, tanggal_disetujui = NOW(), catatan = ?
      WHERE id = ?
    `;
    await query(sql, [req.user?.id || null, catatan || null, id]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'REJECT_TEACHER_LEAVE', 'teacher_leave', id, `Rejected teacher leave ID: ${id}`, req);

    res.json({ success: true, message: 'Teacher leave rejected successfully' });
  } catch (error) {
    console.error('Reject teacher leave error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Mark assignment as notified
app.patch('/api/class-assignments/:id/notify', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { disampaikan_oleh } = req.body;

    const sql = `
      UPDATE class_assignments 
      SET status_penyampaian = 'sudah', waktu_disampaikan = NOW(), disampaikan_oleh = ?
      WHERE id = ?
    `;
    await query(sql, [disampaikan_oleh || req.user?.name || null, id]);

    await logActivity(req.user?.id || null, req.user?.username || null, 'NOTIFY_ASSIGNMENT', 'class_assignment', id, `Notified assignment ID: ${id}`, req);

    res.json({ success: true, message: 'Assignment notified successfully' });
  } catch (error) {
    console.error('Notify assignment error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================================================
// ERROR HANDLING
// ============================================================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: 'Endpoint not found' 
  });
});

// Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error' 
  });
});

// ============================================================
// START SERVER
// ============================================================

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
      console.log('');
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║         🚀 SISWACONNECT SERVER STARTED                    ║');
      console.log('╚════════════════════════════════════════════════════════════╝');
      console.log('');
      console.log(`📍 Server running on: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 CORS enabled for: ${CLIENT_URL}`);
      console.log('');
      console.log('📋 Available endpoints:');
      console.log('   • GET  /api/health - Health check');
      console.log('   • POST /api/auth/login - User login');
      console.log('   • GET  /api/users - Get all users');
      console.log('   • GET  /api/teachers - Get all teachers');
      console.log('   • GET  /api/classes - Get all classes');
      console.log('   • GET  /api/reports - Get all reports');
      console.log('   • GET  /api/teacher-leaves - Get teacher leaves');
      console.log('');
      console.log('✅ Server ready to accept connections!');
      console.log('');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

// Start the server
startServer();
