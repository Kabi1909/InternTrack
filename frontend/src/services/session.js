const tokenKey = 'interntrack.token';
export const session = {
  token: () => localStorage.getItem(tokenKey) || sessionStorage.getItem(tokenKey),
  save(token, remember) {
    this.clear();
    (remember ? localStorage : sessionStorage).setItem(tokenKey, token);
  },
  clear() {
    localStorage.removeItem(tokenKey);
    sessionStorage.removeItem(tokenKey);
  },
};
