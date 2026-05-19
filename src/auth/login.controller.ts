import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('login')
@Controller()
export class LoginController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({
    schema: {
      type: 'object',
      required: ['message', 'token'],
      properties: {
        message: { type: 'string' },
        token: { type: 'string' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    schema: {
      type: 'object',
      required: ['message'],
      properties: { message: { type: 'string' } },
    },
  })
  login(@Body() dto: LoginDto) {
    return {
      message: 'Autenticação',
      token: this.auth.signAccessToken(dto.email),
    };
  }
}
