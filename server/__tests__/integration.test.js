jest.mock('../config/mailer', () => ({
  sendMail: jest.fn().mockResolvedValue(true),
}));

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { sequelize } = require('../models');
const authRoutes = require('../routes/auth');
const projectRoutes = require('../routes/projects');
const apiRoutes = require('../routes/index');
const { errorHandler, notFound } = require('../middleware/errorHandler');

const testApp = express();
testApp.use(cors());
testApp.use(express.json());
testApp.use('/api/auth', authRoutes);
testApp.use('/api/projects', projectRoutes);
testApp.use('/api', apiRoutes);
testApp.use(notFound);
testApp.use(errorHandler);

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

let token;
let projectId;

describe('Integración: Proyecto + Comentario', () => {
  it('IT-01: usuario autenticado puede crear un proyecto', async () => {
    const reg = await request(testApp)
      .post('/api/auth/register')
      .send({ name: 'Artista', email: 'artista@tsf.com', password: 'Password1', role: 'creator' });
    token = reg.body.token;

    const res = await request(testApp)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Mi Primera Obra')
      .field('description', 'Una descripción larga de mi obra de arte abstracto.')
      .field('category', 'visual_arts');

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Mi Primera Obra');
    projectId = res.body.data.id;
  });

  it('IT-02: el proyecto aparece en el feed público', async () => {
    const res = await request(testApp).get('/api/projects');
    expect(res.status).toBe(200);
    const ids = res.body.data.map((p) => p.id);
    expect(ids).toContain(projectId);
  });

  it('IT-03: otro usuario puede comentar y avgRating se actualiza', async () => {
    const reg2 = await request(testApp)
      .post('/api/auth/register')
      .send({ name: 'Crítico', email: 'critico@tsf.com', password: 'Password1', role: 'professional' });
    const token2 = reg2.body.token;

    const res = await request(testApp)
      .post(`/api/projects/${projectId}/comments`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: '¡Excelente composición y uso del color!', rating: 5 });

    expect(res.status).toBe(201);
    expect(res.body.data.rating).toBe(5);
  });
});