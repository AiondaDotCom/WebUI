# MenuItem



**Since**: 1.0.0

**Category**: Navigation Components

**File**: [`src/components/MenuItem.js`](src/components/MenuItem.js)

---

## Configuration

The following properties can be passed to the component constructor:

### text

- **Type**: `string`
- **Required**: No

Menu item text

### iconCls

- **Type**: `string`
- **Required**: No

CSS class for menu item icon

### handler

- **Type**: `Function`
- **Required**: No

Click handler function

### shortcut

- **Type**: `string`
- **Required**: No

Keyboard shortcut text to display

### disabled

- **Type**: `boolean`
- **Required**: No

Whether menu item is disabled

### checked

- **Type**: `boolean`
- **Required**: No

Whether menu item is checked

### group

- **Type**: `string`
- **Required**: No

Group name for radio-style menu items

### menu

- **Type**: `Menu`
- **Required**: No

Submenu to show on hover

### href

- **Type**: `string`
- **Required**: No

URL for link-style menu items




## Usage Examples

### Menu item with icon and handler


```javascript
const menuItem = new AiondaWebUI.MenuItem({
  text: 'Save',
  iconCls: 'fas fa-save',
  shortcut: 'Ctrl+S',
  handler: saveDocument
});
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)