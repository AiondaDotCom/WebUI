# MessageBox



**Since**: 1.0.0

**Category**: Feedback Components

**File**: [`src/components/MessageBox.js`](src/components/MessageBox.js)

---

## Configuration

The following properties can be passed to the component constructor:

### title

- **Type**: `string`
- **Required**: No

Dialog title

### message

- **Type**: `string`
- **Required**: No

Dialog message text

### buttons

- **Type**: `Array`
- **Required**: No

Array of button labels

### icon

- **Type**: `string`
- **Required**: No

Icon to display ('info', 'warning', 'error', 'question')

### fn

- **Type**: `Function`
- **Required**: No

Callback function when dialog is closed

### scope

- **Type**: `Object`
- **Required**: No

Scope for callback function

### modal

- **Type**: `boolean`
- **Required**: No

Whether dialog is modal

### width

- **Type**: `number`
- **Required**: No

Dialog width

### height

- **Type**: `number`
- **Required**: No

Dialog height (auto if not specified)

### closable

- **Type**: `boolean`
- **Required**: No

Whether dialog has close button




## Usage Examples

### Confirmation dialog


```javascript
MessageBox.confirm({
  title: 'Confirm Delete',
  message: 'Are you sure you want to delete this item?',
  buttons: ['Yes', 'No'],
  fn: (result) => {
    if (result === 'yes') deleteItem();
  }
});
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)