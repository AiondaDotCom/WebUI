# NumberField



**Since**: 1.0.0

**Category**: Form Components

**File**: [`src/components/NumberField.js`](src/components/NumberField.js)

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

- **Type**: `number`
- **Required**: No

Initial numeric value

### minValue

- **Type**: `number`
- **Required**: No

Minimum allowed value

### maxValue

- **Type**: `number`
- **Required**: No

Maximum allowed value

### allowDecimals

- **Type**: `boolean`
- **Required**: No

Whether to allow decimal values

### allowNegative

- **Type**: `boolean`
- **Required**: No

Whether to allow negative values

### decimalPrecision

- **Type**: `number`
- **Required**: No

Number of decimal places

### decimalSeparator

- **Type**: `string`
- **Required**: No

Character used for decimal separation

### thousandSeparator

- **Type**: `string`
- **Required**: No

Character used for thousand separation

### step

- **Type**: `number`
- **Required**: No

Step increment for spinner buttons

### hideTrigger

- **Type**: `boolean`
- **Required**: No

Whether to hide spinner buttons

### emptyText

- **Type**: `string`
- **Required**: No

Placeholder text




## Usage Examples

### Number field with validation


```javascript
const numberField = new AiondaWebUI.NumberField({
  fieldLabel: 'Age',
  value: 25,
  minValue: 0,
  maxValue: 120,
  allowDecimals: false
});
numberField.renderTo('#container');
```


## See Also

- [Components Overview](../index.md)
- [API Reference](../api/component.md)
- [Examples](../examples/index.md)