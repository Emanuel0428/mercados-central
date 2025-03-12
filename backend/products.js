// backend/products.js
module.exports = {
  products: [
    // Productos originales
    {
      id: '1',
      name: 'Aguacate Hass',
      price: 12000,
      description: 'Aguacate Hass fresco y maduro, perfecto para guacamole o ensaladas.',
      category: 'frutas',
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=500',
      stock: 50
    },
    {
      id: '2',
      name: 'Plátanos Orgánicos',
      price: 3000,
      description: 'Plátanos orgánicos cultivados sin pesticidas (precio por kg).',
      category: 'frutas',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&q=80&w=500',
      stock: 100
    },
    {
      id: '3',
      name: 'Leche Entera',
      price: 4500,
      description: 'Leche entera fresca de vacas alimentadas con pasto (precio por litro).',
      category: 'lacteos',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=500',
      stock: 30
    },
    {
      id: '4',
      name: 'Pan Integral',
      price: 6000,
      description: 'Pan integral recién horneado con granos enteros (precio por unidad).',
      category: 'panaderia',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=500',
      stock: 20
    },
    {
      id: '5',
      name: 'Tomates Roma',
      price: 4000,
      description: 'Tomates Roma frescos y jugosos (precio por kg).',
      category: 'verduras',
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&q=80&w=500',
      stock: 75
    },
    {
      id: '6',
      name: 'Queso Manchego',
      price: 35000,
      description: 'Queso Manchego curado de alta calidad (precio por 400g).',
      category: 'lacteos',
      image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=500',
      stock: 15
    },
    {
      id: '7',
      name: 'Pechuga de Pollo',
      price: 20000,
      description: 'Pechuga de pollo fresca y sin hueso (precio por kg).',
      category: 'carnes',
      image: 'https://images.unsplash.com/photo-1600891964091-44b96408a989?auto=format&fit=crop&q=80&w=500',
      stock: 25
    },
    {
      id: '8',
      name: 'Carne de Res',
      price: 45000,
      description: 'Carne de res de alta calidad para asados o guisos (precio por kg).',
      category: 'carnes',
      image: 'https://images.unsplash.com/photo-1604908177630-bb6dfbdfc3de?auto=format&fit=crop&q=80&w=500',
      stock: 40
    },
    {
      id: '9',
      name: 'Jugo de Naranja Natural',
      price: 10000,
      description: 'Jugo de naranja recién exprimido, sin conservantes (precio por litro).',
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1603810202527-030a82cd8634?auto=format&fit=crop&q=80&w=500',
      stock: 60
    },
    {
      id: '10',
      name: 'Café Molido',
      price: 25000,
      description: 'Café molido 100% arábica, ideal para preparar en casa (precio por 500g).',
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&q=80&w=500',
      stock: 35
    },
    {
      id: '11',
      name: 'Zanahorias Frescas',
      price: 3000,
      description: 'Zanahorias frescas y crujientes, ricas en betacaroteno (precio por kg).',
      category: 'verduras',
      image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&q=80&w=500',
      stock: 80
    },
    {
      id: '12',
      name: 'Yogur Natural',
      price: 8000,
      description: 'Yogur natural sin azúcar, ideal para desayunos y postres (precio por litro).',
      category: 'lacteos',
      image: 'https://images.unsplash.com/photo-1567436180291-478b67c0d3be?auto=format&fit=crop&q=80&w=500',
      stock: 45
    },
    // Nuevos productos
    {
      id: '13',
      name: 'Manzanas Rojas',
      price: 5000,
      description: 'Manzanas rojas frescas y crujientes (precio por kg).',
      category: 'frutas',
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=500',
      stock: 60
    },
    {
      id: '14',
      name: 'Papaya Maradol',
      price: 4000,
      description: 'Papaya Maradol dulce y jugosa (precio por kg).',
      category: 'frutas',
      image: 'https://images.unsplash.com/photo-1561677977-324b96dbff17?auto=format&fit=crop&q=80&w=500',
      stock: 40
    },
    {
      id: '15',
      name: 'Mango Tommy',
      price: 6000,
      description: 'Mango Tommy maduro y sabroso (precio por kg).',
      category: 'frutas',
      image: 'https://images.unsplash.com/photo-1601494076540-2d3fd37e4987?auto=format&fit=crop&q=80&w=500',
      stock: 50
    },
    {
      id: '16',
      name: 'Cebolla Cabezona',
      price: 2500,
      description: 'Cebolla cabezona fresca para cocinar (precio por kg).',
      category: 'verduras',
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe5654c07?auto=format&fit=crop&q=80&w=500',
      stock: 90
    },
    {
      id: '17',
      name: 'Papa Criolla',
      price: 3500,
      description: 'Papa criolla pequeña y deliciosa (precio por kg).',
      category: 'verduras',
      image: 'https://images.unsplash.com/photo-1596550341175-9f759d65b3c2?auto=format&fit=crop&q=80&w=500',
      stock: 70
    },
    {
      id: '18',
      name: 'Lechuga Romana',
      price: 2000,
      description: 'Lechuga romana fresca y crujiente (precio por unidad).',
      category: 'verduras',
      image: 'https://images.unsplash.com/photo-1618076240776-51429091b680?auto=format&fit=crop&q=80&w=500',
      stock: 30
    },
    {
      id: '19',
      name: 'Queso Campesino',
      price: 15000,
      description: 'Queso campesino fresco y suave (precio por 500g).',
      category: 'lacteos',
      image: 'https://images.unsplash.com/photo-1607009634045-b4b8eb868b94?auto=format&fit=crop&q=80&w=500',
      stock: 25
    },
    {
      id: '20',
      name: 'Mantequilla',
      price: 8000,
      description: 'Mantequilla cremosa para untar (precio por 250g).',
      category: 'lacteos',
      image: 'https://images.unsplash.com/photo-1589984662645-23f94c26720b?auto=format&fit=crop&q=80&w=500',
      stock: 40
    },
    {
      id: '21',
      name: 'Crema de Leche',
      price: 7000,
      description: 'Crema de leche ideal para postres (precio por 200ml).',
      category: 'lacteos',
      image: 'https://images.unsplash.com/photo-1556908138-77b5dfd8d2f8?auto=format&fit=crop&q=80&w=500',
      stock: 35
    },
    {
      id: '22',
      name: 'Pan de Yuca',
      price: 4500,
      description: 'Pan de yuca suave y esponjoso (precio por paquete de 6).',
      category: 'panaderia',
      image: 'https://images.unsplash.com/photo-1606755962775-0a6b6238589f?auto=format&fit=crop&q=80&w=500',
      stock: 50
    },
    {
      id: '23',
      name: 'Arepa de Maíz',
      price: 3000,
      description: 'Arepa de maíz tradicional (precio por paquete de 5).',
      category: 'panaderia',
      image: 'https://images.unsplash.com/photo-1608500219756-d82d762d5e15?auto=format&fit=crop&q=80&w=500',
      stock: 60
    },
    {
      id: '24',
      name: 'Croissant',
      price: 2500,
      description: 'Croissant crujiente y mantecoso (precio por unidad).',
      category: 'panaderia',
      image: 'https://images.unsplash.com/photo-1530610476181-d8b3a8a7278e?auto=format&fit=crop&q=80&w=500',
      stock: 30
    },
    {
      id: '25',
      name: 'Carne Molida',
      price: 18000,
      description: 'Carne molida fresca para hamburguesas o guisos (precio por kg).',
      category: 'carnes',
      image: 'https://images.unsplash.com/photo-1593434577838-9f2f2a8a7db8?auto=format&fit=crop&q=80&w=500',
      stock: 45
    },
    {
      id: '26',
      name: 'Costilla de Cerdo',
      price: 22000,
      description: 'Costilla de cerdo jugosa para asar (precio por kg).',
      category: 'carnes',
      image: 'https://images.unsplash.com/photo-1603048297239-8d43e9e5e8ea?auto=format&fit=crop&q=80&w=500',
      stock: 20
    },
    {
      id: '27',
      name: 'Pescado Tilapia',
      price: 15000,
      description: 'Tilapia fresca para freír o asar (precio por kg).',
      category: 'carnes',
      image: 'https://images.unsplash.com/photo-1599816147276-5b5b0c680b3b?auto=format&fit=crop&q=80&w=500',
      stock: 35
    },
    {
      id: '28',
      name: 'Agua con Gas',
      price: 2500,
      description: 'Agua con gas refrescante (precio por 1.5L).',
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=500',
      stock: 80
    },
    {
      id: '29',
      name: 'Cerveza Águila',
      price: 3500,
      description: 'Cerveza Águila clásica (precio por 330ml).',
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1595670834557-249f2e3c0e65?auto=format&fit=crop&q=80&w=500',
      stock: 100
    },
    {
      id: '30',
      name: 'Té Helado',
      price: 4000,
      description: 'Té helado refrescante (precio por 500ml).',
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1556679343-c7306c93c8e7?auto=format&fit=crop&q=80&w=500',
      stock: 50
    },
    {
      id: '31',
      name: 'Arroz Blanco',
      price: 5000,
      description: 'Arroz blanco de grano largo (precio por kg).',
      category: 'granos',
      image: 'https://images.unsplash.com/photo-1586201375761-52aa8003809b?auto=format&fit=crop&q=80&w=500',
      stock: 70
    },
    {
      id: '32',
      name: 'Frijoles Rojos',
      price: 6000,
      description: 'Frijoles rojos secos para guisos (precio por kg).',
      category: 'granos',
      image: 'https://images.unsplash.com/photo-1603046899799-4b2e8703c0c0?auto=format&fit=crop&q=80&w=500',
      stock: 60
    }
  ],
  categories: [
    { id: 'frutas', name: 'Frutas' },
    { id: 'verduras', name: 'Verduras' },
    { id: 'lacteos', name: 'Lácteos' },
    { id: 'panaderia', name: 'Panadería' },
    { id: 'carnes', name: 'Carnes' },
    { id: 'bebidas', name: 'Bebidas' },
    { id: 'granos', name: 'Granos' } // Nueva categoría
  ]
};