const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

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
            shipping_details TEXT,
            payment_method TEXT,
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

            const { products: initialProducts } = require('../products');
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
              .then(() => {
                // Migrations: add new columns if they don't exist yet (errors are silently ignored)
                db.run('ALTER TABLE orders ADD COLUMN payment_details TEXT', () => {});
                db.run('ALTER TABLE orders ADD COLUMN transfer_receipt TEXT', () => {});
                resolve();
              })
              .catch(reject);
          });
        });
      });
    });
  });
};

module.exports = { db, initializeDatabase };