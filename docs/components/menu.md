# Menu



**Since**: 1.0.0

**Category**: Navigation Components

**File**: [`src/components/Menu.js`](src/components/Menu.js)

---

## Configuration

The following properties can be passed to the component constructor:

### items

- **Type**: `Array`
- **Required**: No

Array of menu items or separators

### floating

- **Type**: `boolean`
- **Required**: No

Whether menu floats above other content

### shadow

- **Type**: `boolean`
- **Required**: No

Whether to show drop shadow

### cls

- **Type**: `string`
- **Required**: No

Additional CSS classes

### minWidth

- **Type**: `number`
- **Required**: No

Minimum menu width

### allowOtherMenus

- **Type**: `boolean`
- **Required**: No

Whether other menus can be open simultaneously




## Usage Examples

### Context menu with items


```javascript
const menu = new AiondaWebUI.Menu({
  items: [
    { text: 'New', iconCls: 'fas fa-plus', handler: createNew },
    { text: 'Open', iconCls: 'fas fa-folder-open', handler: openFile },
    '-', // separator
    { text: 'Exit', iconCls: 'fas fa-times', handler: exit }
  ]
});
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)