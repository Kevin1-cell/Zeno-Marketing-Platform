import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SorteosModule } from './sorteos/sorteos.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SorteosModule,
  ],
})
export class AppModule {}