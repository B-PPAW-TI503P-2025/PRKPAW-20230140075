# 🚀 QUICK START GUIDE - Testing Alur Register → Login → Logout

## Prerequisites
- Backend sudah berjalan di `http://localhost:3001`
- Frontend sudah berjalan di `http://localhost:3000`

## Step-by-Step Testing

### 1️⃣ **TEST REGISTER**
**URL**: `http://localhost:3000/register`

**Silakan isi form sebagai berikut:**
```
Nama Lengkap: Davin Pratama
Email:        davin.pratama@example.com
Password:     password123
Role:         Mahasiswa (default)
```

**Klik tombol "Daftar"**
- ✅ Akan melihat pesan success (hijau)
- ✅ Otomatis redirect ke `/login` dalam 1.5 detik

---

### 2️⃣ **TEST LOGIN** 
**URL**: `http://localhost:3000/login` (redirect otomatis dari register)

**Gunakan email & password yang baru di-register:**
```
Email:    davin.pratama@example.com
Password: password123
```

**Klik tombol "Login"**
- ✅ Token akan disimpan di `localStorage`
- ✅ Otomatis redirect ke `/dashboard`

---

### 3️⃣ **VERIFY DASHBOARD**
**URL**: `http://localhost:3000/dashboard`

**Lihat yang ditampilkan:**
```
✓ Header dengan tombol "Logout" (merah, top-right)
✓ Welcome card dengan nama: "Halo, Davin Pratama! 👋"
✓ Role ditampilkan: "Mahasiswa"
✓ Email ditampilkan: davin.pratama@example.com
✓ 3 Statistics cards (Kehadiran 85%, Pertemuan 17/20, Status Hari Ini)
✓ Aktivitas terbaru dengan 3 entries
✓ 2 Quick action buttons
✓ Footer dengan copyright
```

---

### 4️⃣ **TEST LOGOUT**
**Di halaman dashboard, klik tombol "Logout" (merah, top-right)**

**Yang terjadi:**
- ✅ Token dihapus dari `localStorage`
- ✅ Otomatis redirect ke `/login`
- ✅ Jika coba akses `/dashboard` tanpa login → redirect ke `/login`

---

### 5️⃣ **VERIFY TOKEN PROTECTION**
**Buka Developer Console (F12)**

**Buka tab "Application" → "Local Storage" → "http://localhost:3000"**

**Sebelum logout:**
```
localStorage.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Sesudah logout:**
```
localStorage.token = (tidak ada)
```

---

## ✅ File-File yang Sudah Dibuat/Updated

### Files Created:
- ✅ `src/RegisterPage.js` - Form registrasi dengan role selection
- ✅ `src/components/DashboardPage.js` - Dashboard kreatif dengan stats dan activity

### Files Updated:
- ✅ `src/App.js` - Update import paths
- ✅ `tugas/Tugas7.md` - Dokumentasi lengkap

---

## 📋 Features Implemented

| Feature | Status | Details |
|---------|--------|---------|
| Register form | ✅ Done | Nama, Email, Password, Role input |
| POST /api/auth/register | ✅ Done | Mengirim data ke backend |
| Redirect after register | ✅ Done | Ke halaman /login |
| Login form | ✅ Done | Email, Password input (sudah ada) |
| POST /api/auth/login | ✅ Done | Token disimpan di localStorage |
| Dashboard UI | ✅ Done | Kreatif dengan stats dan activity |
| User data display | ✅ Done | Dari decoded JWT token |
| Logout button | ✅ Done | Di header dashboard |
| Logout function | ✅ Done | Hapus token & redirect |
| Protected routes | ✅ Done | Dashboard check token |
| Tailwind CSS | ✅ Done | Semua halaman styled |

---

## 🎨 UI Highlights

- **Gradient Backgrounds**: Blue to Purple
- **Responsive Design**: Mobile-first approach
- **Smooth Animations**: Hover effects pada buttons
- **User Avatars**: Initial letter dari nama user
- **Statistics Cards**: 3 cards dengan icons dan colors
- **Activity Timeline**: Recent activity display
- **Accessibility**: Proper labels dan form validation

---

## 🔍 Notes

1. Backend endpoint harus accept:
   - `POST /api/auth/register` - {nama, email, password, role}
   - `POST /api/auth/login` - {email, password}

2. Response dari login harus return `{token: "..."}`

3. Token di-decode menggunakan `jwtDecode()` untuk extract user data

4. Pastikan CORS di-enable di backend untuk `http://localhost:3000`

---

**Selamat Testing! 🎉**
