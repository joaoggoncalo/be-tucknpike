import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GymnastsService } from './gymnasts.service';
import { Gymnast } from './gymnast.entity';
import { BadRequestException } from '@nestjs/common';
import { UpdateGymnastDto } from './dto/update-gymnast.dto';

describe('GymnastsService', () => {
  let gymnastsService: GymnastsService;

  const mockGymnastRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GymnastsService,
        {
          provide: getRepositoryToken(Gymnast),
          useValue: mockGymnastRepository,
        },
      ],
    }).compile();

    gymnastsService = moduleRef.get<GymnastsService>(GymnastsService);
  });

  describe('create', () => {
    it('should create a new gymnast', async () => {
      const gymnastDto = {
        userId: 'user1',
        name: 'Jane Doe',
        email: 'jane@example.com',
      };
      const gymnast = { id: 1, ...gymnastDto };

      mockGymnastRepository.create.mockReturnValue(gymnast);
      mockGymnastRepository.save.mockResolvedValue(gymnast);

      expect(await gymnastsService.create(gymnastDto)).toEqual(gymnast);
      expect(mockGymnastRepository.create).toHaveBeenCalledWith(gymnastDto);
      expect(mockGymnastRepository.save).toHaveBeenCalledWith(gymnast);
    });

    it('should throw BadRequestException on duplicate userId', async () => {
      const gymnastDto = {
        userId: 'user1',
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      mockGymnastRepository.create.mockReturnValue(gymnastDto);
      mockGymnastRepository.save.mockRejectedValue({ code: '23505' });

      await expect(gymnastsService.create(gymnastDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of gymnasts', async () => {
      const gymnasts = [
        { id: 1, userId: 'user1', name: 'Jane Doe', email: 'jane@example.com' },
        {
          id: 2,
          userId: 'user2',
          name: 'John Smith',
          email: 'john@example.com',
        },
      ];
      mockGymnastRepository.find.mockResolvedValue(gymnasts);

      expect(await gymnastsService.findAll()).toEqual(gymnasts);
    });
  });

  describe('findOne', () => {
    it('should return a gymnast by userId', async () => {
      const gymnast = {
        id: 1,
        userId: 'user1',
        name: 'Jane Doe',
        email: 'jane@example.com',
        trainingIds: ['1', '2'],
      };
      mockGymnastRepository.findOneBy.mockResolvedValue(gymnast);

      expect(await gymnastsService.findOne('user1')).toEqual(gymnast);
      expect(mockGymnastRepository.findOneBy).toHaveBeenCalledWith({
        userId: 'user1',
      });
    });

    it('should throw BadRequestException if gymnast not found', async () => {
      mockGymnastRepository.findOneBy.mockResolvedValue(null);

      await expect(gymnastsService.findOne('nonexistent')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update', () => {
    it('should update a gymnast', async () => {
      const updateDto: UpdateGymnastDto = { trainingIds: ['1', '2'] };
      const gymnast = {
        id: 1,
        userId: 'user1',
        name: 'Updated Name',
        email: 'jane@example.com',
      };

      mockGymnastRepository.update.mockResolvedValue({ affected: 1 });
      mockGymnastRepository.findOneBy.mockResolvedValue(gymnast);

      expect(await gymnastsService.update('user1', updateDto)).toEqual(gymnast);
      expect(mockGymnastRepository.update).toHaveBeenCalledWith(
        { userId: 'user1' },
        updateDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a gymnast', async () => {
      mockGymnastRepository.delete.mockResolvedValue({ affected: 1 });

      await gymnastsService.remove('user1');
      expect(mockGymnastRepository.delete).toHaveBeenCalledWith({
        userId: 'user1',
      });
    });
  });
});
