import { beforeEach, describe, expect, it, vi } from 'vitest';
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

import { getBranchLowestStocksService, getBranchStocksService, getBranchStockService, getBranchesLowestStocksService, getBranchesService } from '../../src/services/branchService.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getBranchesService', () => {
  it('maps ObjectIds to strings', async () => {
    const branchId = new ObjectId();
    const stockId = new ObjectId();
    branchCollection.find.mockReturnValue({
      toArray: () => Promise.resolve([
        { _id: branchId, name: 'Main', stocks: [{ stock_id: stockId, stock_onhold_amount: 5 }] },
      ]),
    });

    const result = await getBranchesService();

    expect(result).toEqual([
      { _id: branchId.toString(), name: 'Main', stocks: [{ stock_id: stockId.toString(), stock_onhold_amount: 5 }] },
    ]);
  });

  it('defaults missing stocks to an empty array instead of throwing', async () => {
    branchCollection.find.mockReturnValue({
      toArray: () => Promise.resolve([{ _id: new ObjectId(), name: 'Empty' }]),
    });

    await expect(getBranchesService()).resolves.toEqual([
      expect.objectContaining({ name: 'Empty', stocks: [] }),
    ]);
  });

  it('omits stock_id when it is undefined (exactOptionalPropertyTypes)', async () => {
    branchCollection.find.mockReturnValue({
      toArray: () => Promise.resolve([
        { _id: new ObjectId(), name: 'Main', stocks: [{ stock_onhold_amount: 3 }] },
      ]),
    });

    const result = await getBranchesService();

    expect(result[0]?.stocks[0]).toEqual({ stock_onhold_amount: 3 });
    expect(result[0]?.stocks[0]).not.toHaveProperty('stock_id');
  });
});

describe('getBranchStocksService', () => {
  it('returns paginated data and totalItems', async () => {
    const rows = [{ 'stock-id': 'abc', 'stock-name': 'Paracetamol', stock_onhold_amount: 4, percentage: 40 }];
    branchCollection.aggregate.mockReturnValue({
      toArray: () => Promise.resolve([{ data: rows, metadata: [{ total: 1 }] }]),
    });

    const result = await getBranchStocksService(new ObjectId(), { page: 1, limit: 10 });

    expect(result).toEqual({ data: rows, totalItems: 1 });
  });

  it('returns empty data when the aggregation has no facet result', async () => {
    branchCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve([]) });

    const result = await getBranchStocksService(new ObjectId(), { page: 2, limit: 5 });

    expect(result).toEqual({ data: [], totalItems: 0 });
  });
});

describe('getBranchStockService', () => {
  it('returns the aggregation result as-is', async () => {
    const rows = [{ stock_name: 'Ibuprofen', stock_id: new ObjectId(), stock_onhold_amount: 2 }];
    branchCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve(rows) });

    const result = await getBranchStockService(new ObjectId(), new ObjectId());

    expect(result).toEqual(rows);
    expect(branchCollection.aggregate).toHaveBeenCalledOnce();
  });
});

describe('getBranchLowestStocksService', () => {
  it('returns paginated data and totalItems', async () => {
    const rows = [{ 'stock-name': 'Aspirin', stock_onhold_amount: 1 }];
    branchCollection.aggregate.mockReturnValue({
      toArray: () => Promise.resolve([{ data: rows, metadata: [{ total: 1 }] }]),
    });

    const result = await getBranchLowestStocksService(new ObjectId(), 1, 10);

    expect(result).toEqual({ data: rows, totalItems: 1 });
  });
});

describe('getBranchesLowestStocksService', () => {
  it('returns the aggregation result as-is', async () => {
    const rows = [{ 'stock-name': 'Aspirin', branch: 'Main', 'stock-percentage': '10%' }];
    branchCollection.aggregate.mockReturnValue({ toArray: () => Promise.resolve(rows) });

    await expect(getBranchesLowestStocksService()).resolves.toEqual(rows);
  });
});
