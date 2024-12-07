// src/core/domain/interfaces/repositories/IUserRepository.ts
import { User } from '../../entities/User';

export interface IUserRepository {
login(email: string, password: string): Promise<User>;
register(userData: Partial<User> & { password: string }): Promise<User>;
getCurrentUser(): Promise<User | null>;
}