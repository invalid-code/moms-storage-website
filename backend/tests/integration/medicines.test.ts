import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { ObjectId } from 'mongodb';

const { medicineCollection } = vi.hoisted(() => ({
  medicineCollection: {
    find: vi.fn(),
    aggregate: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock('../../src/config/db.js', () => ({
  branchCollection: {},
  deliveryCollection: {},
  medicineCollection,
  client: {},
  connectDB: vi.fn(),
}));

import app from '../../src/app.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('GET /api/item', () => {
  it('returns paginated medicines with computed pagination', async () => {
    const id = new ObjectId();
    medicineCollection.aggregate.mockReturnValue({
      toArray: () =>
        Promise.resolve([
          {
            data: [{ _id: id, name: 'Paracetamol', count: 100 }],
            metadata: [{ totalItems: 25 }],
          },
        ]),
    });

    const res = await request(app).get('/api/item?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([{ _id: id.toString(), name: 'Paracetamol', count: 100 }]);
    expect(res.body.pagination).toMatchObject({
      totalItems: 25,
      totalPages: 3,
      currentPage: 1,
      limit: 10,
      hasNextPage: true,
      hasPrevPage: false,
    });
  });

  it('returns 500 when the service throws', async () => {
    medicineCollection.aggregate.mockReturnValue({
      toArray: () => Promise.reject(new Error('db down')),
    });

    const res = await request(app).get('/api/item');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('db down');
  });
});

describe('GET /api/item/:id', () => {
  it('returns 400 for an invalid id', async () => {
    const res = await request(app).get('/api/item/not-an-id');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Invalid ID format' });
    expect(medicineCollection.findOne).not.toHaveBeenCalled();
  });

  it('returns the mapped medicine when found', async () => {
    const id = new ObjectId();
    medicineCollection.findOne.mockResolvedValue({ _id: id, name: 'Ibuprofen', count: 50 });

    const res = await request(app).get(`/api/item/${id.toString()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: { _id: id.toString(), name: 'Ibuprofen', count: 50 },
    });
  });

  it('returns success with null data when not found', async () => {
    medicineCollection.findOne.mockResolvedValue(null);

    const res = await request(app).get(`/api/item/${new ObjectId().toString()}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, data: null });
  });
});
