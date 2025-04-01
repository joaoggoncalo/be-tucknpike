import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/auth/user.entity';

interface UserResponse {
  id: number | string;
  username: string;
  email: string;
  role: string;
}

interface TokenResponse {
  token: string;
}

let app: INestApplication;

beforeAll(async () => {
  try {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  } catch (error) {
    console.error('Error initializing app:', error);
  }
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
});

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) - should register a new user', () => {
    const user = {
      username: `testuser_${Date.now()}`,
      name: 'joaoc',
      email: `test_${Date.now()}@example.com`,
      password: 'Password123!',
      role: UserRole.GYMNAST,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/auth/register')
      .send(user)
      .expect(201)
      .expect((res) => {
        const body = res.body as UserResponse;
        expect(body).toHaveProperty('id');
        expect(body.username).toEqual(user.username);
      });
  });

  it('/auth/login (POST) - should login and return token', async () => {
    const user = {
      username: `loginuser_${Date.now()}`,
      name: 'joao',
      email: `login_${Date.now()}@example.com`,
      password: 'Password123!',
      role: UserRole.GYMNAST,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await request(app.getHttpServer()).post('/auth/register').send(user);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        usernameOrEmail: user.username,
        password: user.password,
      })
      .expect(201)
      .expect((res) => {
        const body = res.body as TokenResponse;
        expect(body).toHaveProperty('token');
        expect(typeof body.token).toBe('string');
      });
  });
});
