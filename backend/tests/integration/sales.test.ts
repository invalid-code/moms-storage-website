import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import { ObjectId } from 'mongodb';

const { branchCollection, medicineCollection, saleCollection } = vi.hoisted(() => ({
  branchCollection: {
    find: vi.fn(),
    aggregate: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
  },
  medicineCollection: {
    find: vi.fn(),
    aggregate: vi.fn(),
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    insertOne: vi.fn(),
    updateOne: vi.fn(),
  },
  saleCollection: {
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
  medicineCollection,
  saleCollection,
  client: {},
  connectDB: vi.fn(),
}));

import app from '../../src/app.js';

const branchId = new ObjectId();
const stockId = new ObjectId();

const salePayload = {
  branchId: branchId.toString(),
  items: [{ stockId: stockId.toString(), quantity: 2 }],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/sale', () => {
  it('returns 400 for an invalid branch id', async () => {
    const res = await request(app).post('/api/sale').send({ ...salePayload, branchId: 'nope' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false });
    expect(saleCollection.insertOne).not.toHaveBeenCalled();
  });

  it('returns 400 when items are missing or empty', async () => {
    const res = await request(app).post('/api/sale').send({ branchId: branchId.toString(), items: [] });

    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid stock id or non-positive quantity', async () => {
    const badId = await request(app)
      .post('/api/sale')
      .send({ branchId: branchId.toString(), items: [{ stockId: 'nope', quantity: 1 }] });
    expect(badId.status).toBe(400);

    const badQty = await request(app)
      .post('/api/sale')
      .send({ branchId: branchId.toString(), items: [{ stockId: stockId.toString(), quantity: 0 }] });
    expect(badQty.status).toBe(400);
  });

  it('creates the sale with a server-computed total and returns 201', async () => {
    branchCollection.findOne.mockResolvedValue({
      _id: branchId,
      name: 'Main',
      stocks: [{ stock_id: stockId, stock_onhold_amount: 10 }],
    });
    medicineCollection.find.mockReturnValue({
      toArray: () => Promise.resolve([{ _id: stockId, name: 'Paracetamol', count: 100, price: 25 }]),
    });
    const insertedId = new ObjectId();
    saleCollection.insertOne.mockResolvedValue({ acknowledged: true, insertedId });
    branchCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
    medicineCollection.updateOne.mockResolvedValue({ matchedCount: 1 });

    const res = await request(app).post('/api/sale').send(salePayload);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      data: {
        _id: insertedId.toString(),
        branch: branchId.toString(),
        items: [{ stock_id: stockId.toString(), quantity: 2, unitPrice: 25 }],
        total: 50,
        dateSold: expect.any(String),
        voided: false,
      },
    });
  });

  it('returns 404 when the branch does not exist', async () => {
    branchCollection.findOne.mockResolvedValue(null);

    const res = await request(app).post('/api/sale').send(salePayload);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, message: 'Branch not found' });
  });

  it('returns 409 when stock is insufficient', async () => {
    branchCollection.findOne.mockResolvedValue({
      _id: branchId,
      name: 'Main',
      stocks: [{ stock_id: stockId, stock_onhold_amount: 1 }],
    });
    medicineCollection.find.mockReturnValue({
      toArray: () => Promise.resolve([{ _id: stockId, name: 'Paracetamol', count: 100, price: 25 }]),
    });

    const res = await request(app).post('/api/sale').send(salePayload);

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/Insufficient stock/);
  });
});

describe('GET /api/sale', () => {
  it('returns sales with computed pagination', async () => {
    const rows = [
      {
        _id: new ObjectId(),
        branch: branchId,
        items: [],
        total: 0,
        dateSold: new Date('2026-02-01T00:00:00.000Z'),
        voided: false,
      },
    ];
    saleCollection.aggregate.mockReturnValue({
      toArray: () => Promise.resolve([{ data: rows, metadata: [{ totalItems: 11 }] }]),
    });

    const res = await request(app).get('/api/sale?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toMatchObject({ totalItems: 11, totalPages: 2, currentPage: 1 });
  });
});

describe('GET /api/sale/:id', () => {
  it('returns 400 for an invalid id', async () => {
    const res = await request(app).get('/api/sale/nope');

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ success: false, message: 'Invalid ID format' });
  });

  it('returns the sale when found', async () => {
    const saleId = new ObjectId();
    saleCollection.aggregate.mockReturnValue({
      toArray: () =>
        Promise.resolve([
          {
            _id: saleId,
            branch: branchId,
            branchDetails: { _id: branchId, name: 'Main', stocks: [] },
            items: [{ stock_id: stockId, quantity: 1, unitPrice: 25 }],
            medicineDetails: [{ _id: stockId, name: 'Paracetamol' }],
            total: 25,
            dateSold: new Date('2026-02-01T00:00:00.000Z'),
            voided: false,
          },
        ]),
    });

    const res = await request(app).get(`/api/sale/${saleId.toString()}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      _id: saleId.toString(),
      total: 25,
      items: [{ stock_id: stockId.toString(), quantity: 1, unitPrice: 25, stock_name: 'Paracetamol' }],
    });
  });
});

describe('PATCH /api/sale/:id/void', () => {
  const saleId = new ObjectId();
  const sale = {
    _id: saleId,
    branch: branchId,
    items: [{ stock_id: stockId, quantity: 2, unitPrice: 25 }],
    total: 50,
    dateSold: new Date('2026-02-01T00:00:00.000Z'),
    voided: false,
  };

  it('returns 400 for an invalid id', async () => {
    const res = await request(app).patch('/api/sale/nope/void');

    expect(res.status).toBe(400);
  });

  it('voids the sale and returns the updated DTO', async () => {
    saleCollection.findOne.mockResolvedValue(sale);
    saleCollection.findOneAndUpdate.mockResolvedValue({ ...sale, voided: true, dateVoided: new Date() });
    branchCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
    medicineCollection.updateOne.mockResolvedValue({ matchedCount: 1 });

    const res = await request(app).patch(`/api/sale/${saleId.toString()}/void`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({ _id: saleId.toString(), voided: true });
    // stock restored (positive increment)
    expect(branchCollection.updateOne).toHaveBeenCalledWith(
      { _id: branchId, 'stocks.stock_id': stockId },
      { $inc: { 'stocks.$.stock_onhold_amount': 2 } },
    );
  });

  it('returns 404 when the sale does not exist', async () => {
    saleCollection.findOne.mockResolvedValue(null);

    const res = await request(app).patch(`/api/sale/${saleId.toString()}/void`);

    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({ success: false, message: 'Sale not found' });
  });

  it('returns 409 when the sale is already voided', async () => {
    saleCollection.findOne.mockResolvedValue({ ...sale, voided: true });

    const res = await request(app).patch(`/api/sale/${saleId.toString()}/void`);

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({ success: false, message: 'Sale already voided' });
  });
});
