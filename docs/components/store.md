# Store



**Since**: 1.0.0

**Category**: Core Components

**File**: [`src/core/Store.js`](src/core/Store.js)

---




## Usage Examples

### Creating a data store


```javascript
const store = new Store({
  data: [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 }
  ],
  sorters: [{ property: 'name', direction: 'ASC' }]
});
```


## See Also

- [Components Overview](../)
- [API Reference](../api/)
- [Examples](../examples/)