# EventEmitter



**Since**: 1.0.0

**Category**: Core Components

**File**: [`src/core/EventEmitter.js`](src/core/EventEmitter.js)

---




## Usage Examples

### Using EventEmitter


```javascript
const emitter = new EventEmitter();
emitter.on('dataChange', (data) => console.log(data));
emitter.emit('dataChange', { value: 'new data' });
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)