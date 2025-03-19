import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { GymnastsService } from './gymnasts.service';
import { CreateGymnastDto } from './dto/create-gymnast.dto';
import { UpdateGymnastDto } from './dto/update-gymnast.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('gymnasts')
@Controller('gymnasts')
export class GymnastsController {
  constructor(private readonly gymnastsService: GymnastsService) {}

  @Post()
  create(@Body() createGymnastDto: CreateGymnastDto) {
    return this.gymnastsService.create(createGymnastDto);
  }

  @Get()
  findAll() {
    return this.gymnastsService.findAll();
  }

  // Use userId as the parameter
  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.gymnastsService.findOne(userId);
  }

  @Put(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateGymnastDto: UpdateGymnastDto,
  ) {
    return this.gymnastsService.update(userId, updateGymnastDto);
  }

  @Delete(':userId')
  remove(@Param('userId') userId: string) {
    return this.gymnastsService.remove(userId);
  }
}
