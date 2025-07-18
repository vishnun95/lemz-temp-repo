
import { AuthUser } from './types';

export class AuthService {
  private static readonly TOKEN_KEY = 'fashion_admin_token';
  private static readonly USER_KEY = 'fashion_admin_user';

  static login(email: string, password: string): Promise<AuthUser> {
    return new Promise((resolve, reject) => {
      // Simulate API call delay
      setTimeout(() => {
        if (email === 'admin@seller.com' && password === 'admin123') {
          const user: AuthUser = {
            id: '1',
            email: 'admin@seller.com',
            name: 'Lemz Attire Stories',
            token: 'mock-jwt-token-' + Date.now(),
          };
          
          localStorage.setItem(this.TOKEN_KEY, user.token);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
          
          resolve(user);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static getCurrentUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    const userStr = localStorage.getItem(this.USER_KEY);
    
    if (!token || !userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    
    return localStorage.getItem(this.TOKEN_KEY);
  }
}
