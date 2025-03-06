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
          throw new BadRequestException('Email is already in use');
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Gymnast[]> {
    return this.gymnastRepository.find({ relations: ['coaches'] });
  }

  async findOne(id: string): Promise<Gymnast> {
    const gymnast = await this.gymnastRepository.findOne({
      where: { id },
      relations: ['coaches'],
    });
    if (!gymnast) {
      throw new BadRequestException(`Gymnast with id ${id} not found`);
    }
    return gymnast;
  }

  async update(
    id: string,
    updateGymnastDto: UpdateGymnastDto,
  ): Promise<Gymnast> {
    await this.gymnastRepository.update(id, updateGymnastDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.gymnastRepository.delete(id);
  }
}
