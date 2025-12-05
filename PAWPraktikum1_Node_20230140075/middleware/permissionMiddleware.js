const jwt = require('jsonwebtoken');

// Must match the secret in authController.js
const JWT_SECRET = process.env.JWT_SECRET || 'kunci_rahasia_yang_sama_123';

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token tidak valid atau kadaluarsa." });
    }
    req.user = user;
    next();
  });
};

// ADD THIS FUNCTION
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: "Akses ditolak. Khusus Admin." });
  }
};