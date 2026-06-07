const request = require('supertest');
const { app } = require('../index');
const { sequelize } = require('../models');

let token, projectId;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  const reg = await request(app).post('/api/auth/register').send({
    name: 'Artist', email: 'artist@tsf.com', password: 'Password1', role: 'creator'
  });
  token = reg.body.token;
});

afterAll(async () => { await sequelize.close(); });

describe('Integration: Project + Comment flow', () => {
  it('IT-01: authenticated user can create a project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'My First Painting')
      .field('description', 'A beautiful abstract painting using oil on canvas.')
      .field('category', 'visual_arts');
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('My First Painting');
    projectId = res.body.data.id;
  });

  it('IT-02: project appears in public feed', async () => {
    const res = await request(app).get('/api/projects');
    expect(res.status).toBe(200);
    const ids = res.body.data.map((p) => p.id);
    expect(ids).toContain(projectId);
  });

  it('IT-03: user can comment + rating updates avgRating', async () => {
    // Register second user
    const reg2 = await request(app).post('/api/auth/register').send({
      name: 'Reviewer', email: 'reviewer@tsf.com', password: 'Password1', role: 'professional'
    });
    const token2 = reg2.body.token;

    const res = await request(app)
      .post(`/api/projects/${projectId}/comments`)
      .set('Authorization', `Bearer ${token2}`)
      .send({ content: 'Great composition and use of color!', rating: 5 });
    expect(res.status).toBe(201);
    expect(res.body.data.rating).toBe(5);

    const proj = await request(app).get(`/api/projects/${projectId}`);
    expect(parseFloat(proj.body.data.avgRating)).toBe(5);
    expect(proj.body.data.ratingCount).toBe(1);
  });
});
