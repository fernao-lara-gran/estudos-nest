import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser>(
    err: Error | undefined,
    user: TUser | false,
  ): TUser {
    if (err || !user) {
      throw new UnauthorizedException({ message: 'Não autorizado' });
    }
    return user;
  }
}
