import { User } from '../../core/domain/entities/User';
import { api } from '../api/axios.config';

export class UserRepository {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post('/api/login', { email, password });
    const { token, user } = response.data;
    
    // Store the token
    localStorage.setItem('token', token);
    
    // Set the token in axios defaults
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return user;
  }

  async register(userData: Partial<User> & { password: string }): Promise<User> {
    const response = await api.post('/api/register', userData);
    const { token, user } = response.data;
    
    // Store the token
    localStorage.setItem('token', token);
    
    // Set the token in axios defaults
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    return user;
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      // Set the token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const response = await api.get('/api/me');
      return response.data.user;
    } catch {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      return null;
    }
  }
}
