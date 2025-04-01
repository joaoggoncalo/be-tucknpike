import { ApiProperty } from '@nestjs/swagger';

export class CreateCoachDto {
  @ApiProperty()
  readonly userId: string;
  @ApiProperty()
  readonly gymnasts?: string[];
}
