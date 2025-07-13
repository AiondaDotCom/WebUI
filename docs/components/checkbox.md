# Checkbox



**Since**: 1.0.0

**Category**: Form Components

**File**: [`src/components/Checkbox.js`](src/components/Checkbox.js)

---

## Configuration

The following properties can be passed to the component constructor:

### name

- **Type**: `string`
- **Required**: No

Input name attribute (defaults to component id)

### fieldLabel

- **Type**: `string`
- **Required**: No

Label text displayed above checkbox

### boxLabel

- **Type**: `string`
- **Required**: No

Label text displayed next to checkbox

### value

- **Type**: `string`
- **Required**: No

Value when checkbox is checked

### checked

- **Type**: `boolean`
- **Required**: No

Initial checked state

### inputValue

- **Type**: `string`
- **Required**: No

Value attribute of input element

### uncheckedValue

- **Type**: `string`
- **Required**: No

Value when checkbox is unchecked

### indeterminate

- **Type**: `boolean`
- **Required**: No

Indeterminate state

### readOnly

- **Type**: `boolean`
- **Required**: No

Whether checkbox is read-only

### allowBlank

- **Type**: `boolean`
- **Required**: No

Whether empty value is allowed

### submitValue

- **Type**: `boolean`
- **Required**: No

Whether to submit this field's value

### validators

- **Type**: `Array`
- **Required**: No

Array of validation functions

### labelAlign

- **Type**: `string`
- **Required**: No

Label alignment ('top', 'left', 'right')

### labelWidth

- **Type**: `number`
- **Required**: No

Label width in pixels

### boxLabelAlign

- **Type**: `string`
- **Required**: No

Box label position ('before', 'after')

### checkboxCls

- **Type**: `string`
- **Required**: No

Additional CSS classes for checkbox

### focusCls

- **Type**: `string`
- **Required**: No

CSS class applied on focus

### size

- **Type**: `string`
- **Required**: No

Checkbox size ('sm', 'md', 'lg')

### variant

- **Type**: `string`
- **Required**: No

Checkbox variant ('checkbox', 'switch')




## Usage Examples

### Basic checkbox usage


```javascript
const checkbox = new AiondaWebUI.Checkbox({
  fieldLabel: 'Accept Terms',
  boxLabel: 'I agree to the terms and conditions',
  checked: false,
  variant: 'switch',
  required: true
});
checkbox.renderTo('#container');
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)