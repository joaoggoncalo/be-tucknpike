import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CoachesService } from './coaches.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import {
  ApiTags,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('coaches')
@Controller('coaches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoachesController {
  constructor(private readonly coachesService: CoachesService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Coach created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid coach data provided.' })
  create(@Body() createCoachDto: CreateCoachDto) {
    return this.coachesService.create(createCoachDto);
  }

  @Get()
  @Roles('coach')
  @ApiOkResponse({ description: 'Coaches retrieved successfully.' })
  findAll() {
    return this.coachesService.findAll();
  }

  @Get(':userId')
  @Roles('coach')
  @ApiOkResponse({ description: 'Coach retrieved successfully.' })
  findOne(@Param('userId') userId: string) {
    return this.coachesService.findOne(userId);
  }

  @Put(':userId')
  @Roles('coach')
  @ApiOkResponse({ description: 'Coach updated successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid update data provided.' })
  update(
    @Param('userId') userId: string,
    @Body() updateCoachDto: UpdateCoachDto,
  ) {
    return this.coachesService.update(userId, updateCoachDto);
  }

  @Delete(':userId')
  @Roles('coach')
  @ApiOkResponse({ description: 'Coach deleted successfully.' })
  remove(@Param('userId') userId: string) {
    return this.coachesService.remove(userId);
  }

  @Post(':coachUserId/gymnasts/:gymnastUserId')
  @Roles('coach')
  @ApiOkResponse({ description: 'Gymnast added to coach successfully.' })
  @ApiBadRequestResponse({
    description: 'Invalid data provided for linking gymnast.',
  })
  addGymnast(
    @Param('coachUserId') coachUserId: string,
    @Param('gymnastUserId') gymnastUserId: string,
  ) {
    return this.coachesService.addGymnast(coachUserId, gymnastUserId);
  }
}
