import { ApiProperty } from '@nestjs/swagger';

export class ExerciseStatusDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  completed: boolean;
}

export class UpdateExercisesStatusDto {
  @ApiProperty({ type: [ExerciseStatusDto] })
  exercises: ExerciseStatusDto[];
}
