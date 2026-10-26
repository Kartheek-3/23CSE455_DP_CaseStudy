import { create } from 'zustand';
import Cookies from 'js-cookie';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,

  hydrateFromCookies: () => {
    const token = Cookies.get('token') || null;
    const userCookie = Cookies.get('user');

    let user = null;

    if (userCookie && userCookie !== 'undefined' && userCookie !== 'null') {
      try {
        user = JSON.parse(userCookie);
      } catch {
        user = null;
      }
    }

    set({ user, token });
  },

  login: (user, token) => {
    Cookies.set('token', token, { expires: 1 }); // Expires in 1 day
    Cookies.set('user', JSON.stringify(user), { expires: 1 });
    set({ user, token });
  },

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
    set({ user: null, token: null });
  },
}));