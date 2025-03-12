const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

// Función para inicializar las tablas y datos
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user'
      )
    `, (err) => {
      if (err) return reject(err);

      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          description TEXT,
          category TEXT,
          image TEXT,
          stock INTEGER NOT NULL
        )
      `, (err) => {
        if (err) return reject(err);

        db.run(`
          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total REAL NOT NULL,
            shipping_details TEXT,  -- Nuevo campo
            payment_method TEXT,    -- Nuevo campo
            status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        `, (err) => {
          if (err) return reject(err);

          db.run(`
            CREATE TABLE IF NOT EXISTS order_items (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              order_id INTEGER,
              product_id TEXT,
              quantity INTEGER NOT NULL,
              price REAL NOT NULL,
              FOREIGN KEY (order_id) REFERENCES orders(id),
              FOREIGN KEY (product_id) REFERENCES products(id)
            )
          `, (err) => {
            if (err) return reject(err);

            const { products: initialProducts } = require('./products');
            const insertPromises = initialProducts.map((product) =>
              new Promise((resolve, reject) => {
                db.run(
                  'INSERT OR IGNORE INTO products (id, name, price, description, category, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
                  [product.id, product.name, product.price, product.description, product.category, product.image, product.stock],
                  (err) => (err ? reject(err) : resolve())
                );
              })
            );

            Promise.all(insertPromises)
              .then(() => resolve())
              .catch(reject);
          });
        });
      });
    });
  });
};

// Inicializar la base de datos antes de configurar rutas
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully.');

    // Registro e inicio de sesión
    app.post('/api/register', async (req, res) => {
      const { name, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, 'user'], function (err) {
        if (err) return res.status(400).json({ error: 'Email ya registrado' });
        res.status(201).json({ message: 'Usuario registrado' });
      });
    });

    app.post('/api/login', (req, res) => {
      const { email, password } = req.body;
      db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) return res.status(400).json({ error: 'Usuario no encontrado' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Contraseña incorrecta' });
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'secret_key', { expiresIn: '1h' });
        res.json({ email: user.email, role: user.role, token });
      });
    });

    // Middleware de autenticación
    const authenticateToken = (req, res, next) => {
      const token = req.headers['authorization']?.split(' ')[1];
      if (!token) return res.status(401).json({ error: 'Acceso denegado' });
      jwt.verify(token, 'secret_key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user;
        next();
      });
    };

    // Endpoint para obtener datos de cuenta
    app.get('/api/account', authenticateToken, (req, res) => {
      res.json({ email: req.user.email, role: req.user.role });
    });

    // Endpoint para obtener todos los productos (admin)
    app.get('/api/admin/products', authenticateToken, (req, res) => {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
      db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    });

    // Endpoint para obtener todas las órdenes (admin)
    app.get('/api/admin/orders', authenticateToken, (req, res) => {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Acceso denegado' });
      db.all('SELECT o.*, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    });

    // Endpoint para obtener ítems de una orden específica (admin)
    app.get('/api/admin/orders/:id/items', authenticateToken, (req, res) => {
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

    // Endpoint para crear una orden (al checkout)
    app.post('/api/orders', authenticateToken, (req, res) => {
      const { cart, shippingDetails, paymentMethod } = req.body; // Nuevos campos
      const total = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

      // Validar datos
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
              // Devolver detalles completos de la orden
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
                    items: cart // Por ahora usamos el carrito enviado; podrías consultar order_items si prefieres
                  });
                }
              );
            })
            .catch((err) => res.status(500).json({ error: err.message }));
        }
      );
    });

    const PORT = 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  });