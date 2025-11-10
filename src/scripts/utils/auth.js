export function isLoggedIn() {
  return !!localStorage.getItem('authToken');
}

export function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userName');
  window.location.hash = '/login';
}
