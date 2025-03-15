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
          throw new BadRequestException('User ID is already in use');
        }
      }
      throw error;
    }
  }

  async findAll(): Promise<Coach[]> {
    return this.coachRepository.find();
  }

  async findOne(id: string): Promise<Coach> {
    const coach = await this.coachRepository.findOneBy({ id });
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

  // Adds a gymnast (by ID) to the coach's gymnasts array.
  async addGymnast(coachId: string, gymnastId: string): Promise<Coach> {
    const coach = await this.coachRepository.findOneBy({ id: coachId });
    if (!coach) {
      throw new BadRequestException(`Coach with id ${coachId} not found`);
    }

    // Check if the gymnast exists.
    const gymnast = await this.gymnastRepository.findOneBy({ id: gymnastId });
    if (!gymnast) {
      throw new BadRequestException(`Gymnast with id ${gymnastId} not found`);
    }

    // Initialize gymnasts array if null.
    if (!coach.gymnasts) {
      coach.gymnasts = [];
    }
    // Check for duplicate gymnast.
    if (coach.gymnasts.includes(gymnastId)) {
      throw new BadRequestException(
        'Gymnast is already associated with this coach',
      );
    }
    coach.gymnasts.push(gymnastId);
    return this.coachRepository.save(coach);
  }
}
