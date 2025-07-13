import { EventEmitter } from './EventEmitter.js';

/**
 * @component Store
 * @extends EventEmitter
 * @description Data management class with filtering, sorting, and remote loading capabilities
 * @category Core Components
 * @since 1.0.0
 * @example
 * // Creating a data store
 * const store = new Store({
 *   data: [
 *     { id: 1, name: 'John', age: 30 },
 *     { id: 2, name: 'Jane', age: 25 }
 *   ],
 *   sorters: [{ property: 'name', direction: 'ASC' }]
 * });
 */
export class Store extends EventEmitter {
  /**
   * Creates a new Store instance
   * @param {Object} [config={}] - Configuration object
   * @param {Array} [config.data=[]] - Initial data array
   * @param {Object} [config.proxy] - Data proxy for remote loading
   * @param {Array} [config.sorters=[]] - Initial sorters array
   * @param {Array} [config.filters=[]] - Initial filters array
   * @param {boolean} [config.autoLoad=false] - Auto-load data if proxy is configured
   */
  constructor(config = {}) {
    super();
    
    // Handle null/undefined config
    config = config || {};
    
    /**
     * The data records
     * @type {Array}
     */
    this.data = config.data || [];
    
    /**
     * Loading state
     * @type {boolean}
     */
    this.loading = false;
    
    /**
     * Data proxy for remote operations
     * @type {Object|null}
     */
    this.proxy = config.proxy;
    
    /**
     * Current sorters
     * @type {Array}
     */
    this.sorters = config.sorters || [];
    
    /**
     * Current filters
     * @type {Array}
     */
    this.filters = config.filters || [];

    if (config.autoLoad && this.proxy) {
      this.load();
    }
  }

  /**
   * Loads data from the configured proxy
   * @returns {Promise<Array>} Promise resolving to loaded data
   * @fires Store#beforeload
   * @fires Store#load
   * @fires Store#exception
   * @example
   * const data = await store.load();
   */
  async load() {
    if (!this.proxy || !this.proxy.read) {
      console.warn('No proxy configured for store');
      return Promise.resolve([]);
    }

    this.loading = true;
    this.emit('beforeload');

    try {
      const data = await this.proxy.read();
      this.data = data;
      this.loading = false;
      this.emit('load', { data });
      return data;
    } catch (error) {
      this.loading = false;
      this.emit('exception', { error });
      throw error;
    }
  }

  /**
   * Loads data directly into the store
   * @param {Array} data - Data array to load
   * @fires Store#load
   * @fires Store#update
   * @example
   * store.loadData([{id: 1, name: 'John'}]);
   */
  loadData(data) {
    this.data = Array.isArray(data) ? data : [];
    this.emit('load', { data: this.data });
    this.emit('update');
  }

  /**
   * Alias for loadData - sets data directly
   * @param {Array} data - Data array to set
   * @fires Store#load
   * @fires Store#update
   * @example
   * store.setData([{id: 1, name: 'John'}]);
   */
  setData(data) {
    return this.loadData(data);
  }

  /**
   * Adds a record to the store
   * @param {Object} record - Record to add
   * @returns {Store} Returns this for chaining
   * @fires Store#add
   * @fires Store#update
   * @example
   * store.add({id: 3, name: 'Bob'});
   */
  add(record) {
    this.data.push(record);
    this.emit('add', { record, index: this.data.length - 1 });
    this.emit('update');
    return this;
  }

  /**
   * Removes a record from the store
   * @param {Object} record - Record to remove
   * @returns {Store} Returns this for chaining
   * @fires Store#remove
   * @fires Store#update
   * @example
   * store.remove(myRecord);
   */
  remove(record) {
    const index = this.data.indexOf(record);
    if (index !== -1) {
      this.data.splice(index, 1);
      this.emit('remove', { record, index });
      this.emit('update');
    }
    return this;
  }

  /**
   * Removes a record at the specified index
   * @param {number} index - Index of record to remove
   * @returns {Object|null} Removed record or null if index invalid
   * @fires Store#remove
   * @fires Store#update
   * @example
   * const removed = store.removeAt(0);
   */
  removeAt(index) {
    if (index >= 0 && index < this.data.length) {
      const record = this.data[index];
      this.data.splice(index, 1);
      this.emit('remove', { record, index });
      this.emit('update');
      return record;
    }
    return null;
  }

  /**
   * Returns the number of records (after filtering)
   * @returns {number} Number of records
   * @example
   * const count = store.getCount();
   */
  getCount() {
    return this.getRecords().length;
  }

