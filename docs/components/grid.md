# Grid



**Since**: 1.0.0

**Category**: Data Components

**File**: [`src/components/Grid.js`](src/components/Grid.js)

---

## Configuration

The following properties can be passed to the component constructor:

### store

- **Type**: `Object`
- **Required**: Yes

Data store containing grid data

### columns

- **Type**: `Array`
- **Required**: Yes

Column configuration array

### selectionMode

- **Type**: `string`
- **Required**: No

Selection mode ('single', 'multi', 'none')

### sortable

- **Type**: `boolean`
- **Required**: No

Whether columns are sortable

### filterable

- **Type**: `boolean`
- **Required**: No

Whether columns are filterable

### editable

- **Type**: `boolean`
- **Required**: No

Whether cells are editable

### resizable

- **Type**: `boolean`
- **Required**: No

Whether columns are resizable

### reorderable

- **Type**: `boolean`
- **Required**: No

Whether columns can be reordered

### showRowNumbers

- **Type**: `boolean`
- **Required**: No

Whether to show row numbers

### pageSize

- **Type**: `number`
- **Required**: No

Number of rows per page

### autoLoad

- **Type**: `boolean`
- **Required**: No

Whether to load data automatically




## Usage Examples

### Data grid with features


```javascript
const grid = new AiondaWebUI.Grid({
  store: dataStore,
  columns: [
    { field: 'name', text: 'Name', sortable: true },
    { field: 'email', text: 'Email', filterable: true }
  ],
  selectionMode: 'multi',
  editable: true
});
grid.renderTo('#container');
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)