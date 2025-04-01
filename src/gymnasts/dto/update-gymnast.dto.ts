import { ApiProperty } from '@nestjs/swagger';

export class UpdateGymnastDto {
  @ApiProperty({ required: false })
  readonly trainingIds?: string[];
  @ApiProperty({ required: false })
  readonly coaches?: string[];
}
