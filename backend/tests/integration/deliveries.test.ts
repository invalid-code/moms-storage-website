import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { ObjectId } from 'mongodb';

const { branchCollection, deliveryCollection } = vi.hoisted(() => ({
  branchCollection: {
    find: vi.fn(),
    aggregate: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
  },
  deliveryCollection: {
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
  deliveryCollection,
  medicineCollection: {},
  client: {},
  connectDB: vi.fn(),
}));

import app from '../../src/app.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/delivery', () => {
  it('returns deliveries with computed pagination', async () => {
    const rows = [{ _id: new ObjectId().toString(), delivered: false }];
    deliveryCollection.aggregate.mockReturnValue({
      toArray: () => Promise.resolve([{ data: rows, metadata: [{ totalItems: 11 }] }]),
    });

    const res = await request(app).get('/api/delivery?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(rows);
    expect(res.body.pagination).toMatchObject({ totalItems: 11, totalPages: 2, currentPage: 1 });
  });
});

describe('GET /api/delivery/:id', () => {
  it('returns 400 for an invalid id', async () => {
    const res = await request(app).get('/api/delivery/nope');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Invalid ID format' });
  });

  it('returns the delivery when found', async () => {
    const row = { _id: new ObjectId().toString(), delivered: false };
    deliveryCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([row]) });

    const res = await request(app).get(`/api/delivery/${new ObjectId().toString()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: row });
  });
});

describe('POST /api/delivery', () => {
  const branchId = new ObjectId().toString();
  const stockId = new ObjectId().toString();

  it('returns 400 for an invalid branch id', async () => {
    const res = await request(app)
      .post('/api/delivery')
      .send({ branchId: 'nope', stocksRequested: [stockId] });

    expect(res.status).toBe(400);
    expect(deliveryCollection.insertOne).not.toHaveBeenCalled();
  });

  it('returns 400 when any requested stock id is invalid', async () => {
    const res = await request(app)
      .post('/api/delivery')
      .send({ branchId, stocksRequested: [stockId, 'nope'] });

    expect(res.status).toBe(400);
    expect(deliveryCollection.insertOne).not.toHaveBeenCalled();
  });

  it('creates the delivery and returns 201', async () => {
    deliveryCollection.insertOne.mockResolvedValue({ acknowledged: true });

    const res = await request(app)
      .post('/api/delivery')
      .send({ branchId, stocksRequested: [stockId] });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ success: true, message: 'New delivery was ordered' });
    expect(deliveryCollection.insertOne).toHaveBeenCalledOnce();
  });
});

describe('PATCH /api/delivery/:id', () => {
  const deliveryId = new ObjectId();
  const branchId = new ObjectId();
  const stockId = new ObjectId();

  const payload = {
    delivered: true,
    dateDelivered: new Date('2026-01-15T00:00:00.000Z').toISOString(),
    stocksReceived: [{ stockId: stockId.toString(), amount: 4 }],
  };

  it('returns 400 for an invalid id', async () => {
    const res = await request(app).patch('/api/delivery/nope').send(payload);

    expect(res.status).toBe(400);
  });

  it('returns 400 when any received stock id is invalid', async () => {
    const res = await request(app)
      .patch(`/api/delivery/${deliveryId.toString()}`)
      .send({ ...payload, stocksReceived: [{ stockId: 'nope', amount: 1 }] });

    expect(res.status).toBe(400);
  });

  it('updates the delivery, keeps DTO string ids, and updates branch stocks', async () => {
    deliveryCollection.findOne.mockResolvedValue({ _id: deliveryId, branch: branchId });
    deliveryCollection.findOneAndUpdate.mockResolvedValue({
      _id: deliveryId,
      dateRequested: new Date('2026-01-01T00:00:00.000Z'),
      dateDelivered: new Date('2026-01-15T00:00:00.000Z'),
      delivered: true,
      branch: branchId,
      stocksRequested: [stockId],
    });
    branchCollection.updateOne.mockResolvedValue({ matchedCount: 1 });

    const res = await request(app).patch(`/api/delivery/${deliveryId.toString()}`).send(payload);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: {
        _id: deliveryId.toString(),
        dateRequested: '2026-01-01T00:00:00.000Z',
        dateDelivered: '2026-01-15T00:00:00.000Z',
        delivered: true,
        branch: branchId.toString(),
        stocksRequested: [stockId.toString()],
      },
    });
    // branch stock matched as ObjectId (single conversion, done in the service)
    expect(branchCollection.updateOne).toHaveBeenCalledWith(
      { _id: branchId, 'stocks.stock_id': stockId },
      { $inc: { 'stocks.$.stock_onhold_amount': 4 } },
    );
  });

  it('returns 500 when the delivery does not exist', async () => {
    deliveryCollection.findOne.mockResolvedValue(null);

    const res = await request(app).patch(`/api/delivery/${deliveryId.toString()}`).send(payload);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ success: false, message: 'Delivery not found' });
  });
});
