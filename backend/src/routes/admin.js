const express = require('express');
const { db } = require('../lib/db');
const { authenticateToken } = require('../middleware/auth');


const router = express.Router();

router.get('/products', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/orders', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  db.all('SELECT o.*, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/orders/:id/items', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  db.all(
    'SELECT oi.*, p.name, p.price AS original_price FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
    [req.params.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

router.patch('/orders/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
  const { status } = req.body;
  const validStatuses = ['pending', 'processing', 'delivered'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Estado inválido' });
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Orden no encontrada' });
    res.json({ orderId: Number(req.params.id), status });
  });
});

module.exports = router;