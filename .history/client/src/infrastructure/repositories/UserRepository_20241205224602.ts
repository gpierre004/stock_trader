// src/infrastructure/repositories/UserRepository.ts
import { IUserRepository } from '@/core/domain/interfaces/repositories/IUserRepository';
import { User } from '@/core/domain/entities/User';
import { api } from '../api/axios.config';

export class UserRepository implements IUserRepository {
  async login(email: string, password: string): Promise<User> {
    const response = await api.post('/api/login', { email, password });
    return response.data.user;
  }

  async register(userData: Partial<User> & { password: string }): Promise<User> {
    const response = await api.post('/api/register', userData);
    return response.data.user;
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await api.get('/api/me');
      return response.data.user;
    } catch {
      return null;
    }
  }
}