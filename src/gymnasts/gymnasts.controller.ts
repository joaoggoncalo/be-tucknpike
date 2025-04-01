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
}
