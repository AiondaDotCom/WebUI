# Window



**Since**: 1.0.0

**Category**: Layout Components

**File**: [`src/components/Window.js`](src/components/Window.js)

---

## Configuration

The following properties can be passed to the component constructor:

### title

- **Type**: `string`
- **Required**: No

Window title text

### width

- **Type**: `number`
- **Required**: No

Window width in pixels

### height

- **Type**: `number`
- **Required**: No

Window height in pixels

### x

- **Type**: `number`
- **Required**: No

Window x position

### y

- **Type**: `number`
- **Required**: No

Window y position

### modal

- **Type**: `boolean`
- **Required**: No

Whether window is modal

### draggable

- **Type**: `boolean`
- **Required**: No

Whether window can be dragged

### resizable

- **Type**: `boolean`
- **Required**: No

Whether window can be resized

### closable

- **Type**: `boolean`
- **Required**: No

Whether window has close button

### minimizable

- **Type**: `boolean`
- **Required**: No

Whether window can be minimized

### maximizable

- **Type**: `boolean`
- **Required**: No

Whether window can be maximized

### centered

- **Type**: `boolean`
- **Required**: No

Whether to center window on screen

### autoShow

- **Type**: `boolean`
- **Required**: No

Whether to show window automatically

### html

- **Type**: `string`
- **Required**: No

HTML content for window body

### items

- **Type**: `Array`
- **Required**: No

Child components to add to window




## Usage Examples

### Modal window with content


```javascript
const window = new AiondaWebUI.Window({
  title: 'Settings',
  width: 400,
  height: 300,
  modal: true,
  closable: true,
  html: '<div class="p-4">Window content</div>'
});
window.show();
```


## See Also

- [Components Overview](../)
- [API Reference](../api/)
- [Examples](../examples/)