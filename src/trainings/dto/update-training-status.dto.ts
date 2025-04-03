import { ApiProperty } from '@nestjs/swagger';
import { TrainingStatus } from '../training.entity';

export class UpdateTrainingStatusDto {
  @ApiProperty({ enum: TrainingStatus })
  status: TrainingStatus;
}
