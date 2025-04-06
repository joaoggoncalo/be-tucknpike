import { ApiProperty } from '@nestjs/swagger';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from './create-training.dto';

export class UpdateLocationDto {
  @ApiProperty({
    description: 'Updated location data',
    type: LocationDto,
  })
  @ValidateNested()
  @Type(() => LocationDto)
  readonly location: LocationDto;
}
