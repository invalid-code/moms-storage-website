import { beforeEach, describe, expect, it, vi } from 'vitest';
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

import {
  createDeliveryService,
  getDeliveriesService,
  getDeliveryService,
  updateDeliveryService,
} from '../../src/services/deliveryService.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getDeliveriesService', () => {
  it('returns data and totalItems', async () => {
    const rows = [{ _id: new ObjectId(), delivered: false }];
    deliveryCollection.aggregate.mockReturnValue({
      toArray: () => Promise.resolve([{ data: rows, metadata: [{ totalItems: 1 }] }]),
    });

    const result = await getDeliveriesService(1, 10);

    expect(result).toEqual({ data: rows, totalItems: 1 });
  });

  it('returns empty data when the aggregation has no facet result', async () => {
    deliveryCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([]) });

    await expect(getDeliveriesService(1, 10)).resolves.toEqual({ data: [], totalItems: 0 });
  });
});

describe('getDeliveryService', () => {
  it('returns the first aggregation row', async () => {
    const row = { _id: new ObjectId(), delivered: false };
    deliveryCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([row]) });

    await expect(getDeliveryService(new ObjectId())).resolves.toEqual(row);
  });

  it('returns null when nothing matches', async () => {
    deliveryCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([]) });

    await expect(getDeliveryService(new ObjectId())).resolves.toBeNull();
  });
});

describe('createDeliveryService', () => {
  it('inserts an undelivered delivery with the given branch and stocks', async () => {
    const branchId = new ObjectId();
    const stocks = [new ObjectId(), new ObjectId()];
    deliveryCollection.insertOne.mockResolvedValue({ acknowledged: true });

    await createDeliveryService(branchId, stocks);

    expect(deliveryCollection.insertOne).toHaveBeenCalledOnce();
    const doc = deliveryCollection.insertOne.mock.calls[0]?.[0] as {
      delivered: boolean;
      branch: ObjectId;
      stocksRequested: ObjectId[];
      dateRequested: Date;
    };
    expect(doc.delivered).toBe(false);
    expect(doc.branch).toEqual(branchId);
    expect(doc.stocksRequested).toEqual(stocks);
    expect(doc.dateRequested).toBeInstanceOf(Date);
  });

  it('throws when the insert is not acknowledged', async () => {
    deliveryCollection.insertOne.mockResolvedValue({ acknowledged: false });

    await expect(createDeliveryService(new ObjectId(), [])).rejects.toThrow("Delivery couldn't be ordered");
  });
});

describe('updateDeliveryService', () => {
  const deliveryId = new ObjectId();
  const branchId = new ObjectId();
  const stockId = new ObjectId();

  const body = {
    delivered: true,
    dateDelivered: new Date('2026-01-15T00:00:00.000Z').toISOString(),
    stocksReceived: [{ stockId: stockId.toString(), amount: 7 }],
  };

  beforeEach(() => {
    deliveryCollection.findOne.mockResolvedValue({
      _id: deliveryId,
      branch: branchId,
      delivered: false,
    });
    branchCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
  });

  it('throws when the delivery does not exist', async () => {
    deliveryCollection.findOne.mockResolvedValue(null);

    await expect(updateDeliveryService(deliveryId, body)).rejects.toThrow('Delivery not found');
  });

  it('sets delivered + dateDelivered as a Date and never persists stocksReceived', async () => {
    const updated = {
      _id: deliveryId,
      dateRequested: new Date('2026-01-01T00:00:00.000Z'),
      dateDelivered: new Date(body.dateDelivered),
      delivered: true,
      branch: branchId,
      stocksRequested: [stockId],
    };
    deliveryCollection.findOneAndUpdate.mockResolvedValue(updated);

    await updateDeliveryService(deliveryId, body);

    expect(deliveryCollection.findOneAndUpdate).toHaveBeenCalledOnce();
    const [, update] = deliveryCollection.findOneAndUpdate.mock.calls[0] ?? [];
    const set = (update as { $set: Record<string, unknown> }).$set;
    expect(set.delivered).toBe(true);
    expect(set.dateDelivered).toBeInstanceOf(Date);
    expect(set).not.toHaveProperty('stocksReceived');
  });

  it('increments the branch stock when the stock already exists', async () => {
    deliveryCollection.findOneAndUpdate.mockResolvedValue({
      _id: deliveryId,
      dateRequested: new Date(),
      delivered: true,
      branch: branchId,
      stocksRequested: [],
    });
    branchCollection.updateOne.mockResolvedValue({ matchedCount: 1 });

    await updateDeliveryService(deliveryId, body);

    expect(branchCollection.updateOne).toHaveBeenCalledOnce();
    expect(branchCollection.updateOne).toHaveBeenCalledWith(
      { _id: branchId, 'stocks.stock_id': stockId },
      { $inc: { 'stocks.$.stock_onhold_amount': 7 } },
    );
  });

  it('pushes a new branch stock entry when nothing matched', async () => {
    deliveryCollection.findOneAndUpdate.mockResolvedValue({
      _id: deliveryId,
      dateRequested: new Date(),
      delivered: true,
      branch: branchId,
      stocksRequested: [],
    });
    branchCollection.updateOne
      .mockResolvedValueOnce({ matchedCount: 0 })
      .mockResolvedValueOnce({ matchedCount: 1 });

    await updateDeliveryService(deliveryId, body);

    expect(branchCollection.updateOne).toHaveBeenCalledTimes(2);
    expect(branchCollection.updateOne).toHaveBeenLastCalledWith(
      { _id: branchId },
      { $push: { stocks: { stock_id: stockId, stock_onhold_amount: 7 } } },
    );
  });

  it('returns the updated delivery mapped to string-id/ISO-date DTO', async () => {
    deliveryCollection.findOneAndUpdate.mockResolvedValue({
      _id: deliveryId,
      dateRequested: new Date('2026-01-01T00:00:00.000Z'),
      dateDelivered: new Date('2026-01-15T00:00:00.000Z'),
      delivered: true,
      branch: branchId,
      stocksRequested: [stockId],
    });

    const result = await updateDeliveryService(deliveryId, body);

    expect(result).toEqual({
      _id: deliveryId.toString(),
      dateRequested: '2026-01-01T00:00:00.000Z',
      dateDelivered: '2026-01-15T00:00:00.000Z',
      delivered: true,
      branch: branchId.toString(),
      stocksRequested: [stockId.toString()],
    });
  });

  it('omits dateDelivered when the stored delivery has none', async () => {
    deliveryCollection.findOneAndUpdate.mockResolvedValue({
      _id: deliveryId,
      dateRequested: new Date('2026-01-01T00:00:00.000Z'),
      delivered: false,
      branch: branchId,
      stocksRequested: [],
    });

    const result = await updateDeliveryService(deliveryId, {
      delivered: false,
      dateDelivered: new Date('2026-01-15T00:00:00.000Z').toISOString(),
      stocksReceived: [],
    });

    expect(result).not.toHaveProperty('dateDelivered');
  });

  it('returns null when the update finds nothing', async () => {
    deliveryCollection.findOneAndUpdate.mockResolvedValue(null);

    await expect(updateDeliveryService(deliveryId, body)).resolves.toBeNull();
  });
});
