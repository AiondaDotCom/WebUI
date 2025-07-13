# Toolbar



**Since**: 1.0.0

**Category**: Navigation Components

**File**: [`src/components/Toolbar.js`](src/components/Toolbar.js)

---

## Configuration

The following properties can be passed to the component constructor:

### items

- **Type**: `Array`
- **Required**: No

Array of toolbar items (buttons, separators, components)

### layout

- **Type**: `string`
- **Required**: No

Toolbar layout ('hbox', 'vbox')

### enableOverflow

- **Type**: `boolean`
- **Required**: No

Whether to handle overflow with menu

### cls

- **Type**: `string`
- **Required**: No

Additional CSS classes

### defaultType

- **Type**: `string`
- **Required**: No

Default component type for items

### vertical

- **Type**: `boolean`
- **Required**: No

Whether toolbar is vertical




## Usage Examples

### Toolbar with buttons


```javascript
const toolbar = new AiondaWebUI.Toolbar({
  items: [
    { text: 'New', iconCls: 'fas fa-plus' },
    { text: 'Save', iconCls: 'fas fa-save' },
    '-', // separator
    { text: 'Print', iconCls: 'fas fa-print' }
  ]
});
toolbar.renderTo('#toolbar');
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)