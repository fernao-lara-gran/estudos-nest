import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  signAccessToken(email: string): string {
    return this.jwt.sign({ sub: email });
  }
}
