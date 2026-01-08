# Migration from LocalStorage to MySQL

Guide for migrating existing LocalStorage data to MySQL database.

## Overview

If you have existing data in the LocalStorage version, follow these steps to migrate to MySQL.

## Option 1: Fresh Start (Recommended)

Use the seed data provided:
- 6 default users
- 15 teachers
- 12 classes
- Sample reports and leaves

No migration needed - just start using the new system.

## Option 2: Export and Import

### Step 1: Export from LocalStorage

Open browser console (F12) on the old system and run:

```javascript
// Export all data
const exportData = {
  users: JSON.parse(localStorage.getItem('SC_DB_USERS') || '[]'),
  teachers: JSON.parse(localStorage.getItem('SC_DB_TEACHERS') || '[]'),
  classes: JSON.parse(localStorage.getItem('SC_DB_CLASSES') || '[]'),
  reports: JSON.parse(localStorage.getItem('SC_DB_REPORTS') || '[]'),
  teacherLeaves: JSON.parse(localStorage.getItem('SC_DB_TEACHER_LEAVES') || '[]')
};

// Download as JSON
const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'siswaconnect-export.json';
a.click();
```

### Step 2: Import to MySQL

Create import script or manually insert data using SQL INSERT statements based on the exported JSON.

## Verification

After migration:
1. Login with each user account
2. Verify teachers list
3. Check classes
4. Review reports
5. Test creating new data

---

**Version:** 3.0.0
