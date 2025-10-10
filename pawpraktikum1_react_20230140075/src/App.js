import React, { useState } from 'react';

// Anda bisa menambahkan file CSS terpisah atau menggunakan inline style.
// Untuk kesederhanaan, kita akan menggunakan sedikit inline style dan fokus pada fungsionalitas.
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    fontFamily: 'sans-serif',
    backgroundColor: '#f0f2f5',
  },
  card: {
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    textAlign: 'center',
  },
  input: {
    marginTop: '20px',
    padding: '10px',
    width: '250px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  greeting: {
    marginTop: '30px',
    fontSize: '24px',
    color: '#333',
  }
};

function App() {
  // Gunakan useState untuk menyimpan dan memperbarui nama
  const [name, setName] = useState('');

  // Fungsi ini akan dipanggil setiap kali ada perubahan pada input field
  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Selamat Datang!</h1>
        <p>Silakan masukkan nama Anda di bawah ini.</p>
        
        <input
          type="text"
          placeholder="Ketik nama Anda di sini"
          value={name}
          onChange={handleNameChange}
          style={styles.input}
        />
        
        {/* Pesan akan ditampilkan jika nama sudah diisi */}
        {name && (
          <h2 style={styles.greeting}>
            Hello, {name}!
          </h2>
        )}
      </div>
    </div>
  );
}

export default App;
