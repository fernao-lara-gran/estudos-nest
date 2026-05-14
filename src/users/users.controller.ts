import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@ApiTags('usuários')
@ApiBearerAuth('bearerAuth')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ description: 'Lista paginada' })
  list(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.usersService.list(page, limit);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Detalhe por id (eco do path)' })
  getById(@Param('id') id: string) {
    return { message: 'User id', id };
  }

  @Post()
  @HttpCode(201)
  @ApiCreatedResponse({
    schema: {
      type: 'object',
      required: ['message', 'name', 'email'],
      properties: {
        message: { type: 'string' },
        name: { type: 'string' },
        email: { type: 'string' },
      },
    },
  })
  @ApiBadRequestResponse({
    schema: {
      type: 'object',
      required: ['message'],
      properties: { message: { type: 'string' } },
    },
  })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