  /**
   * Returns the record at the specified index (after filtering/sorting)
   * @param {number} index - Index of record to get
   * @returns {Object|undefined} Record at index or undefined
   * @example
   * const firstRecord = store.getAt(0);
   */
  getAt(index) {
    const records = this.getRecords();
    return records[index];
  }

  /**
   * Returns the record with the specified ID
   * @param {*} id - ID of record to find
   * @returns {Object|undefined} Record with matching ID or undefined
   * @example
   * const user = store.getById(123);
   */
  getById(id) {
    return this.data.find(record => record.id === id);
  }

  /**
   * Returns the index of a record (after filtering/sorting)
   * @param {Object} record - Record to find index of
   * @returns {number} Index of record or -1 if not found
   * @example
   * const index = store.indexOf(myRecord);
   */
  indexOf(record) {
    return this.getRecords().indexOf(record);
  }

  /**
   * Returns the raw data array (without filters or sorting)
   * @returns {Array} Raw data array
   * @example
   * const allData = store.getData();
   */
  getData() {
    return this.data;
  }

  /**
   * Returns all records with filters and sorters applied
   * @returns {Array} Filtered and sorted records
   * @example
   * const visibleRecords = store.getRecords();
   */
  getRecords() {
    let result = [...this.data];

    // Apply filters
    if (this.filters.length > 0) {
      result = this.applyFilters(result);
    }

    // Apply sorting
    if (this.sorters.length > 0) {
      result = this.applySorters(result);
    }

    return result;
  }

  /**
   * Alias for getRecords() - returns filtered data
   * @returns {Array} Filtered and sorted records
   * @example
   * const filteredData = store.getFilteredData();
   */
  getFilteredData() {
    return this.getRecords();
  }

  /**
   * Sets the sort configuration
   * @param {Object|Array} sorters - Sorter object or array of sorters
   * @param {string} sorters.property - Property to sort by
   * @param {string} sorters.direction - Sort direction ('ASC' or 'DESC')
   * @returns {Store} Returns this for chaining
   * @fires Store#sort
   * @example
   * store.sort({property: 'name', direction: 'ASC'});
   * store.sort([{property: 'name', direction: 'ASC'}, {property: 'age', direction: 'DESC'}]);
   */
  sort(sorters) {
    this.sorters = Array.isArray(sorters) ? sorters : [sorters];
    this.emit('sort', { sorters: this.sorters });
    return this;
  }

  /**
   * Sets the filter configuration
   * @param {Object|Array} filters - Filter object or array of filters
   * @param {string} filters.property - Property to filter by
   * @param {*} filters.value - Value to filter for
   * @param {string} [filters.operator='eq'] - Filter operator ('eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'like', 'in')
   * @param {boolean} [replace=false] - Whether to replace existing filters or add to them
   * @returns {Store} Returns this for chaining
   * @fires Store#filter
   * @example
   * store.filter({property: 'active', value: true});
   * store.filter({property: 'name', value: 'John', operator: 'like'});
   */
  filter(filters, replace = false) {
    const newFilters = Array.isArray(filters) ? filters : [filters];
    
    if (replace) {
      this.filters = newFilters;
    } else {
      // Add filters, replacing any existing filter for the same property
      newFilters.forEach(newFilter => {
        const existingIndex = this.filters.findIndex(f => f.property === newFilter.property);
        if (existingIndex >= 0) {
          this.filters[existingIndex] = newFilter;
        } else {
          this.filters.push(newFilter);
        }
      });
    }
    
    this.emit('filter', { filters: this.filters });
    return this;
  }

  /**
   * Clears all filters
   * @returns {Store} Returns this for chaining
   * @fires Store#filter
   * @example
   * store.clearFilters();
   */
  clearFilters() {
    this.filters = [];
    this.emit('filter', { filters: this.filters });
    return this;
  }

  /**
   * Clears all sorters
   * @returns {Store} Returns this for chaining
   * @fires Store#sort
   * @example
   * store.clearSorters();
   */
  clearSorters() {
    this.sorters = [];
    this.emit('sort', { sorters: this.sorters });
    return this;
  }

  /**
   * Updates a record with new data
   * @param {Object} record - Record to update
   * @param {Object} newData - New data to merge
   * @returns {Store} Returns this for chaining
   * @fires Store#recordupdate
   * @fires Store#update
   * @example
   * store.update(myRecord, {name: 'New Name'});
   */
  update(record, newData) {
    // Support single argument update (by ID)
    if (newData === undefined && record && record.id !== undefined) {
      const index = this.data.findIndex(r => r.id === record.id);
      if (index !== -1) {
        const changes = {};
        for (const key in record) {
          if (key !== 'id' && this.data[index][key] !== record[key]) {
            changes[key] = record[key];
          }
        }
        Object.assign(this.data[index], record);
        this.emit('recordupdate', { record: this.data[index], index, changes });
        this.emit('update');
      }
      return this;
    }
    
    // Original two-argument behavior
    const index = this.data.indexOf(record);
    if (index !== -1) {
      Object.assign(this.data[index], newData);
      this.emit('recordupdate', { record: this.data[index], index, changes: newData });
      this.emit('update');
    }
    return this;
  }

