import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from './coach.entity';
import { Gymnast } from '../gymnasts/gymnast.entity';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';

@Injectable()
export class CoachesService {
  constructor(
    @InjectRepository(Coach)
    private coachRepository: Repository<Coach>,
    @InjectRepository(Gymnast)
    private gymnastRepository: Repository<Gymnast>,
  ) {}

  async create(createCoachDto: CreateCoachDto): Promise<Coach> {
    try {
      const coach = this.coachRepository.create(createCoachDto);
      return await this.coachRepository.save(coach);
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

  async findAll(): Promise<Coach[]> {
    return this.coachRepository.find({ relations: ['gymnasts'] });
  }

  async findOne(id: string): Promise<Coach> {
    const coach = await this.coachRepository.findOne({
      where: { id },
      relations: ['gymnasts'],
    });
    if (!coach) {
      throw new BadRequestException(`Coach with id ${id} not found`);
    }
    return coach;
  }

  async update(id: string, updateCoachDto: UpdateCoachDto): Promise<Coach> {
    await this.coachRepository.update(id, updateCoachDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.coachRepository.delete(id);
  }

  // New method: add a gymnast to a coach
  async addGymnast(coachId: string, gymnastId: string): Promise<Coach> {
    // Retrieve coach with its current gymnasts
    const coach = await this.coachRepository.findOne({
      where: { id: coachId },
      relations: ['gymnasts'],
    });
    if (!coach) {
      throw new BadRequestException(`Coach with id ${coachId} not found`);
    }

    // Retrieve the gymnast
    const gymnast = await this.gymnastRepository.findOne({
      where: { id: gymnastId },
    });
    if (!gymnast) {
      throw new BadRequestException(`Gymnast with id ${gymnastId} not found`);
    }

    // Check if the gymnast is already associated with this coach
    if (coach.gymnasts.some((g) => g.id === gymnast.id)) {
      throw new BadRequestException(
        'Gymnast is already associated with this coach',
      );
    }

    // Add the gymnast and save the updated coach
    coach.gymnasts.push(gymnast);
    return this.coachRepository.save(coach);
  }
}
