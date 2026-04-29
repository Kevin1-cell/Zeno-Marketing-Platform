import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) throw new UnauthorizedException('Credenciales inválidas');

    const passwordValid = await bcrypt.compare(password, admin.password_hash);
    if (!passwordValid) throw new UnauthorizedException('Credenciales inválidas');

    const payload = { sub: admin.id, email: admin.email };
    const access_token = this.jwtService.sign(payload, {
      expiresIn: '1h',
      secret: this.configService.get('JWT_SECRET'),
    });
    const refresh_token = this.jwtService.sign(payload, {
      expiresIn: '7d',
      secret: this.configService.get('JWT_REFRESH_SECRET'),
    });
    return { access_token, refresh_token, expires_in: 3600 };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });
      const newAccessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email },
        { expiresIn: '1h', secret: this.configService.get('JWT_SECRET') },
      );
      return { access_token: newAccessToken, refresh_token: refreshToken, expires_in: 3600 };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}