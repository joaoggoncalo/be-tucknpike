import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CoachesService } from './coaches.service';
import { Coach } from './coach.entity';
import { Gymnast } from '../gymnasts/gymnast.entity';
import { UpdateCoachDto } from './dto/update-coach.dto';

describe('CoachesService', () => {
  let coachesService: CoachesService;

  const mockCoachRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockGymnastRepository = {
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CoachesService,
        {
          provide: getRepositoryToken(Coach),
          useValue: mockCoachRepository,
        },
        {
          provide: getRepositoryToken(Gymnast),
          useValue: mockGymnastRepository,
        },
      ],
    }).compile();

    coachesService = moduleRef.get<CoachesService>(CoachesService);
  });

  describe('create', () => {
    it('should create a new coach', async () => {
      const coachDto = {
        name: 'John Doe',
        email: 'john@example.com',
        userId: 'user123',
      };
      const coach = { id: 1, ...coachDto, gymnasts: [] };

      mockCoachRepository.create.mockReturnValue(coach);
      mockCoachRepository.save.mockResolvedValue(coach);

      expect(await coachesService.create(coachDto)).toEqual(coach);
      expect(mockCoachRepository.create).toHaveBeenCalledWith(coachDto);
      expect(mockCoachRepository.save).toHaveBeenCalledWith(coach);
    });
  });

  describe('findAll', () => {
    it('should return an array of coaches', async () => {
      const coaches = [
        { id: 1, name: 'John Doe', email: 'john@example.com', gymnasts: [] },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', gymnasts: [] },
      ];
      mockCoachRepository.find.mockResolvedValue(coaches);

      expect(await coachesService.findAll()).toEqual(coaches);
    });
  });

  describe('findOne', () => {
    it('should return a coach by id', async () => {
      const coach = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        gymnasts: [],
      };
      mockCoachRepository.findOneBy.mockResolvedValue(coach);

      expect(await coachesService.findOne('1')).toEqual(coach);
      expect(mockCoachRepository.findOneBy).toHaveBeenCalledWith({
        userId: '1',
      });
    });
  });

  describe('update', () => {
    it('should update a coach', async () => {
      const updateDto: UpdateCoachDto = {
        gymnasts: ['gymnast1', 'gymnast2'],
      };

      const coach = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        gymnasts: ['gymnast1', 'gymnast2'],
      };

      mockCoachRepository.update.mockResolvedValue({ affected: 1 });
      mockCoachRepository.findOneBy.mockResolvedValue(coach);

      const result = await coachesService.update('1', updateDto);

      expect(mockCoachRepository.update).toHaveBeenCalledWith(
        { userId: '1' },
        updateDto,
      );
      expect(result).toEqual(coach);
    });
  });

  describe('remove', () => {
    it('should remove a coach', async () => {
      mockCoachRepository.delete.mockResolvedValue({ affected: 1 });

      await coachesService.remove('1');
      expect(mockCoachRepository.delete).toHaveBeenCalledWith({ userId: '1' });
    });
  });
});
