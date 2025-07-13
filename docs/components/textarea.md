# TextArea



**Since**: 1.0.0

**Category**: Form Components

**File**: [`src/components/TextArea.js`](src/components/TextArea.js)

---

## Configuration

The following properties can be passed to the component constructor:

### name

- **Type**: `string`
- **Required**: No

Input name attribute

### fieldLabel

- **Type**: `string`
- **Required**: No

Label text displayed above field

### value

- **Type**: `string`
- **Required**: No

Initial text value

### placeholder

- **Type**: `string`
- **Required**: No

Placeholder text

### rows

- **Type**: `number`
- **Required**: No

Number of visible rows

### cols

- **Type**: `number`
- **Required**: No

Number of visible columns

### maxLength

- **Type**: `number`
- **Required**: No

Maximum number of characters

### autoResize

- **Type**: `boolean`
- **Required**: No

Whether to auto-resize height

### readOnly

- **Type**: `boolean`
- **Required**: No

Whether field is read-only

### required

- **Type**: `boolean`
- **Required**: No

Whether field is required

### resize

- **Type**: `string`
- **Required**: No

Resize behavior ('none', 'both', 'horizontal', 'vertical')




## Usage Examples

### Auto-resizing text area


```javascript
const textArea = new AiondaWebUI.TextArea({
  fieldLabel: 'Comments',
  placeholder: 'Enter your comments...',
  autoResize: true,
  maxLength: 500
});
textArea.renderTo('#container');
```


## See Also

- [Components Overview](../)
- [API Reference](../api/)
- [Examples](../examples/)