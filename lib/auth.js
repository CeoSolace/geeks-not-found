export function readSession() {
  return {
    sub: 'dev-founder',
    username: 'Founder',
    role: 'founder',
  };
}

export function isLoggedIn() {
  return true;
}

export async function getCurrentUser() {
  return {
    _id: 'dev-founder',
    name: 'Founder',
    username: 'Founder',
    email: '',
    role: 'founder',
    mustChangePassword: false,
  };
}

export async function requireDashboardUser() {
  return getCurrentUser();
}

export async function requireFounder() {
  return getCurrentUser();
}

export function requireDashboardSession() {
  return readSession();
}