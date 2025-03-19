import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CoachesService } from './coaches.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('coaches')
@Controller('coaches')
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Post()
  create(@Body() createCoachDto: CreateCoachDto) {
    return this.coachesService.create(createCoachDto);
  }

  @Get()
  findAll() {
    return this.coachesService.findAll();
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.coachesService.findOne(userId);
  }

  @Put(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateCoachDto: UpdateCoachDto,
  ) {
    return this.coachesService.update(userId, updateCoachDto);
  }

  @Delete(':userId')
  remove(@Param('userId') userId: string) {
    return this.coachesService.remove(userId);
  }

  @Post(':coachUserId/gymnasts/:gymnastUserId')
  addGymnast(
    @Param('coachUserId') coachUserId: string,
    @Param('gymnastUserId') gymnastUserId: string,
  ) {
    return this.coachesService.addGymnast(coachUserId, gymnastUserId);
  }
}
