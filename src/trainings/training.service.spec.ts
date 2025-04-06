import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TrainingService } from './training.service';
import { Training, TrainingStatus } from './training.entity';
import { Gymnast } from '../gymnasts/gymnast.entity';

const mockTrainingRepository = {
  save: jest.fn(),
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockGymnastRepository = {
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
};

describe('TrainingService', () => {
  let trainingService: TrainingService;
  let trainingRepository: typeof mockTrainingRepository;
  let gymnastRepository: typeof mockGymnastRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrainingService,
        {
          provide: getRepositoryToken(Training),
          useValue: mockTrainingRepository,
        },
        {
          provide: getRepositoryToken(Gymnast),
          useValue: mockGymnastRepository,
        },
      ],
    }).compile();

    trainingService = module.get<TrainingService>(TrainingService);
    trainingRepository = module.get(getRepositoryToken(Training));
    gymnastRepository = module.get(getRepositoryToken(Gymnast));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and save a new training', async () => {
      const createTrainingDto = {
        userId: 'user1',
        coachId: 'coach1',
        date: new Date(),
        location: { latitude: 0, longitude: 0 },
        exercises: ['push-up', 'pull-up'],
      };

      const savedTraining = {
        trainingId: 'uuid-123',
        userId: createTrainingDto.userId,
        coachId: createTrainingDto.coachId,
        date: createTrainingDto.date,
        location: createTrainingDto.location,
        exercises: createTrainingDto.exercises.map((name) => ({
          name,
          completed: false,
        })),
        status: TrainingStatus.SCHEDULED,
      };

      trainingRepository.save.mockResolvedValue(savedTraining);

      const result = await trainingService.create(createTrainingDto);
      expect(result).toEqual(savedTraining);
      expect(trainingRepository.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a training when found and access is allowed', async () => {
      const training = {
        trainingId: 'train1',
        userId: 'user1',
        coachId: 'coach1',
        date: new Date(),
        location: {},
        exercises: [],
        status: TrainingStatus.SCHEDULED,
      };

      trainingRepository.findOne.mockResolvedValue(training);
      gymnastRepository.findOne.mockResolvedValue({
        userId: 'user1',
        coaches: ['coach1'],
      });

      const result = await trainingService.findOne('train1', 'user1');
      expect(result).toEqual(training);
    });

    it('should throw NotFoundException when training is not found', async () => {
      trainingRepository.findOne.mockResolvedValue(null);
      await expect(
        trainingService.findOne('nonexistent', 'user1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when access is not allowed', async () => {
      const training = {
        trainingId: 'train1',
        userId: 'user1',
        coachId: 'coach1',
        date: new Date(),
        location: {},
        exercises: [],
        status: TrainingStatus.SCHEDULED,
      };

      trainingRepository.findOne.mockResolvedValue(training);
      gymnastRepository.findOne.mockResolvedValue({
        userId: 'user1',
        coaches: ['coachX'],
      });

      await expect(trainingService.findOne('train1', 'coachY')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('should update a training successfully', async () => {
      const training = {
        trainingId: 'train1',
        userId: 'user1',
        coachId: 'coach1',
        date: new Date(),
        location: { latitude: 0, longitude: 0 },
        exercises: [],
        status: TrainingStatus.SCHEDULED,
      };
      const updateData = { location: { latitude: 10, longitude: 20 } };

      trainingRepository.findOne.mockResolvedValue(training);
      trainingRepository.save.mockResolvedValue({ ...training, ...updateData });
      gymnastRepository.findOne.mockResolvedValue({
        userId: 'user1',
        coaches: ['coach1'],
      });

      const result = await trainingService.update(
        'train1',
        updateData,
        'user1',
      );
      expect(result).toEqual({ ...training, ...updateData });
      expect(trainingRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateExerciseStatus', () => {
    it('should update exercise status correctly', async () => {
      const training = {
        trainingId: 'train1',
        userId: 'user1',
        coachId: 'coach1',
        date: new Date(),
        location: {},
        exercises: [{ name: 'push-up', completed: false }],
        status: TrainingStatus.SCHEDULED,
      };
      const exerciseUpdates = [{ name: 'push-up', completed: true }];

      trainingRepository.findOne.mockResolvedValue(training);
      const updatedTraining = {
        ...training,
        exercises: [{ name: 'push-up', completed: true }],
      };
      trainingRepository.save.mockResolvedValue(updatedTraining);
      gymnastRepository.findOne.mockResolvedValue({
        userId: 'user1',
        coaches: ['coach1'],
      });

      const result = await trainingService.updateExerciseStatus(
        'train1',
        exerciseUpdates,
        'user1',
      );
      expect(result.exercises[0].completed).toBe(true);
    });
  });

  describe('addExercises', () => {
    it('should add new exercises successfully', async () => {
      const training = {
        trainingId: 'train1',
        userId: 'user1',
        coachId: 'coach1',
        date: new Date(),
        location: {},
        exercises: [{ name: 'push-up', completed: false }],
        status: TrainingStatus.SCHEDULED,
      };
      const newExercises = ['sit-up'];

      trainingRepository.findOne.mockResolvedValue(training);
      const updatedExercises = [
        ...training.exercises,
        { name: 'sit-up', completed: null },
      ];
      const updatedTraining = { ...training, exercises: updatedExercises };
      trainingRepository.save.mockResolvedValue(updatedTraining);
      gymnastRepository.findOne.mockResolvedValue({
        userId: 'user1',
        coaches: ['coach1'],
      });

      const result = await trainingService.addExercises(
        'train1',
        newExercises,
        'user1',
      );
      expect(result.exercises).toHaveLength(2);
      expect(result.exercises[1]).toEqual({ name: 'sit-up', completed: null });
    });
  });

  describe('findAllByUser', () => {
    it('should return trainings for the target user when current user is the same', async () => {
      const trainings = [
        { trainingId: 'train1', userId: 'user1', date: new Date() },
        { trainingId: 'train2', userId: 'user1', date: new Date() },
      ];
      trainingRepository.find.mockResolvedValue(trainings);

      const result = await trainingService.findAllByUser('user1', 'user1');
      expect(result).toEqual(trainings);
    });

    it('should throw ForbiddenException if user is not allowed access', async () => {
      gymnastRepository.findOne.mockResolvedValue({
        userId: 'user1',
        coaches: ['coachX'],
      });
      await expect(
        trainingService.findAllByUser('user1', 'coachY'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllForCoachAthletes', () => {
    it('should return trainings with gymnast usernames', async () => {
      const gymnasts = [
        { userId: 'user1', username: 'Alice' },
        { userId: 'user2', username: 'Bob' },
      ];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(gymnasts),
      };

      gymnastRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const trainings = [
        { trainingId: 'train1', userId: 'user1', date: new Date() },
        { trainingId: 'train2', userId: 'user2', date: new Date() },
      ];
      trainingRepository.find.mockResolvedValue(trainings);

      const result = await trainingService.findAllForCoachAthletes('coach1');
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('gymnastUsername', 'Alice');
      expect(result[1]).toHaveProperty('gymnastUsername', 'Bob');
    });
  });

  describe('updateStatus', () => {
    it('should update training status successfully', async () => {
      const training = {
        trainingId: 'train1',
        userId: 'user1',
        coachId: 'coach1',
        date: new Date(),
        location: {},
        exercises: [],
        status: TrainingStatus.SCHEDULED,
      };

      trainingRepository.findOne.mockResolvedValue(training);
      const updatedTraining = { ...training, status: TrainingStatus.COMPLETED };
      trainingRepository.save.mockResolvedValue(updatedTraining);
      gymnastRepository.findOne.mockResolvedValue({
        userId: 'user1',
        coaches: ['coach1'],
      });

      const result = await trainingService.updateStatus(
        'train1',
        TrainingStatus.COMPLETED,
        'user1',
      );
      expect(result.status).toBe(TrainingStatus.COMPLETED);
    });
  });

  describe('updateLocation', () => {
    it('should update training location successfully', async () => {
      const training = {
        trainingId: 'train1',
        userId: 'user1',
        coachId: 'coach1',
        date: new Date(),
        location: { latitude: 0, longitude: 0 },
        exercises: [],
        status: TrainingStatus.SCHEDULED,
      };
      const newLocation = {
        latitude: 50,
        longitude: 50,
        address: 'New Address',
      };

      trainingRepository.findOne.mockResolvedValue(training);
      const updatedTraining = { ...training, location: newLocation };
      trainingRepository.save.mockResolvedValue(updatedTraining);
      gymnastRepository.findOne.mockResolvedValue({
        userId: 'user1',
        coaches: ['coach1'],
      });

      const result = await trainingService.updateLocation(
        'train1',
        newLocation,
        'user1',
      );
      expect(result.location).toEqual(newLocation);
    });
  });
});
