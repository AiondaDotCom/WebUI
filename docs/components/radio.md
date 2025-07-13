# Radio



**Since**: 1.0.0

**Category**: Form Components

**File**: [`src/components/Radio.js`](src/components/Radio.js)

---

## Configuration

The following properties can be passed to the component constructor:

### name

- **Type**: `string`
- **Required**: Yes

Input name attribute (required for grouping)

### fieldLabel

- **Type**: `string`
- **Required**: No

Label text displayed above radio

### boxLabel

- **Type**: `string`
- **Required**: No

Label text displayed next to radio

### inputValue

- **Type**: `string`
- **Required**: Yes

Value when radio is selected

### checked

- **Type**: `boolean`
- **Required**: No

Initial checked state

### readOnly

- **Type**: `boolean`
- **Required**: No

Whether radio is read-only

### disabled

- **Type**: `boolean`
- **Required**: No

Whether radio is disabled

### size

- **Type**: `string`
- **Required**: No

Radio size ('sm', 'md', 'lg')




## Usage Examples

### Radio button in a group


```javascript
const radio = new AiondaWebUI.Radio({
  fieldLabel: 'Size',
  boxLabel: 'Large',
  name: 'size',
  inputValue: 'large',
  checked: false
});
radio.renderTo('#container');
```


## See Also

- [Components Overview](../)
- [API Reference](../api/)
- [Examples](../examples/)