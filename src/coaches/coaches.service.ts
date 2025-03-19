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

  async findOne(userId: string): Promise<Coach> {
    const coach = await this.coachRepository.findOneBy({ userId });
    if (!coach) {
      throw new BadRequestException(`Coach with userId ${userId} not found`);
    }
    return coach;
  }

  async update(userId: string, updateCoachDto: UpdateCoachDto): Promise<Coach> {
    await this.coachRepository.update({ userId }, updateCoachDto);
    return this.findOne(userId);
  }

  async remove(userId: string): Promise<void> {
    await this.coachRepository.delete({ userId });
  }

  // Adds a gymnast (by userId) to the coach's gymnasts array
  // and also adds the coach's userId to the gymnast's coaches array.
  async addGymnast(coachUserId: string, gymnastUserId: string): Promise<Coach> {
    // Retrieve coach using the userId.
    const coach = await this.coachRepository.findOneBy({ userId: coachUserId });
    if (!coach) {
      throw new BadRequestException(
        `Coach with userId ${coachUserId} not found`,
      );
    }

    // Retrieve gymnast using the userId.
    const gymnast = await this.gymnastRepository.findOneBy({
      userId: gymnastUserId,
    });
    if (!gymnast) {
      throw new BadRequestException(
        `Gymnast with userId ${gymnastUserId} not found`,
      );
    }

    // Initialize arrays if necessary.
    if (!coach.gymnasts) {
      coach.gymnasts = [];
    }
    if (!gymnast.coaches) {
      gymnast.coaches = [];
    }

    // Check that the gymnast is not already associated with the coach.
    if (coach.gymnasts.includes(gymnastUserId)) {
      throw new BadRequestException(
        'Gymnast is already associated with this coach',
      );
    }

    // Add gymnastUserId to the coach's gymnasts array.
    coach.gymnasts.push(gymnastUserId);

    // Also add coachUserId to the gymnast's coaches array if not already added.
    if (!gymnast.coaches.includes(coachUserId)) {
      gymnast.coaches.push(coachUserId);
    }

    // Save both records.
    await this.coachRepository.save(coach);
    await this.gymnastRepository.save(gymnast);
    return coach;
  }
}
