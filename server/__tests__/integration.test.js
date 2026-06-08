const request = require('supertest');

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

let token;
let projectId;

describe('Integración: Proyecto + Comentario', () => {
  it('IT-01: usuario autenticado puede crear un proyecto', async () => {
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Artista', email: 'artista@tsf.com', password: 'Password1', role: 'creator' });
    token = reg.body.token;

    const res = await request(app)
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
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    const ids = res.body.data.map((p) => p.id);
    expect(ids).toContain(projectId);
  });

  it('IT-03: otro usuario puede comentar y el avgRating se actualiza', async () => {
    const reg2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Crítico', email: 'critico@tsf.com', password: 'Password1', role: 'professional' });
    const token2 = reg2.body.token;

    const res = await request(app)
      .post(`/api/projects/${projectId}/comments`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: '¡Excelente composición y uso del color!', rating: 5 });

    expect(res.status).toBe(201);
    expect(res.body.data.rating).toBe(5);

    const proj = await request(app).get(`/api/projects/${projectId}`);
    expect(parseFloat(proj.body.data.avgRating)).toBe(5);
    expect(proj.body.data.ratingCount).toBe(1);
  });
});