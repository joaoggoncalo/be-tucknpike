// src/gymnasts/dto/update-season-goals.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateSeasonGoalsDto {
  @ApiProperty({
    description: 'New season goals for the gymnast',
    example: 'Master double backflip and qualify for nationals',
  })
  @IsNotEmpty()
  @IsString()
  seasonGoals: string;
}
