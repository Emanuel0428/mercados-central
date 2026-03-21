const jwt = require('jsonwebtoken');
const { db } = require('../lib/db');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });

    db.get('SELECT id, email, role, name FROM users WHERE id = ?', [decoded.id], (dbErr, user) => {
      if (dbErr || !user) return res.status(403).json({ error: 'Usuario no encontrado' });
      req.user = user;
      next();
    });
  });
};

module.exports = { authenticateToken };
