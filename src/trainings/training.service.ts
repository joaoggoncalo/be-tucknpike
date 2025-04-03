import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { Training, TrainingStatus } from './training.entity';
import { CreateTrainingDto } from './dto/create-training.dto';
import { Gymnast } from '../gymnasts/gymnast.entity';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(Training)
    private trainingRepository: Repository<Training>,
    @InjectRepository(Gymnast)
    private gymnastRepository: Repository<Gymnast>,
  ) {}

  async create(createTrainingDto: CreateTrainingDto): Promise<Training> {
    const training = new Training();
    training.trainingId = uuid();
    training.userId = createTrainingDto.userId;
    training.coachId = createTrainingDto.coachId;
    training.date = createTrainingDto.date;
    training.location = createTrainingDto.location;

    // Convert string exercises to Exercise objects with completion status
    training.exercises = createTrainingDto.exercises.map((name) => ({
      name,
      completed: false,
    }));

    training.status = TrainingStatus.SCHEDULED;

    return this.trainingRepository.save(training);
  }

  async findOne(trainingId: string, currentUserId: string): Promise<Training> {
    const training = await this.trainingRepository.findOne({
      where: { trainingId },
    });

    if (!training) {
      throw new NotFoundException(`Training not found`);
    }

    // Check access permission
    await this.checkAccessPermission(training, currentUserId);

    return training;
  }

  async update(
    trainingId: string,
    updateData: Partial<Training>,
    currentUserId: string,
  ): Promise<Training> {
    const training = await this.findOne(trainingId, currentUserId);

    // Update training fields
    Object.assign(training, updateData);

    return this.trainingRepository.save(training);
  }

  async updateExerciseStatus(
    trainingId: string,
    exerciseUpdates: { name: string; completed: boolean }[],
    currentUserId: string,
  ): Promise<Training> {
    const training = await this.findOne(trainingId, currentUserId);

    // Update exercise completion status
    for (const update of exerciseUpdates) {
      const exercise = training.exercises.find((e) => e.name === update.name);
      if (exercise) {
        exercise.completed = update.completed;
      }
    }

    return this.trainingRepository.save(training);
  }

  async addExercises(
    trainingId: string,
    newExercises: string[],
    currentUserId: string,
  ): Promise<Training> {
    const training = await this.findOne(trainingId, currentUserId);

    const exercisesToAdd = newExercises.map((name) => ({
      name,
      completed: null,
    }));

    training.exercises = [...training.exercises, ...exercisesToAdd];

    return this.trainingRepository.save(training);
  }

  async findAllByUser(
    targetUserId: string,
    currentUserId: string,
  ): Promise<Training[]> {
    // Only allow access if current user is the target user or their coach
    if (targetUserId !== currentUserId) {
      // Check if current user is a coach of the target user
      const gymnast = await this.gymnastRepository.findOne({
        where: { userId: targetUserId },
      });

      if (!gymnast?.coaches?.includes(currentUserId)) {
        throw new ForbiddenException(
          'You do not have permission to access these trainings',
        );
      }
    }

    // Find all trainings for the target user
    return this.trainingRepository.find({
      where: { userId: targetUserId },
      order: { date: 'DESC' },
    });
  }

  async updateStatus(
    trainingId: string,
    status: TrainingStatus,
    currentUserId: string,
  ): Promise<Training> {
    const training = await this.findOne(trainingId, currentUserId);
    training.status = status;
    return this.trainingRepository.save(training);
  }

  // Helper to check if user has permission to access/modify a training
  private async checkAccessPermission(
    training: Training,
    userId: string,
  ): Promise<void> {
    // Case 1: User is the gymnast
    if (training.userId === userId) {
      return;
    }

    // Case 2: User is a coach of the gymnast
    const gymnast = await this.gymnastRepository.findOne({
      where: { userId: training.userId },
    });

    if (gymnast?.coaches?.includes(userId)) {
      return;
    }

    throw new ForbiddenException(
      'You do not have permission to access this training',
    );
  }
}
