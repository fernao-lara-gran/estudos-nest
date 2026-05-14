import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

@Injectable()
export class UsersService {
  private readonly users: StoredUser[] = [];

  list(pageRaw?: string, limitRaw?: string) {
    const page = Math.max(1, Number(pageRaw) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitRaw) || 10));
    const start = (page - 1) * limit;
    const slice = this.users.slice(start, start + limit);
    return {
      message: 'List of users',
      users: slice,
      usersRedis: '[]',
      page,
      limit,
    };
  }

  create(dto: CreateUserDto) {
    if (this.users.some((u) => u.email === dto.email)) {
      throw new BadRequestException({ message: 'Email já cadastrado' });
    }
    const row: StoredUser = {
      id: String(this.users.length + 1),
      name: dto.name,
      email: dto.email,
      created_at: new Date().toISOString(),
    };
    this.users.push(row);
    return {
      message: 'User created',
      name: dto.name,
      email: dto.email,
    };
  }
}
