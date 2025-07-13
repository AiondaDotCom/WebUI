# Toast



**Since**: 1.0.0

**Category**: Feedback Components

**File**: [`src/components/Toast.js`](src/components/Toast.js)

---

## Configuration

The following properties can be passed to the component constructor:

### message

- **Type**: `string`
- **Required**: Yes

Toast message text

### type

- **Type**: `string`
- **Required**: No

Toast type ('info', 'success', 'warning', 'error')

### duration

- **Type**: `number`
- **Required**: No

Duration in milliseconds (0 for permanent)

### position

- **Type**: `string`
- **Required**: No

Toast position ('top-left', 'top-right', 'bottom-left', 'bottom-right')

### closable

- **Type**: `boolean`
- **Required**: No

Whether toast has close button

### iconCls

- **Type**: `string`
- **Required**: No

Custom icon CSS class

### onClick

- **Type**: `Function`
- **Required**: No

Click handler function

### autoHide

- **Type**: `boolean`
- **Required**: No

Whether toast auto-hides after duration




## Usage Examples

### Success notification


```javascript
Toast.show({
  message: 'Data saved successfully!',
  type: 'success',
  duration: 3000,
  position: 'top-right'
});
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)