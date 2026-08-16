import { apiGet, apiPost } from './client';

export async function login(data) {
  return apiPost('/auth/login', data);
}

export async function register(data) {
  return apiPost('/auth/register', data);
}

export async function getCurrentUser() {
  return apiGet('/auth/current-user');
}

export async function logout() {
  return apiGet('/auth/logout');
}

export async function verifyEmail(token) {
  return apiGet(`/auth/verify/${token}`);
}

export async function sendContact(data) {
  return apiPost('/contacto', data);
}
