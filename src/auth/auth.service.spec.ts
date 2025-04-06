import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { User, UserRole } from './user.entity';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  const mockUserRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('test-token'),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: UserRole.GYMNAST,
        name: 'Test User',
      };
      const hashedPassword = 'hashedPassword';

      mockUserRepository.findOne.mockResolvedValue(null);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation((_data, _salt, callback) => {
          if (callback) {
            callback(undefined, hashedPassword);
            return;
          }
          return hashedPassword;
        });
      mockUserRepository.create.mockReturnValue({
        ...userDto,
        password: hashedPassword,
      });
      mockUserRepository.save.mockResolvedValue({
        id: 1,
        ...userDto,
        password: hashedPassword,
      });

      const result = await authService.register(userDto);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(userDto.password, 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userDto,
        password: hashedPassword,
      });
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(result.password).toEqual(hashedPassword);
    });

    it('should throw BadRequestException if user already exists', () => {
      // Fix: Don't use async in the callback, use return instead
      const userDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password',
        role: UserRole.GYMNAST,
        name: 'Test User',
      };
      mockUserRepository.findOne.mockResolvedValue({ id: 1, ...userDto });

      return expect(authService.register(userDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should return token when credentials are valid', async () => {
      const loginDto = { usernameOrEmail: 'testuser', password: 'password' };
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.GYMNAST,
      };

      mockUserRepository.findOne.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation((_data, _hash, callback) => {
          if (callback) {
            callback(undefined, true);
            return;
          }
          return true;
        });
      // Fix: Use the mock function directly instead of spying on it
      const signSpy = jest.spyOn(jwtService, 'sign');
      signSpy.mockReturnValue('test-token');

      const result = await authService.login(loginDto);

      expect(mockUserRepository.findOne).toHaveBeenCalled();
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
      expect(signSpy).toHaveBeenCalledWith({
        sub: user.id,
        username: user.username,
        role: user.role,
      });
      expect(result).toEqual({ token: 'test-token' });
    });

    it('should throw UnauthorizedException if user not found', () => {
      // Fix: Don't use async in the callback, use return instead
      mockUserRepository.findOne.mockResolvedValue(null);

      return expect(
        authService.login({ usernameOrEmail: 'wrong', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', () => {
      // Fix: Don't use async in the callback, use return instead
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedPassword',
        role: UserRole.GYMNAST,
      };
      mockUserRepository.findOne.mockResolvedValue(user);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation((_data, _hash, callback) => {
          if (callback) {
            callback(undefined, false);
            return;
          }
          return false;
        });

      return expect(
        authService.login({ usernameOrEmail: 'testuser', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
