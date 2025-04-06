import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TrainingService } from './training.service';
import { CreateTrainingDto } from './dto/create-training.dto';
import { UpdateTrainingStatusDto } from './dto/update-training-status.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UpdateExercisesStatusDto } from './dto/exercise-status.dto';
import { Request } from 'express';
import { Training } from './training.entity';
import { UpdateLocationDto } from './dto/update-location.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@ApiTags('trainings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trainings')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  create(@Body() createTrainingDto: CreateTrainingDto) {
    return this.trainingService.create(createTrainingDto);
  }

  @Get('my-trainings')
  findMyTrainings(@Req() req: RequestWithUser) {
    console.log('req.user.userId');
    // User can only access their own trainings
    return this.trainingService.findAllByUser(req.user.userId, req.user.userId);
  }

  @Get('gymnast/:gymnastId')
  findGymnastTrainings(
    @Param('gymnastId') gymnastId: string,
    @Req() req: RequestWithUser,
  ) {
    // Only coaches can access their gymnasts' trainings
    return this.trainingService.findAllByUser(gymnastId, req.user.userId);
  }

  // Add to TrainingController
  @Get('my-athletes-trainings')
  findAllAthletesTrainings(@Req() req: RequestWithUser) {
    return this.trainingService.findAllForCoachAthletes(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.trainingService.findOne(id, req.user.userId);
  }

  @Put(':id/location')
  updateLocation(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.trainingService.updateLocation(
      id,
      updateLocationDto.location,
      req.user.userId,
    );
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: Partial<Training>,
    @Req() req: RequestWithUser,
  ) {
    return this.trainingService.update(id, updateData, req.user.userId);
  }

  @Put(':id/exercises/status')
  updateExerciseStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateExercisesStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.trainingService.updateExerciseStatus(
      id,
      updateDto.exercises,
      req.user.userId,
    );
  }

  @Put(':id/exercises/add')
  addExercises(
    @Param('id') id: string,
    @Body() body: { exercises: string[] },
    @Req() req: RequestWithUser,
  ) {
    return this.trainingService.addExercises(
      id,
      body.exercises,
      req.user.userId,
    );
  }

  @Put(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateTrainingStatusDto,
    @Req() req: RequestWithUser,
  ) {
    return this.trainingService.updateStatus(
      id,
      updateStatusDto.status,
      req.user.userId,
    );
  }
}
