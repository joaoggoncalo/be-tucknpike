import { ApiProperty } from '@nestjs/swagger';
import {
  IsUUID,
  IsNotEmpty,
  IsArray,
  IsDateString,
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @ApiProperty({ description: 'Latitude coordinate' })
  @IsNumber()
  @IsNotEmpty()
  readonly latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @IsNumber()
  @IsNotEmpty()
  readonly longitude: number;

  @ApiProperty({
    required: false,
    description: 'Address description (optional)',
  })
  @IsString()
  @IsOptional()
  readonly address?: string;
}

export class CreateTrainingDto {
  @ApiProperty({ description: 'UUID of the gymnast' })
  @IsUUID()
  @IsNotEmpty()
  readonly userId: string;

  @ApiProperty({ description: 'UUID of the coach (optional)', required: false })
  @IsUUID()
  @IsOptional()
  readonly coachId?: string;

  @ApiProperty({
    description: 'List of exercises to perform',
    example: ['10x burpees', '10 sit ups', '5 pull-ups'],
  })
  @IsArray()
  @IsString({ each: true })
  readonly exercises: string[];

  @ApiProperty({ description: 'Training date and time' })
  @IsDateString()
  readonly date: Date;

  @ApiProperty({
    description: 'User phone location data',
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  readonly location: LocationDto;
}
