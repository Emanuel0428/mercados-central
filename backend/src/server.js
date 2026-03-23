const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./lib/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
const accountRoutes = require('./routes/account');

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully.');

    app.use('/api/auth', authRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/account', accountRoutes); 

    const PORT = 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err.message);
    process.exit(1);
  });