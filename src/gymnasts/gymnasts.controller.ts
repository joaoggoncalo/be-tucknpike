import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { GymnastsService } from './gymnasts.service';
import { CreateGymnastDto } from './dto/create-gymnast.dto';
import { UpdateGymnastDto } from './dto/update-gymnast.dto';
import {
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateSeasonGoalsDto } from './update-season-goals.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
  };
}

@ApiTags('gymnasts')
@Controller('gymnasts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GymnastsController {
  constructor(private readonly gymnastsService: GymnastsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Gymnast created successfully.' })
  @ApiBadRequestResponse({ description: 'Invalid data provided.' })
  create(@Body() createGymnastDto: CreateGymnastDto) {
    return this.gymnastsService.create(createGymnastDto);
  }

  @Get()
  @Roles('coach', 'gymnast')
  @ApiOkResponse({ description: 'Gymnasts retrieved successfully.' })
  findAll() {
    return this.gymnastsService.findAll();
  }

  @Get('my-season-goal')
  @Roles('gymnast')
  @ApiOkResponse({ description: 'Season goal retrieved successfully.' })
  getMySeasonGoal(@Req() req: RequestWithUser) {
    return this.gymnastsService.getMySeasonGoal(req.user.userId);
  }

  @Get(':userId')
  @Roles('coach', 'gymnast')
  @ApiOkResponse({ description: 'Gymnast retrieved successfully.' })
  findOne(@Param('userId') userId: string) {
    return this.gymnastsService.findOne(userId);
  }

  @Put(':userId')
  @Roles('gymnast')
  @ApiOkResponse({ description: 'Gymnast updated successfully.' })
  update(
    @Param('userId') userId: string,
    @Body() updateGymnastDto: UpdateGymnastDto,
  ) {
    return this.gymnastsService.update(userId, updateGymnastDto);
  }

  @Delete(':userId')
  @Roles('gymnast')
  @ApiOkResponse({ description: 'Gymnast deleted successfully.' })
  remove(@Param('userId') userId: string) {
    return this.gymnastsService.remove(userId);
  }

  @Put(':userId/season-goals')
  @Roles('coach')
  @ApiOkResponse({ description: 'Season goals updated successfully.' })
  @ApiBadRequestResponse({ description: 'Not authorized or invalid data.' })
  updateSeasonGoals(
    @Param('userId') gymnastId: string,
    @Body() updateSeasonGoalsDto: UpdateSeasonGoalsDto,
    @Req() req: RequestWithUser,
  ) {
    return this.gymnastsService.updateSeasonGoals(
      gymnastId,
      updateSeasonGoalsDto.seasonGoals,
      req.user.userId,
    );
  }
}
