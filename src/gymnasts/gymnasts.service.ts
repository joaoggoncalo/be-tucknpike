import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gymnast } from './gymnast.entity';
import { CreateGymnastDto } from './dto/create-gymnast.dto';
import { UpdateGymnastDto } from './dto/update-gymnast.dto';

@Injectable()
export class GymnastsService {
  constructor(
    @InjectRepository(Gymnast)
    private gymnastRepository: Repository<Gymnast>,
  ) {}

  async create(createGymnastDto: CreateGymnastDto): Promise<Gymnast> {
    try {
      const gymnast = this.gymnastRepository.create(createGymnastDto);
      return await this.gymnastRepository.save(gymnast);
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        const dbError = error as { code?: string };
        if (dbError.code === '23505') {
          throw new BadRequestException('User ID is already in use');
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Gymnast[]> {
    return this.gymnastRepository.find();
  }

  async findOne(userId: string): Promise<Gymnast> {
    const gymnast = await this.gymnastRepository.findOneBy({ userId });
    if (!gymnast) {
      throw new BadRequestException(`Gymnast with userId ${userId} not found`);
    }
    return gymnast;
  }

  async update(
    userId: string,
    updateGymnastDto: UpdateGymnastDto,
  ): Promise<Gymnast> {
    await this.gymnastRepository.update({ userId }, updateGymnastDto);
    return this.findOne(userId);
  }

  async remove(userId: string): Promise<void> {
    await this.gymnastRepository.delete({ userId });
  }
}
