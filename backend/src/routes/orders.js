const express = require('express');
const { db } = require('../lib/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, (req, res) => {
  const { cart, shippingDetails, paymentMethod } = req.body;
  const total = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

  if (!shippingDetails || !paymentMethod) {
    return res.status(400).json({ error: 'Faltan datos de envío o método de pago' });
  }

  db.run(
    'INSERT INTO orders (user_id, total, shipping_details, payment_method) VALUES (?, ?, ?, ?)',
    [req.user.id, total, JSON.stringify(shippingDetails), paymentMethod],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      const orderId = this.lastID;

      const inserts = cart.map((item) =>
        new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.id, item.quantity, item.price],
            (err) => (err ? reject(err) : resolve())
          );
          db.run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.id]);
        })
      );

      Promise.all(inserts)
        .then(() => {
          db.get(
            'SELECT o.*, u.email FROM orders o JOIN users u ON o.user_id = u.id WHERE o.id = ?',
            [orderId],
            (err, order) => {
              if (err) return res.status(500).json({ error: err.message });
              res.json({
                orderId: order.id,
                total: order.total,
                shippingDetails: JSON.parse(order.shipping_details),
                paymentMethod: order.payment_method,
                email: order.email,
                createdAt: order.created_at,
                items: cart
              });
            }
          );
        })
        .catch((err) => res.status(500).json({ error: err.message }));
    }
  );
});

module.exports = router;