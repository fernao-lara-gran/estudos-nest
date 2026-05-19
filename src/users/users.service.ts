import { BadRequestException, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { ResultSetHeader } from 'mysql2/promise';
import { users } from '../database/schema';
import { DrizzleService } from '../infra/drizzle/drizzle.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly drizzle: DrizzleService) {}

  async list(pageRaw?: string, limitRaw?: string) {
    const page = Math.max(1, Number(pageRaw) || 1);
    const limit = Math.min(100, Math.max(1, Number(limitRaw) || 10));
    const start = (page - 1) * limit;

    const db = this.drizzle.getDb();
    const all = await db.select().from(users);
    const slice = all.slice(start, start + limit);

    return {
      message: 'List of users',
      users: slice,
      page,
      limit,
    };
  }

  async create(dto: CreateUserDto) {
    const db = this.drizzle.getDb();

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, dto.email))
      .limit(1);

    if (existing.length > 0) {
      throw new BadRequestException({ message: 'Email já cadastrado' });
    }

    const insertResult = await db.insert(users).values({
      name: dto.name,
      email: dto.email,
    });

    const header = insertResult[0] as ResultSetHeader;
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, header.insertId));

    return {
      message: 'User created',
      name: user.name,
      email: user.email,
    };
  }
}
