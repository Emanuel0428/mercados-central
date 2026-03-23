import * as demo from './demoApi';
import type { CartItem } from './demoApi';

// ─── Config ──────────────────────────────────────────────────────────────────

export const API_URL: string = import.meta.env.VITE_API_URL ?? '';

/**
 * True when VITE_API_URL is not set (e.g. Vercel without a backend).
 * All operations will use localStorage instead of real HTTP calls.
 */
export const IS_DEMO: boolean = !import.meta.env.VITE_API_URL;

// ─── Internal fetch helper (real mode only) ───────────────────────────────────

async function realFetch(url: string, token?: string, options?: RequestInit) {
  const res = await fetch(`${API_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
  if (res.status === 401 || res.status === 403) throw new Error('TOKEN_EXPIRED');
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? 'Error del servidor');
  }
  return res.json();
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  if (IS_DEMO) return demo.demoLogin(email, password);
  return realFetch('/api/auth/login', undefined, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string): Promise<void> {
  if (IS_DEMO) return demo.demoRegister(name, email, password);
  await realFetch('/api/auth/register', undefined, {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// ─── Account / Profile ───────────────────────────────────────────────────────

export async function getProfile(token: string) {
  if (IS_DEMO) return demo.demoGetProfile(token);
  return realFetch('/api/account/profile', token);
}

export async function updateProfile(token: string, data: { name: string; email: string }) {
  if (IS_DEMO) return demo.demoUpdateProfile(token, data);
  return realFetch('/api/account/profile', token, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function updatePassword(
  token: string,
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (IS_DEMO) return demo.demoUpdatePassword(token, currentPassword, newPassword);
  await realFetch('/api/account/password', token, {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ─── User orders ─────────────────────────────────────────────────────────────

export async function getUserOrders(token: string) {
  if (IS_DEMO) return demo.demoGetUserOrders(token);
  return realFetch('/api/account/orders', token);
}

export async function markOrderReceived(token: string, orderId: number): Promise<void> {
  if (IS_DEMO) return demo.demoMarkOrderReceived(token, orderId);
  await realFetch(`/api/account/orders/${orderId}/received`, token, { method: 'PATCH' });
}

// ─── Checkout ────────────────────────────────────────────────────────────────

export async function createOrder(
  token: string,
  data: {
    cart: CartItem[];
    shippingDetails: { name: string; address: string; city: string; phone: string };
    paymentMethod: string;
    paymentDetails: { bill?: number } | null;
  }
) {
  if (IS_DEMO) return demo.demoCreateOrder(token, data);
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Error al procesar la orden');
  return res.json();
}

export async function uploadReceipt(
  token: string,
  orderId: number,
  file: File
): Promise<void> {
  if (IS_DEMO) {
    // Simulate a successful upload in demo mode (no file stored)
    return Promise.resolve();
  }
  const formData = new FormData();
  formData.append('receipt', file);
  const res = await fetch(`${API_URL}/api/orders/${orderId}/receipt`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? 'Error al subir el comprobante');
  }
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function getAdminProducts(token: string) {
  if (IS_DEMO) return demo.demoGetAdminProducts();
  return realFetch('/api/admin/products', token);
}

export async function getAdminOrders(token: string) {
  if (IS_DEMO) return demo.demoGetAdminOrders();
  return realFetch('/api/admin/orders', token);
}

export async function getAdminUsers(token: string) {
  if (IS_DEMO) return demo.demoGetAdminUsers();
  return realFetch('/api/admin/users', token);
}

export async function getAdminOrderItems(token: string, orderId: number) {
  if (IS_DEMO) return demo.demoGetAdminOrderItems(orderId);
  return realFetch(`/api/admin/orders/${orderId}/items`, token);
}

export async function updateAdminOrderStatus(
  token: string,
  orderId: number,
  status: string
): Promise<void> {
  if (IS_DEMO) return demo.demoUpdateOrderStatus(token, orderId, status);
  await realFetch(`/api/admin/orders/${orderId}/status`, token, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
