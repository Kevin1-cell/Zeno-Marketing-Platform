import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ParticipantsModule } from './participants/participants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ParticipantsModule,
  ],
})
export class AppModule {}