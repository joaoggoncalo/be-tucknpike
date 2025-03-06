import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoachesController } from './coaches.controller';
import { CoachesService } from './coaches.service';
import { Coach } from './coach.entity';
import { Gymnast } from '../gymnasts/gymnast.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coach, Gymnast])],
  controllers: [CoachesController],
  providers: [CoachesService],
})
export class CoachesModule {}
