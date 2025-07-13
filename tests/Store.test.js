/**
 * Unit tests for Store
 * Tests data management functionality
 */

import { Store } from '../src/core/Store.js';

describe('Store', () => {
  let store;

  beforeEach(() => {
    store = null;
  });

  afterEach(() => {
    if (store) {
      store.removeAllListeners();
    }
    store = null;
  });

  describe('constructor', () => {
    test('should create store with default config', () => {
      store = new Store();

      expect(store.data).toEqual([]);
      expect(store.loading).toBe(false);
      expect(store.proxy).toBeUndefined();
      expect(store.sorters).toEqual([]);
      expect(store.filters).toEqual([]);
    });

    test('should create store with initial data', () => {
      const data = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ];

      store = new Store({ data });

      expect(store.data).toEqual(data);
      expect(store.getCount()).toBe(2);
    });

    test('should create store with sorters and filters', () => {
      const sorters = [{ property: 'name', direction: 'ASC' }];
      const filters = [{ property: 'active', value: true }];

      store = new Store({ sorters, filters });

      expect(store.sorters).toEqual(sorters);
      expect(store.filters).toEqual(filters);
    });

    test('should auto-load when proxy and autoLoad provided', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      const proxy = {
        read: jest.fn().mockResolvedValue(mockData)
      };

      store = new Store({ proxy, autoLoad: true });

      // Wait for async load
      await testUtils.nextTick();

      expect(proxy.read).toHaveBeenCalled();
      expect(store.data).toEqual(mockData);
    });
  });

  describe('load()', () => {
    test('should load data from proxy', async () => {
      const mockData = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' }
      ];

      const proxy = {
        read: jest.fn().mockResolvedValue(mockData)
      };

      store = new Store({ proxy });

      const beforeLoadSpy = jest.fn();
      const loadSpy = jest.fn();

      store.on('beforeload', beforeLoadSpy);
      store.on('load', loadSpy);

      const result = await store.load();

      expect(proxy.read).toHaveBeenCalled();
      expect(result).toEqual(mockData);
      expect(store.data).toEqual(mockData);
      expect(store.loading).toBe(false);
      expect(beforeLoadSpy).toHaveBeenCalled();
      expect(loadSpy).toHaveBeenCalledWith({ data: mockData });
    });

    test('should handle load errors', async () => {
      const error = new Error('Load failed');
      const proxy = {
        read: jest.fn().mockRejectedValue(error)
      };

      store = new Store({ proxy });

      const exceptionSpy = jest.fn();
      store.on('exception', exceptionSpy);

      await expect(store.load()).rejects.toThrow('Load failed');
      expect(store.loading).toBe(false);
      expect(exceptionSpy).toHaveBeenCalledWith({ error });
    });

    test('should warn when no proxy configured', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      store = new Store();

      const result = await store.load();

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledWith('No proxy configured for store');

      consoleSpy.mockRestore();
    });

    test('should set loading state during load', async () => {
      let loadingDuringRead = false;
      const proxy = {
        read: jest.fn().mockImplementation(() => {
          loadingDuringRead = store.loading;
          return Promise.resolve([]);
        })
      };

      store = new Store({ proxy });

      await store.load();

      expect(loadingDuringRead).toBe(true);
      expect(store.loading).toBe(false);
    });
  });

  describe('loadData()', () => {
    test('should load data directly', () => {
      const data = [{ id: 1, name: 'Test' }];
      store = new Store();

      const loadSpy = jest.fn();
      store.on('load', loadSpy);

      store.loadData(data);

      expect(store.data).toEqual(data);
      expect(loadSpy).toHaveBeenCalledWith({ data });
    });

    test('should handle non-array data', () => {
      store = new Store();

      store.loadData('not an array');

      expect(store.data).toEqual([]);
    });

    test('should handle null/undefined data', () => {
      store = new Store();

      store.loadData(null);
      expect(store.data).toEqual([]);

      store.loadData(undefined);
      expect(store.data).toEqual([]);
    });
  });

  describe('add()', () => {
    beforeEach(() => {
      store = new Store({
        data: [{ id: 1, name: 'John' }]
      });
    });

    test('should add record to store', () => {
      const newRecord = { id: 2, name: 'Jane' };
      const addSpy = jest.fn();
      store.on('add', addSpy);

      const result = store.add(newRecord);

      expect(result).toBe(store); // Should return this for chaining
      expect(store.data).toContain(newRecord);
      expect(store.getCount()).toBe(2);
      expect(addSpy).toHaveBeenCalledWith({ record: newRecord, index: 1 });
    });
  });

  describe('remove()', () => {
    beforeEach(() => {
      store = new Store({
        data: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ]
      });
    });

    test('should remove record from store', () => {
      const recordToRemove = store.data[0];
      const removeSpy = jest.fn();
      store.on('remove', removeSpy);

      const result = store.remove(recordToRemove);

      expect(result).toBe(store); // Should return this for chaining
      expect(store.data).not.toContain(recordToRemove);
      expect(store.getCount()).toBe(1);
      expect(removeSpy).toHaveBeenCalledWith({ record: recordToRemove, index: 0 });
    });

    test('should handle removing non-existent record', () => {
      const nonExistentRecord = { id: 999, name: 'Ghost' };
      const removeSpy = jest.fn();
      store.on('remove', removeSpy);

      store.remove(nonExistentRecord);

      expect(store.getCount()).toBe(2);
      expect(removeSpy).not.toHaveBeenCalled();
    });
  });

  describe('removeAt()', () => {
    beforeEach(() => {
      store = new Store({
        data: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ]
      });
    });

    test('should remove record at index', () => {
      const recordToRemove = store.data[1];
      const removeSpy = jest.fn();
      store.on('remove', removeSpy);

      const result = store.removeAt(1);

      expect(result).toBe(recordToRemove);
      expect(store.getCount()).toBe(1);
      expect(store.data[0].name).toBe('John');
      expect(removeSpy).toHaveBeenCalledWith({ record: recordToRemove, index: 1 });
    });

    test('should handle invalid index', () => {
      const removeSpy = jest.fn();
      store.on('remove', removeSpy);

      expect(store.removeAt(-1)).toBeNull();
      expect(store.removeAt(999)).toBeNull();
      expect(store.getCount()).toBe(2);
      expect(removeSpy).not.toHaveBeenCalled();
    });
  });

  describe('data access methods', () => {
    beforeEach(() => {
      store = new Store({
        data: [
          { id: 1, name: 'John', age: 30 },
          { id: 2, name: 'Jane', age: 25 },
          { id: 3, name: 'Bob', age: 35 }
        ]
      });
    });

    test('getCount() should return number of records', () => {
      expect(store.getCount()).toBe(3);
    });

    test('getAt() should return record at index', () => {
      const record = store.getAt(1);
      expect(record.name).toBe('Jane');
      expect(store.getAt(999)).toBeUndefined();
    });

    test('getById() should find record by id', () => {
      const record = store.getById(2);
      expect(record.name).toBe('Jane');
      expect(store.getById(999)).toBeUndefined();
    });

    test('indexOf() should return index of record', () => {
      const record = store.data[1];
      expect(store.indexOf(record)).toBe(1);
      expect(store.indexOf({ id: 999 })).toBe(-1);
    });

    test('getRecords() should return all records', () => {
      const records = store.getRecords();
      expect(records).toHaveLength(3);
      expect(records[0].name).toBe('John');
    });
  });

  describe('sorting', () => {
    beforeEach(() => {
      store = new Store({
        data: [
          { id: 1, name: 'Charlie', age: 30 },
          { id: 2, name: 'Alice', age: 25 },
          { id: 3, name: 'Bob', age: 35 }
        ]
      });
    });

    test('should sort by single field ascending', () => {
      const sortSpy = jest.fn();
      store.on('sort', sortSpy);

      const result = store.sort({ property: 'name', direction: 'ASC' });

      expect(result).toBe(store); // Should return this for chaining
      
      const records = store.getRecords();
      expect(records[0].name).toBe('Alice');
      expect(records[1].name).toBe('Bob');
      expect(records[2].name).toBe('Charlie');
      
      expect(sortSpy).toHaveBeenCalledWith({ 
        sorters: [{ property: 'name', direction: 'ASC' }]
      });
    });

    test('should sort by single field descending', () => {
      store.sort({ property: 'age', direction: 'DESC' });

      const records = store.getRecords();
      expect(records[0].age).toBe(35);
      expect(records[1].age).toBe(30);
      expect(records[2].age).toBe(25);
    });

    test('should sort by multiple fields', () => {
      // Add duplicate ages to test multi-field sorting
      store.data.push({ id: 4, name: 'David', age: 25 });

      store.sort([
        { property: 'age', direction: 'ASC' },
        { property: 'name', direction: 'ASC' }
      ]);

      const records = store.getRecords();
      expect(records[0].name).toBe('Alice'); // age 25, name A
      expect(records[1].name).toBe('David'); // age 25, name D
      expect(records[2].age).toBe(30);
      expect(records[3].age).toBe(35);
    });

    test('should handle array and single sorter', () => {
      store.sort([{ property: 'name', direction: 'ASC' }]);
      expect(store.sorters).toHaveLength(1);

      store.sort({ property: 'age', direction: 'DESC' });
      expect(store.sorters).toHaveLength(1);
      expect(store.sorters[0].property).toBe('age');
    });

    test('clearSorters() should remove all sorting', () => {
      store.sort({ property: 'name', direction: 'ASC' });
      const sortSpy = jest.fn();
      store.on('sort', sortSpy);

      const result = store.clearSorters();

      expect(result).toBe(store); // Should return this for chaining
      expect(store.sorters).toEqual([]);
      expect(sortSpy).toHaveBeenCalledWith({ sorters: [] });

      // Records should be in original order
      const records = store.getRecords();
      expect(records[0].name).toBe('Charlie');
    });
  });

  describe('filtering', () => {
    beforeEach(() => {
      store = new Store({
        data: [
          { id: 1, name: 'John', age: 30, active: true },
          { id: 2, name: 'Jane', age: 25, active: false },
          { id: 3, name: 'Bob', age: 35, active: true },
          { id: 4, name: 'Alice', age: 28, active: true }
        ]
      });
    });

    test('should filter with equals operator', () => {
      const filterSpy = jest.fn();
      store.on('filter', filterSpy);

      const result = store.filter({ property: 'active', value: true });

      expect(result).toBe(store); // Should return this for chaining
      
      const records = store.getRecords();
      expect(records).toHaveLength(3);
      expect(records.every(r => r.active)).toBe(true);
      
      expect(filterSpy).toHaveBeenCalledWith({ 
        filters: [{ property: 'active', value: true }]
      });
    });

    test('should filter with greater than operator', () => {
      store.filter({ property: 'age', value: 30, operator: 'gt' });

      const records = store.getRecords();
      expect(records).toHaveLength(1);
      expect(records[0].name).toBe('Bob');
    });

    test('should filter with like operator', () => {
      store.filter({ property: 'name', value: 'jo', operator: 'like' });

      const records = store.getRecords();
      expect(records).toHaveLength(1);
      expect(records[0].name).toBe('John');
    });

    test('should filter with in operator', () => {
      store.filter({ property: 'name', value: ['John', 'Alice'], operator: 'in' });

      const records = store.getRecords();
      expect(records).toHaveLength(2);
      expect(records.map(r => r.name).sort()).toEqual(['Alice', 'John']);
    });

    test('should support all comparison operators', () => {
      const testCases = [
        { operator: 'eq', value: 30, expectedCount: 1 },
        { operator: 'ne', value: 30, expectedCount: 3 },
        { operator: 'gt', value: 30, expectedCount: 1 },
        { operator: 'gte', value: 30, expectedCount: 2 },
        { operator: 'lt', value: 30, expectedCount: 2 },
        { operator: 'lte', value: 30, expectedCount: 3 }
      ];

      testCases.forEach(({ operator, value, expectedCount }) => {
        store.filter({ property: 'age', value, operator });
        expect(store.getRecords()).toHaveLength(expectedCount);
      });
    });

    test('should filter with multiple filters (AND logic)', () => {
      store.filter([
        { property: 'active', value: true },
        { property: 'age', value: 30, operator: 'gte' }
      ]);

      const records = store.getRecords();
      expect(records).toHaveLength(2); // John and Bob
      expect(records.every(r => r.active && r.age >= 30)).toBe(true);
    });

    test('should handle array and single filter', () => {
      store.filter([{ property: 'active', value: true }]);
      expect(store.filters).toHaveLength(1);

      store.filter({ property: 'age', value: 25 }, true); // Use replace=true
      expect(store.filters).toHaveLength(1);
      expect(store.filters[0].property).toBe('age');
    });

    test('clearFilters() should remove all filtering', () => {
      store.filter({ property: 'active', value: true });
      const filterSpy = jest.fn();
      store.on('filter', filterSpy);

      const result = store.clearFilters();

      expect(result).toBe(store); // Should return this for chaining
      expect(store.filters).toEqual([]);
      expect(filterSpy).toHaveBeenCalledWith({ filters: [] });

      // Should show all records
      expect(store.getRecords()).toHaveLength(4);
    });

    test('should handle unknown operators gracefully', () => {
      store.filter({ property: 'age', value: 30, operator: 'unknown' });

      // Should return all records when operator is unknown
      expect(store.getRecords()).toHaveLength(4);
    });

    test('should handle case sensitivity in like operator', () => {
      store.filter({ property: 'name', value: 'JOHN', operator: 'like' });

      const records = store.getRecords();
      expect(records).toHaveLength(1);
      expect(records[0].name).toBe('John');
    });
  });

  describe('clear()', () => {
    test('should clear all data', () => {
      store = new Store({
        data: [{ id: 1, name: 'Test' }]
      });

      const clearSpy = jest.fn();
      store.on('clear', clearSpy);

      const result = store.clear();

      expect(result).toBe(store); // Should return this for chaining
      expect(store.data).toEqual([]);
      expect(store.getCount()).toBe(0);
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('combined operations', () => {
    beforeEach(() => {
      store = new Store({
        data: [
          { id: 1, name: 'John', age: 30, active: true },
          { id: 2, name: 'Jane', age: 25, active: false },
          { id: 3, name: 'Bob', age: 35, active: true },
          { id: 4, name: 'Alice', age: 28, active: true }
        ]
      });
    });

    test('should apply filters and sorting together', () => {
      // Filter active users and sort by age descending
      store.filter({ property: 'active', value: true });
      store.sort({ property: 'age', direction: 'DESC' });

      const records = store.getRecords();
      expect(records).toHaveLength(3);
      expect(records[0].name).toBe('Bob');    // age 35
      expect(records[1].name).toBe('John');   // age 30
      expect(records[2].name).toBe('Alice');  // age 28
    });

    test('should maintain filtering and sorting when adding records', () => {
      store.filter({ property: 'active', value: true });
      store.sort({ property: 'age', direction: 'ASC' });

      store.add({ id: 5, name: 'Charlie', age: 32, active: true });

      const records = store.getRecords();
      expect(records).toHaveLength(4);
      expect(records.map(r => r.age)).toEqual([28, 30, 32, 35]);
    });
  });

  describe('method chaining', () => {
    test('should support method chaining', () => {
      store = new Store();

      const result = store
        .add({ id: 1, name: 'John' })
        .add({ id: 2, name: 'Jane' })
        .sort({ property: 'name', direction: 'ASC' })
        .filter({ property: 'name', value: 'j', operator: 'like' })
        .clearFilters()
        .clearSorters()
        .clear();

      expect(result).toBe(store);
      expect(store.getCount()).toBe(0);
    });
  });

  describe('updateAt method', () => {
    beforeEach(() => {
      store = new Store({
        data: [
          { id: 1, name: 'John', age: 30 },
          { id: 2, name: 'Jane', age: 25 },
          { id: 3, name: 'Bob', age: 35 }
        ]
      });
    });

    test('should update record at valid index', () => {
      const updateSpy = jest.fn();
      const recordUpdateSpy = jest.fn();
      store.on('update', updateSpy);
      store.on('recordupdate', recordUpdateSpy);

      const updated = store.updateAt(1, { name: 'Jane Updated' });
      
      expect(updated).toBeDefined();
      expect(updated.name).toBe('Jane Updated');
      expect(store.getAt(1).name).toBe('Jane Updated');
      expect(updateSpy).toHaveBeenCalled();
      expect(recordUpdateSpy).toHaveBeenCalledWith({
        record: updated,
        index: 1,
        changes: { name: 'Jane Updated' }
      });
    });

    test('should return null for invalid index', () => {
      const result = store.updateAt(-1, { name: 'Invalid' });
      expect(result).toBeNull();
      
      const result2 = store.updateAt(999, { name: 'Invalid' });
      expect(result2).toBeNull();
    });
  });

  describe('tree data conversion', () => {
    beforeEach(() => {
      store = new Store();
    });

    test('should convert flat data to tree structure', () => {
      const flatData = [
        { id: 1, name: 'Root', parentId: null },
        { id: 2, name: 'Child 1', parentId: 1 },
        { id: 3, name: 'Child 2', parentId: 1 },
        { id: 4, name: 'Grandchild', parentId: 2 }
      ];
      
      store.loadData(flatData);
      const tree = store.toTree('parentId', 'children', null);
      
      expect(tree).toHaveLength(1);
      expect(tree[0].name).toBe('Root');
      expect(tree[0].children).toHaveLength(2);
      expect(tree[0].children[0].name).toBe('Child 1');
      expect(tree[0].children[0].children).toHaveLength(1);
      expect(tree[0].children[0].children[0].name).toBe('Grandchild');
    });

    test('should convert tree data to flat structure', () => {
      const treeData = [
        {
          id: 1,
          name: 'Root',
          children: [
            {
              id: 2,
              name: 'Child 1',
              children: [
                { id: 4, name: 'Grandchild' }
              ]
            },
            { id: 3, name: 'Child 2' }
          ]
        }
      ];
      
      const flat = store.fromTree(treeData, 'parentId', 'children');
      
      expect(flat).toHaveLength(4);
      expect(flat.find(r => r.id === 1).parentId).toBeNull();
      expect(flat.find(r => r.id === 2).parentId).toBe(1);
      expect(flat.find(r => r.id === 3).parentId).toBe(1);
      expect(flat.find(r => r.id === 4).parentId).toBe(2);
      
      // Children should be removed from flat nodes
      flat.forEach(node => {
        expect(node.children).toBeUndefined();
      });
    });

    test('should handle empty or invalid tree data', () => {
      expect(store.fromTree(null)).toEqual([]);
      expect(store.fromTree(undefined)).toEqual([]);
      expect(store.fromTree({})).toEqual([]);
      expect(store.fromTree([])).toEqual([]);
    });

    test('should handle tree conversion with missing IDs', () => {
      const badData = [
        { name: 'No ID', parentId: null },
        { id: 2, name: 'Has ID', parentId: null }
      ];
      
      store.loadData(badData);
      const tree = store.toTree('parentId', 'children', null);
      
      expect(tree).toHaveLength(1); // Only record with ID should be in tree
      expect(tree[0].name).toBe('Has ID');
    });
  });

  describe('advanced update methods', () => {
    beforeEach(() => {
      store = new Store({
        data: [
          { id: 1, name: 'John', age: 30 },
          { id: 2, name: 'Jane', age: 25 }
        ]
      });
    });

    test('should update record by object reference', () => {
      const record = store.getAt(1);
      const updateSpy = jest.fn();
      store.on('recordupdate', updateSpy);

      // Single argument update by object
      record.name = 'Jane Modified';
      record.age = 26;
      store.update(record);

      expect(store.getAt(1).name).toBe('Jane Modified');
      expect(store.getAt(1).age).toBe(26);
      expect(updateSpy).toHaveBeenCalled();
    });

    test('should track changes in single argument update', () => {
      const originalRecord = store.getAt(0);
      const updateSpy = jest.fn();
      store.on('recordupdate', updateSpy);

      // Create a modified copy of the record
      const modifiedRecord = { ...originalRecord, name: 'John Updated', newField: 'new value' };
      store.update(modifiedRecord);

      expect(updateSpy).toHaveBeenCalledWith({
        record: expect.objectContaining({
          id: 1,
          name: 'John Updated',
          newField: 'new value'
        }),
        index: 0,
        changes: {
          name: 'John Updated',
          newField: 'new value'
        }
      });
    });
  });

  describe('setData and getFilteredData aliases', () => {
    beforeEach(() => {
      store = new Store();
    });

    test('setData should work as alias for loadData', () => {
      const newData = [{ id: 10, name: 'New Record' }];
      const loadSpy = jest.fn();
      store.on('load', loadSpy);

      store.setData(newData);

      expect(store.getCount()).toBe(1);
      expect(store.getAt(0).name).toBe('New Record');
      expect(loadSpy).toHaveBeenCalled();
    });

    test('getFilteredData should work as alias for getRecords', () => {
      store.loadData([
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 }
      ]);
      store.filter({ property: 'name', value: 'John' });
      
      const filteredByGetRecords = store.getRecords();
      const filteredByAlias = store.getFilteredData();
      
      expect(filteredByAlias).toEqual(filteredByGetRecords);
      expect(filteredByAlias).toHaveLength(1);
      expect(filteredByAlias[0].name).toBe('John');
    });
  });

  describe('advanced filtering', () => {
    beforeEach(() => {
      store = new Store({
        data: [
          { id: 1, name: 'John', age: 30 },
          { id: 2, name: 'Jane', age: 25 }
        ]
      });
    });

    test('should replace existing filters when replace=true', () => {
      store.filter({ property: 'name', value: 'John' });
      expect(store.getRecords()).toHaveLength(1);

      store.filter({ property: 'age', value: 25 }, true);
      expect(store.getRecords()).toHaveLength(1);
      expect(store.getRecords()[0].name).toBe('Jane');
    });

    test('should update existing filter for same property', () => {
      store.filter({ property: 'name', value: 'John' });
      expect(store.getRecords()).toHaveLength(1);

      store.filter({ property: 'name', value: 'Jane' }, false);
      expect(store.getRecords()).toHaveLength(1);
      expect(store.getRecords()[0].name).toBe('Jane');
    });

    test('should add new filter when different property', () => {
      store.filter({ property: 'name', value: 'John' });
      store.filter({ property: 'age', value: 30 }, false);
      
      // Should have both filters (AND logic)
      expect(store.getRecords()).toHaveLength(1);
      expect(store.getRecords()[0].name).toBe('John');
      expect(store.getRecords()[0].age).toBe(30);
    });
  });

  describe('edge cases', () => {
    test('should handle null/undefined config', () => {
      expect(() => new Store(null)).not.toThrow();
      expect(() => new Store(undefined)).not.toThrow();
    });

    test('should handle empty data operations', () => {
      store = new Store();

      expect(store.getCount()).toBe(0);
      expect(store.getAt(0)).toBeUndefined();
      expect(store.getById(1)).toBeUndefined();
      expect(store.indexOf({})).toBe(-1);
      expect(store.removeAt(0)).toBeNull();
    });

    test('should handle filtering on undefined properties', () => {
      store = new Store({
        data: [{ id: 1, name: 'John' }]
      });

      store.filter({ property: 'nonexistent', value: 'test' });

      const records = store.getRecords();
      expect(records).toHaveLength(0); // undefined !== 'test'
    });

    test('should handle sorting on undefined properties', () => {
      store = new Store({
        data: [
          { id: 1, name: 'John' },
          { id: 2, name: 'Jane' }
        ]
      });

      expect(() => {
        store.sort({ property: 'nonexistent', direction: 'ASC' });
        store.getRecords();
      }).not.toThrow();
    });
  });
});