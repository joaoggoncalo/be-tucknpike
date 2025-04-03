import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingService } from './training.service';
import { TrainingController } from './training.controller';
import { Training } from './training.entity';
import { Gymnast } from '../gymnasts/gymnast.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Training, Gymnast])],
  controllers: [TrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}
