const express = require('express');
const bcrypt = require('bcryptjs');
const { authenticateToken } = require('../middleware/auth');
const { db } = require('../lib/db');

const router = express.Router();

router.get('/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  });
});

router.patch('/profile', authenticateToken, (req, res) => {
  const { name, email } = req.body;
  if (!name?.trim() || !email?.trim()) return res.status(400).json({ error: 'Nombre y email son requeridos' });
  db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id], (err, existing) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existing) return res.status(400).json({ error: 'El email ya está en uso por otra cuenta' });
    db.run('UPDATE users SET name = ?, email = ? WHERE id = ?', [name.trim(), email.trim(), req.user.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ name: name.trim(), email: email.trim() });
    });
  });
});

router.patch('/password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Faltan campos requeridos' });
  if (newPassword.length < 6) return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });
    const hashed = await bcrypt.hash(newPassword, 10);
    db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Contraseña actualizada correctamente' });
    });
  });
});

router.get('/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;

  db.all(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
    [userId],
    (err, orders) => {
      if (err) return res.status(500).json({ error: 'Error al obtener los pedidos' });
      if (orders.length === 0) return res.json([]);

      const itemsPromises = orders.map(
        (order) =>
          new Promise((resolve, reject) => {
            db.all(
              `SELECT oi.id, oi.product_id, oi.quantity, oi.price, p.name, p.image
               FROM order_items oi
               JOIN products p ON oi.product_id = p.id
               WHERE oi.order_id = ?`,
              [order.id],
              (err, items) => {
                if (err) return reject(err);
                resolve({
                  ...order,
                  shipping_details: JSON.parse(order.shipping_details || '{}'),
                  items,
                });
              }
            );
          })
      );

      Promise.all(itemsPromises)
        .then((ordersWithItems) => res.json(ordersWithItems))
        .catch((err) => res.status(500).json({ error: err.message }));
    }
  );
});

router.patch('/orders/:id/received', authenticateToken, (req, res) => {
  const userId = req.user.id;
  db.get('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, userId], (err, order) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    if (order.status === 'delivered') return res.status(400).json({ error: 'La orden ya fue marcada como recibida' });
    db.run('UPDATE orders SET status = ? WHERE id = ?', ['delivered', req.params.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ orderId: Number(req.params.id), status: 'delivered' });
    });
  });
});

module.exports = router;
