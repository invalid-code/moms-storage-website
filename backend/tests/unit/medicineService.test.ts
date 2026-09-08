import { beforeEach, describe, expect, it, vi } from 'vitest';
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

import { getMedicineService, getPaginatedMedicinesService } from '../../src/services/medicineService.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getMedicineService', () => {
  it('maps the ObjectId to a string DTO', async () => {
    const id = new ObjectId();
    medicineCollection.findOne.mockResolvedValue({ _id: id, name: 'Paracetamol', count: 100, price: 25 });

    await expect(getMedicineService(id)).resolves.toEqual({
      _id: id.toString(),
      name: 'Paracetamol',
      count: 100,
      price: 25,
    });
  });

  it('returns null when the medicine does not exist', async () => {
    medicineCollection.findOne.mockResolvedValue(null);

    await expect(getMedicineService(new ObjectId())).resolves.toBeNull();
  });
});

describe('getPaginatedMedicinesService', () => {
  it('maps docs to string-id DTOs and reads totalItems', async () => {
    const id = new ObjectId();
    medicineCollection.aggregate.mockReturnValue({
      toArray: () =>
        Promise.resolve([
          {
            data: [{ _id: id, name: 'Paracetamol', count: 100, price: 25 }],
            metadata: [{ totalItems: 1 }],
          },
        ]),
    });

    const result = await getPaginatedMedicinesService(1, 10, '');

    expect(result).toEqual({
      data: [{ _id: id.toString(), name: 'Paracetamol', count: 100, price: 25 }],
      totalItems: 1,
    });
  });

  it('returns empty data when the aggregation has no facet result', async () => {
    medicineCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([]) });

    const result = await getPaginatedMedicinesService(1, 10);

    expect(result).toEqual({ data: [], totalItems: 0 });
  });

  it('filters by stockName when provided', async () => {
    medicineCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([]) });

    await getPaginatedMedicinesService(1, 10, 'para');

    const pipeline = medicineCollection.aggregate.mock.calls[0]?.[0] as Array<{ $match: unknown }>;
    expect(pipeline[0]).toEqual({ $match: { name: { $regex: 'para', $options: 'i' } } });
  });
});
