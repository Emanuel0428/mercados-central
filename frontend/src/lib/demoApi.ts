import { products as staticProducts } from '../data/products';

// ─── Types ───────────────────────────────────────────────────────────────────

interface DemoUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

interface DemoOrderItem {
  id: number;
  order_id: number;
  product_id: string;
  quantity: number;
  price: number;
  name: string;
  image?: string;
}

interface DemoOrder {
  id: number;
  user_id: number;
  total: number;
  status: 'pending' | 'processing' | 'delivered';
  created_at: string;
  payment_method: string;
  payment_details: { bill?: number } | null;
  shipping_details: { name: string; address: string; city: string; phone: string };
  email?: string;
  items: DemoOrderItem[];
  transfer_receipt?: string | null;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// ─── Storage keys ────────────────────────────────────────────────────────────

const KEYS = {
  users: 'demo_users',
  orders: 'demo_orders',
};

// ─── Seed data ───────────────────────────────────────────────────────────────

const SEED_USERS: DemoUser[] = [
  { id: 1, name: 'Admin Demo', email: 'admin@demo.com', password: 'admin123', role: 'admin' },
  { id: 2, name: 'Usuario Demo', email: 'usuario@demo.com', password: 'usuario123', role: 'user' },
];

// ─── Storage helpers ─────────────────────────────────────────────────────────

function getUsers(): DemoUser[] {
  const raw = localStorage.getItem(KEYS.users);
  if (raw) return JSON.parse(raw);
  localStorage.setItem(KEYS.users, JSON.stringify(SEED_USERS));
  return SEED_USERS;
}

function saveUsers(users: DemoUser[]): void {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

function getOrders(): DemoOrder[] {
  return JSON.parse(localStorage.getItem(KEYS.orders) || '[]');
}

function saveOrders(orders: DemoOrder[]): void {
  localStorage.setItem(KEYS.orders, JSON.stringify(orders));
}

function getUserFromToken(token: string): DemoUser {
  const userId = parseInt(token.replace('demo_token_', ''), 10);
  if (isNaN(userId)) throw new Error('TOKEN_EXPIRED');
  const user = getUsers().find((u) => u.id === userId);
  if (!user) throw new Error('TOKEN_EXPIRED');
  return user;
}

function makeToken(userId: number): string {
  return `demo_token_${userId}`;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export function demoLogin(email: string, password: string) {
  const user = getUsers().find((u) => u.email === email && u.password === password);
  if (!user) throw new Error('Credenciales inválidas');
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    token: makeToken(user.id),
  };
}

export function demoRegister(name: string, email: string, password: string): void {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    throw new Error('Ya existe una cuenta con ese email');
  }
  const newUser: DemoUser = {
    id: Date.now(),
    name,
    email,
    password,
    role: 'user',
  };
  saveUsers([...users, newUser]);
}

// ─── Account / Profile ───────────────────────────────────────────────────────

export function demoGetProfile(token: string) {
  const user = getUserFromToken(token);
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export function demoUpdateProfile(token: string, data: { name: string; email: string }) {
  const user = getUserFromToken(token);
  saveUsers(getUsers().map((u) => (u.id === user.id ? { ...u, ...data } : u)));
  return { name: data.name, email: data.email };
}

export function demoUpdatePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): void {
  const user = getUserFromToken(token);
  if (user.password !== currentPassword) throw new Error('Contraseña actual incorrecta');
  saveUsers(getUsers().map((u) => (u.id === user.id ? { ...u, password: newPassword } : u)));
}

// ─── User orders ─────────────────────────────────────────────────────────────

export function demoGetUserOrders(token: string) {
  const user = getUserFromToken(token);
  return getOrders()
    .filter((o) => o.user_id === user.id)
    .map((o) => ({
      ...o,
      shipping_details: o.shipping_details,
    }));
}

export function demoMarkOrderReceived(token: string, orderId: number): void {
  const user = getUserFromToken(token);
  const orders = getOrders();
  const order = orders.find((o) => o.id === orderId && o.user_id === user.id);
  if (!order) throw new Error('Pedido no encontrado');
  saveOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'delivered' } : o)));
}

// ─── Checkout / Create order ─────────────────────────────────────────────────

export function demoCreateOrder(
  token: string,
  data: {
    cart: CartItem[];
    shippingDetails: { name: string; address: string; city: string; phone: string };
    paymentMethod: string;
    paymentDetails: { bill?: number } | null;
  }
) {
  const user = getUserFromToken(token);
  const subtotal = data.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + 5000; // shipping

  const items: DemoOrderItem[] = data.cart.map((item, i) => ({
    id: i + 1,
    order_id: 0,
    product_id: item.id,
    quantity: item.quantity,
    price: item.price,
    name: item.name,
    image: item.image,
  }));

  const newOrder: DemoOrder = {
    id: Date.now(),
    user_id: user.id,
    total,
    status: 'pending',
    created_at: new Date().toISOString(),
    payment_method: data.paymentMethod,
    payment_details: data.paymentDetails,
    shipping_details: data.shippingDetails,
    email: user.email,
    items: items.map((item) => ({ ...item, order_id: Date.now() })),
    transfer_receipt: null,
  };

  saveOrders([...getOrders(), newOrder]);

  return {
    orderId: newOrder.id,
    total: newOrder.total,
    shippingDetails: newOrder.shipping_details,
    paymentMethod: newOrder.payment_method,
    paymentDetails: newOrder.payment_details,
    email: user.email,
    createdAt: newOrder.created_at,
    items: newOrder.items,
  };
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export function demoGetAdminProducts() {
  return staticProducts.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    category: p.category,
    stock: p.stock,
  }));
}

export function demoGetAdminOrders() {
  const users = getUsers();
  return getOrders().map((o) => {
    const user = users.find((u) => u.id === o.user_id);
    return { ...o, email: user?.email ?? 'Anónimo' };
  });
}

export function demoGetAdminUsers() {
  const orders = getOrders();
  return getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    order_count: orders.filter((o) => o.user_id === u.id).length,
  }));
}

export function demoGetAdminOrderItems(orderId: number): DemoOrderItem[] {
  const order = getOrders().find((o) => o.id === orderId);
  return order?.items ?? [];
}

export function demoUpdateOrderStatus(token: string, orderId: number, status: string): void {
  getUserFromToken(token);
  saveOrders(getOrders().map((o) => (o.id === orderId ? { ...o, status: status as DemoOrder['status'] } : o)));
}
