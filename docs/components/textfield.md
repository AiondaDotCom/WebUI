# TextField



**Since**: 1.0.0

**Category**: Form Components

**File**: [`src/components/TextField.js`](src/components/TextField.js)

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

### inputType

- **Type**: `string`
- **Required**: No

HTML input type

### placeholder

- **Type**: `string`
- **Required**: No

Placeholder text

### maxLength

- **Type**: `number`
- **Required**: No

Maximum number of characters

### minLength

- **Type**: `number`
- **Required**: No

Minimum number of characters

### readOnly

- **Type**: `boolean`
- **Required**: No

Whether field is read-only

### required

- **Type**: `boolean`
- **Required**: No

Whether field is required

### vtype

- **Type**: `string`
- **Required**: No

Validation type ('email', 'url', 'alpha', 'alphanum')

### maskRe

- **Type**: `RegExp`
- **Required**: No

Regular expression for input masking

### selectOnFocus

- **Type**: `boolean`
- **Required**: No

Whether to select text on focus




## Usage Examples

### Text field with validation


```javascript
const textField = new AiondaWebUI.TextField({
  fieldLabel: 'Email',
  inputType: 'email',
  required: true,
  vtype: 'email'
});
textField.renderTo('#container');
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)