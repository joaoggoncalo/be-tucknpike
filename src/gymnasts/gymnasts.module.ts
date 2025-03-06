import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymnastsService } from './gymnasts.service';
import { GymnastsController } from './gymnasts.controller';
import { Gymnast } from './gymnast.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Gymnast])],
  controllers: [GymnastsController],
  providers: [GymnastsService],
})
export class GymnastsModule {}
