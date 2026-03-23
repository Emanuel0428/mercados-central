const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../lib/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `receipt_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const validExt = allowed.test(path.extname(file.originalname).toLowerCase());
    const validMime = allowed.test(file.mimetype);
    if (validExt && validMime) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpg, png, webp)'));
    }
  },
});

router.post('/', authenticateToken, (req, res) => {
  const { cart, shippingDetails, paymentMethod, paymentDetails } = req.body;
  const total = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

  if (!shippingDetails || !paymentMethod) {
    return res.status(400).json({ error: 'Faltan datos de envío o método de pago' });
  }

  db.run(
    'INSERT INTO orders (user_id, total, shipping_details, payment_method, payment_details) VALUES (?, ?, ?, ?, ?)',
    [
      req.user.id,
      total,
      JSON.stringify(shippingDetails),
      paymentMethod,
      paymentDetails ? JSON.stringify(paymentDetails) : null,
    ],
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
                paymentDetails: order.payment_details ? JSON.parse(order.payment_details) : null,
                email: order.email,
                createdAt: order.created_at,
                items: cart,
              });
            }
          );
        })
        .catch((err) => res.status(500).json({ error: err.message }));
    }
  );
});

// Upload transfer receipt for an order
router.post('/:id/receipt', authenticateToken, upload.single('receipt'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se adjuntó ningún archivo' });

  const orderId = req.params.id;
  const filename = req.file.filename;

  db.get(
    'SELECT id, transfer_receipt FROM orders WHERE id = ? AND user_id = ?',
    [orderId, req.user.id],
    (err, order) => {
      if (err || !order) return res.status(404).json({ error: 'Orden no encontrada' });

      // Delete old receipt file if exists
      if (order.transfer_receipt) {
        const oldPath = path.join(uploadsDir, order.transfer_receipt);
        fs.unlink(oldPath, () => {});
      }

      db.run(
        'UPDATE orders SET transfer_receipt = ? WHERE id = ?',
        [filename, orderId],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ filename, url: `/uploads/${filename}` });
        }
      );
    }
  );
});

module.exports = router;
