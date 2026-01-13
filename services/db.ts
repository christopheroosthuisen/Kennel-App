
import { User, Organization } from '../types';

// Simulated Database Delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

class DatabaseService {
  private getStorage(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setStorage(key: string, data: any[]) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Users ---

  async findUserByEmail(email: string): Promise<User | undefined> {
    await delay(500);
    const users = this.getStorage('ops_users') as User[];
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async createUser(user: User): Promise<User> {
    await delay(800);
    const users = this.getStorage('ops_users') as User[];
    users.push(user);
    this.setStorage('ops_users', users);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await delay(400);
    const users = this.getStorage('ops_users') as User[];
    const index = users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    const updatedUser = { ...users[index], ...updates };
    users[index] = updatedUser;
    this.setStorage('ops_users', users);
    return updatedUser;
  }

  // --- Organizations ---

  async getOrganization(id: string): Promise<Organization | undefined> {
    await delay(400);
    const orgs = this.getStorage('ops_orgs') as Organization[];
    return orgs.find(o => o.id === id);
  }

  async createOrganization(org: Organization): Promise<Organization> {
    await delay(800);
    const orgs = this.getStorage('ops_orgs') as Organization[];
    orgs.push(org);
    this.setStorage('ops_orgs', orgs);
    return org;
  }
}

export const db = new DatabaseService();
