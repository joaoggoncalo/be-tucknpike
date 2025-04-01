import { ApiProperty } from '@nestjs/swagger';

export class CreateGymnastDto {
  @ApiProperty()
  readonly userId: string;
  @ApiProperty({ required: false })
  readonly trainingIds?: string[];
  @ApiProperty()
  readonly coaches?: string[];
}
