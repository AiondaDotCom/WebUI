# Panel



**Since**: 1.0.0

**Category**: Layout Components

**File**: [`src/components/Panel.js`](src/components/Panel.js)

---

## Configuration

The following properties can be passed to the component constructor:

### title

- **Type**: `string`
- **Required**: No

Panel title text

### collapsible

- **Type**: `boolean`
- **Required**: No

Whether panel can be collapsed

### collapsed

- **Type**: `boolean`
- **Required**: No

Initial collapsed state

### header

- **Type**: `boolean`
- **Required**: No

Whether to show header

### headerHeight

- **Type**: `number`
- **Required**: No

Header height in pixels

### padding

- **Type**: `boolean`
- **Required**: No

Whether to add padding to body

### border

- **Type**: `boolean`
- **Required**: No

Whether to show border

### shadow

- **Type**: `boolean`
- **Required**: No

Whether to show shadow

### bodyStyle

- **Type**: `Object`
- **Required**: No

Additional styles for body element

### menu

- **Type**: `Object`
- **Required**: No

Menu configuration

### contextMenu

- **Type**: `Object`
- **Required**: No

Context menu configuration

### items

- **Type**: `Array`
- **Required**: No

Child components to add to panel




## Usage Examples

### Basic panel with items


```javascript
const panel = new AiondaWebUI.Panel({
  title: 'My Panel',
  collapsible: true,
  items: [button1, button2]
});
panel.renderTo('#container');
```


## See Also

- [Components Overview](../)
- [API Reference](../api/)
- [Examples](../examples/)