  /**
   * Updates a record at the specified index
   * @param {number} index - Index of record to update
   * @param {Object} newData - New data to merge
   * @returns {Object|null} Updated record or null if index invalid
   * @fires Store#recordupdate
   * @fires Store#update
   * @example
   * const updated = store.updateAt(0, {name: 'New Name'});
   */
  updateAt(index, newData) {
    if (index >= 0 && index < this.data.length) {
      Object.assign(this.data[index], newData);
      this.emit('recordupdate', { record: this.data[index], index, changes: newData });
      this.emit('update');
      return this.data[index];
    }
    return null;
  }

  /**
   * Clears all data from the store
   * @returns {Store} Returns this for chaining
   * @fires Store#clear
   * @fires Store#update
   * @example
   * store.clear();
   */
  clear() {
    this.data = [];
    this.emit('clear');
    this.emit('update');
    return this;
  }

  /**
   * Applies filters to records
   * @param {Array} records - Records to filter
   * @returns {Array} Filtered records
   * @protected
   */
  applyFilters(records) {
    return records.filter(record => {
      return this.filters.every(filter => {
        const value = record[filter.property];
        const filterValue = filter.value;
        const operator = filter.operator || 'eq';

        switch (operator) {
          case 'eq': return value === filterValue;
          case 'ne': return value !== filterValue;
          case 'gt': return value > filterValue;
          case 'gte': return value >= filterValue;
          case 'lt': return value < filterValue;
          case 'lte': return value <= filterValue;
          case 'like': 
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'in': 
            return Array.isArray(filterValue) ? filterValue.includes(value) : false;
          default: 
            return true;
        }
      });
    });
  }

