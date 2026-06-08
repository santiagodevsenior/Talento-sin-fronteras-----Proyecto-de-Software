const request = require('supertest');

// Mock nodemailer para evitar envío de correos en pruebas
jest.mock('../config/mailer', () => ({
  sendMail: jest.fn().mockResolvedValue(true),
}));

const { app, server } = require('../index');
const { sequelize } = require('../models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
  server.close();
});

describe('Auth Controller', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@tsf.com',
    password: 'Password1',
    role: 'student',
  };
  let authToken;

  describe('POST /api/auth/register', () => {
    it('debe registrar un usuario nuevo y retornar token', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('debe rechazar email duplicado', async () => {
      const res = await request(app).post('/api/auth/register').send(testUser);
      expect(res.status).toBe(409);
    });

    it('debe rechazar contraseña débil', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'new@tsf.com', password: 'weak' });
      expect(res.status).toBe(400);
    });

    it('debe rechazar email inválido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'no-es-email' });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('debe iniciar sesión con credenciales válidas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      authToken = res.body.token;
    });

    it('debe rechazar contraseña incorrecta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'WrongPass1' });
      expect(res.status).toBe(401);
    });

    it('debe rechazar email inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@tsf.com', password: 'Password1' });
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('debe retornar el usuario actual con token válido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('debe rechazar petición sin token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('debe rechazar token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer tokeninvalido123');
      expect(res.status).toBe(401);
    });
  });
});
