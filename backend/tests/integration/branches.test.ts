import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { ObjectId } from 'mongodb';

const { branchCollection } = vi.hoisted(() => ({
  branchCollection: {
    find: vi.fn(),
    aggregate: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock('../../src/config/db.js', () => ({
  branchCollection,
  deliveryCollection: {},
  medicineCollection: {},
  client: {},
  connectDB: vi.fn(),
}));

import app from '../../src/app.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/branch', () => {
  it('returns branches with string ids', async () => {
    const branchId = new ObjectId();
    const stockId = new ObjectId();
    branchCollection.find.mockReturnValue({
      toArray: () =>
        Promise.resolve([
          { _id: branchId, name: 'Main', stocks: [{ stock_id: stockId, stock_onhold_amount: 5 }] },
        ]),
    });

    const res = await request(app).get('/api/branch');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: [
        {
          _id: branchId.toString(),
          name: 'Main',
          stocks: [{ stock_id: stockId.toString(), stock_onhold_amount: 5 }],
        },
      ],
    });
  });
});

describe('GET /api/branch/lowest-stock', () => {
  it('returns the lowest-stock list', async () => {
    const rows = [{ 'stock-name': 'Aspirin', branch: 'Main', 'stock-percentage': '10%' }];
    branchCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve(rows) });

    const res = await request(app).get('/api/branch/lowest-stock');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: rows });
  });
});

describe('GET /api/branch/:id', () => {
  it('returns 400 for an invalid id', async () => {
    const res = await request(app).get('/api/branch/nope');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Invalid ID format' });
  });

  it('returns paginated stocks with computed pagination', async () => {
    const rows = [{ 'stock-id': new ObjectId().toString(), 'stock-name': 'Para', stock_onhold_amount: 2, percentage: 20 }];
    branchCollection.aggregate.mockReturnValue({
      toArray: () => Promise.resolve([{ data: rows, metadata: [{ total: 12 }] }]),
    });

    const res = await request(app).get(`/api/branch/${new ObjectId().toString()}?page=1&limit=10`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(rows);
    expect(res.body.pagination).toMatchObject({ totalItems: 12, totalPages: 2, currentPage: 1 });
  });
});

describe('GET /api/branch/:id/lowest-stock', () => {
  it('returns 400 for an invalid id', async () => {
    const res = await request(app).get('/api/branch/nope/lowest-stock');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Invalid ID format' });
  });

  it('returns paginated lowest stocks', async () => {
    const rows = [{ 'stock-name': 'Aspirin', stock_onhold_amount: 1 }];
    branchCollection.aggregate.mockReturnValue({
      toArray: () => Promise.resolve([{ data: rows, metadata: [{ total: 1 }] }]),
    });

    const res = await request(app).get(`/api/branch/${new ObjectId().toString()}/lowest-stock?page=1&limit=10`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(rows);
  });
});

describe('GET /api/branch/:branchId/stock/:stockId', () => {
  it('returns 400 when either id is invalid', async () => {
    const res = await request(app).get(`/api/branch/${new ObjectId().toString()}/stock/nope`);

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Invalid ID format' });
  });

  it('returns 404 when the stock is not found', async () => {
    branchCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([]) });

    const res = await request(app).get(`/api/branch/${new ObjectId().toString()}/stock/${new ObjectId().toString()}`);

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('returns the stock when found', async () => {
    const row = { stock_name: 'Para', stock_id: new ObjectId().toString(), stock_onhold_amount: 2 };
    branchCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([row]) });

    const res = await request(app).get(`/api/branch/${new ObjectId().toString()}/stock/${new ObjectId().toString()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: row });
  });
});