  /**
   * Applies sorters to records
   * @param {Array} records - Records to sort
   * @returns {Array} Sorted records
   * @protected
   */
  applySorters(records) {
    return records.sort((a, b) => {
      for (const sorter of this.sorters) {
        const aValue = a[sorter.property];
        const bValue = b[sorter.property];
        
        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        else if (aValue > bValue) comparison = 1;
        
        if (comparison !== 0) {
          return sorter.direction === 'DESC' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }

  /**
   * Convert flat data with parent references to hierarchical tree structure
   * @param {string} parentField - Field name containing parent ID reference
   * @param {string} childrenField - Field name for children array (default: 'children')
   * @param {*} rootValue - Value indicating root nodes (default: null)
   * @returns {Array} Hierarchical data structure
   */
  toTree(parentField = 'parentId', childrenField = 'children', rootValue = null) {
    const data = this.getRecords();
    const tree = [];
    const map = new Map();
    
    // Create map of all records by ID
    data.forEach(record => {
      if (record.id !== undefined && record.id !== null) {
        map.set(record.id, { ...record, [childrenField]: [] });
      }
    });
    
    // Build tree structure
    data.forEach(record => {
      if (record.id === undefined || record.id === null) return;
      
      const node = map.get(record.id);
      const parentId = record[parentField];
      
      if (parentId === rootValue || parentId === undefined || parentId === null) {
        tree.push(node);
      } else {
        const parent = map.get(parentId);
        if (parent) {
          parent[childrenField].push(node);
        }
      }
    });
    
    return tree;
  }
  
  /**
   * Convert hierarchical tree data to flat structure with parent references
   * @param {Array} treeData - Hierarchical data to flatten
   * @param {string} parentField - Field name for parent ID reference
   * @param {string} childrenField - Field name containing children array (default: 'children')
   * @param {*} parentId - Parent ID for current level (default: null)
   * @returns {Array} Flattened data with parent references
   */
  fromTree(treeData, parentField = 'parentId', childrenField = 'children', parentId = null) {
    const flat = [];
    
    if (!Array.isArray(treeData)) return flat;
    
    treeData.forEach(node => {
      const flatNode = { ...node };
      flatNode[parentField] = parentId;
      
      // Remove children from flat node
      if (flatNode[childrenField]) {
        const children = flatNode[childrenField];
        delete flatNode[childrenField];
        flat.push(flatNode);
        
        // Recursively flatten children
        const childFlat = this.fromTree(children, parentField, childrenField, node.id);
        flat.push(...childFlat);
      } else {
        flat.push(flatNode);
      }
    });
    
    return flat;
  }
  
  /**
   * Get all children of a node (including nested children)
   * @param {*} nodeId - ID of parent node
   * @param {string} parentField - Field name containing parent ID reference
   * @returns {Array} All descendant records
   */
  getNodeChildren(nodeId, parentField = 'parentId') {
    const children = [];
    const data = this.getRecords();
    
    const findChildren = (parentId) => {
      data.forEach(record => {
        if (record[parentField] === parentId) {
          children.push(record);
          findChildren(record.id);
        }
      });
    };
    
    findChildren(nodeId);
    return children;
  }
  
  /**
   * Get parent path for a node (from root to node)
   * @param {*} nodeId - ID of target node
   * @param {string} parentField - Field name containing parent ID reference
   * @returns {Array} Path from root to node
   */
  getNodePath(nodeId, parentField = 'parentId') {
    const path = [];
    const data = this.getRecords();
    const nodeMap = new Map();
    
    data.forEach(record => {
      if (record.id !== undefined && record.id !== null) {
        nodeMap.set(record.id, record);
      }
    });
    
    let currentNode = nodeMap.get(nodeId);
    while (currentNode) {
      path.unshift(currentNode);
      const parentId = currentNode[parentField];
      currentNode = parentId ? nodeMap.get(parentId) : null;
    }
    
    return path;
  }
  
  /**
   * Get root nodes (nodes without parents)
   * @param {string} parentField - Field name containing parent ID reference
   * @param {*} rootValue - Value indicating root nodes (default: null)
   * @returns {Array} Root level records
   */
  getRootNodes(parentField = 'parentId', rootValue = null) {
    return this.getRecords().filter(record => 
      record[parentField] === rootValue || 
      record[parentField] === undefined || 
      record[parentField] === null
    );
  }
  
  /**
   * Get direct children of a node
   * @param {*} nodeId - ID of parent node
   * @param {string} parentField - Field name containing parent ID reference
   * @returns {Array} Direct child records
   */
  getDirectChildren(nodeId, parentField = 'parentId') {
    return this.getRecords().filter(record => record[parentField] === nodeId);
  }
  
  /**
   * Check if a node has children
   * @param {*} nodeId - ID of node to check
   * @param {string} parentField - Field name containing parent ID reference
   * @returns {boolean} True if node has children
   */
  hasChildren(nodeId, parentField = 'parentId') {
    return this.getRecords().some(record => record[parentField] === nodeId);
  }
  
  /**
   * Move a node to a new parent
   * @param {*} nodeId - ID of node to move
   * @param {*} newParentId - ID of new parent (null for root)
   * @param {string} parentField - Field name containing parent ID reference
   */
  moveNode(nodeId, newParentId, parentField = 'parentId') {
    const node = this.getById(nodeId);
    if (node) {
      node[parentField] = newParentId;
      this.emit('nodemove', { nodeId, newParentId, node });
      this.emit('update');
    }
  }
  
  /**
   * Add a node as child of parent
   * @param {Object} nodeData - Node data to add
   * @param {*} parentId - ID of parent node (null for root)
   * @param {string} parentField - Field name containing parent ID reference
   */
  addChildNode(nodeData, parentId = null, parentField = 'parentId') {
    const node = { ...nodeData };
    node[parentField] = parentId;
    this.add(node);
    this.emit('nodeadd', { node, parentId });
    return node;
  }
  
  /**
   * Remove a node and all its children
   * @param {*} nodeId - ID of node to remove
   * @param {string} parentField - Field name containing parent ID reference
   */
  removeNodeWithChildren(nodeId, parentField = 'parentId') {
    const children = this.getNodeChildren(nodeId, parentField);
    const node = this.getById(nodeId);
    
    // Remove all children first
    children.forEach(child => this.remove(child));
    
    // Remove the node itself
    if (node) {
      this.remove(node);
      this.emit('noderemove', { nodeId, node, childrenRemoved: children.length });
    }
  }
  
  /**
   * Create a tree store with hierarchical data for Tree component
   * @param {Array} data - Tree data (either flat with parentId or nested with children)
   * @param {Object} options - Configuration options
   * @returns {Store} Configured store instance
   */
  static createTreeStore(data, options = {}) {
    const config = {
      data: data || [],
      ...options
    };
    
    const store = new Store(config);
    
    // Add convenience method to get tree data
    store.getTreeData = function(childrenField = 'children') {
      // If data already has children field, return as-is
      if (this.data.length > 0 && this.data[0][childrenField]) {
        return this.getRecords();
      }
      
      // Convert flat data to tree structure
      return this.toTree('parentId', childrenField);
    };
    
    return store;
  }
}