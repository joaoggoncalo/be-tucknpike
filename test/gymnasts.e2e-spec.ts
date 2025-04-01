import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { UserRole } from '../src/auth/user.entity';

interface TokenResponse {
  token: string;
}

interface UserResponse {
  id: string;
  username: string;
}

interface GymnastResponse {
  userId: string;
  trainingIds: string[];
  coaches: string[];
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

describe('GymnastsController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const user = {
      username: `admin_${Date.now()}`,
      email: `admin_${Date.now()}@example.com`,
      password: 'Password123!',
      role: UserRole.GYMNAST,
      name: 'Admin User',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send(user);

    const userResponse = registerResponse.body as UserResponse;
    userId = userResponse.id;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        usernameOrEmail: user.username,
        password: user.password,
      });

    const tokenResponse = loginResponse.body as TokenResponse;
    authToken = tokenResponse.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/gymnasts (POST) - should create a gymnast', () => {
    const gymnast = {
      userId: userId,
      trainingIds: [],
      coaches: [],
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/gymnasts')
      .set('Authorization', `Bearer ${authToken}`)
      .send(gymnast)
      .expect(201)
      .expect((res) => {
        const body = res.body as GymnastResponse;
        expect(body).toHaveProperty('userId');
        expect(body.coaches).toEqual(gymnast.coaches);
        expect(body.trainingIds).toEqual(gymnast.trainingIds);
        expect(body.userId).toEqual(gymnast.userId);
      });
  });

  it('/gymnasts (GET) - should return all gymnasts', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get('/gymnasts')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBeTruthy();
      });
  });

  it('/gymnasts/:userId (GET) - should return a gymnast by userId', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .get(`/gymnasts/${userId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200)
      .expect((res) => {
        const body = res.body as GymnastResponse;
        expect(body.userId).toEqual(userId);
      });
  });
});
