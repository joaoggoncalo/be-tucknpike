import { ApiProperty } from '@nestjs/swagger';

export class UpdateCoachDto {
  @ApiProperty({ required: false })
  readonly gymnasts?: string[];
}
