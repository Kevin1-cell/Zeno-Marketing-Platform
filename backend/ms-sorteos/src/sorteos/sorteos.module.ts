import { Module } from '@nestjs/common';
import { SorteosController } from './sorteos.controller';
import { SorteosService } from './sorteos.service';
import { SorteosGateway } from '../gateway/sorteos.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [SorteosController],
  providers: [SorteosService, SorteosGateway, JwtStrategy],
})
export class SorteosModule {}